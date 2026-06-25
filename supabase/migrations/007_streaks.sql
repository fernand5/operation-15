-- ============================================================
-- OPERATION 15 — Migration 007
-- Streaks + Streak Shields
-- ============================================================

-- ── Streak shields inventory ──────────────────────────────────
create table if not exists public.streak_shields (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  granted_at  timestamptz not null default now(),
  used_at     timestamptz,              -- null = available
  used_for_date date,                   -- which date was protected
  source      text not null default 'milestone'
                check (source in ('milestone', 'premium', 'achievement'))
);

create index if not exists streak_shields_user_idx on public.streak_shields(user_id)
  where used_at is null;

alter table public.streak_shields enable row level security;

create policy "streak_shields_select_own" on public.streak_shields
  for select using (auth.uid() = user_id);

-- ── Streak maintenance function ───────────────────────────────
-- Called by the session completion API route
create or replace function public.update_streak(p_user_id uuid)
returns jsonb   -- returns { current_streak, longest_streak, shield_used }
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile         record;
  v_today           date := current_date;
  v_yesterday       date := current_date - interval '1 day';
  v_shield_used     boolean := false;
  v_shield_id       uuid;
  v_new_streak      integer;
  v_longest_streak  integer;
begin
  select * into v_profile from profiles where id = p_user_id for update;

  -- Already worked out today — no change needed
  if v_profile.last_workout_date = v_today then
    return jsonb_build_object(
      'current_streak',  v_profile.current_streak,
      'longest_streak',  v_profile.longest_streak,
      'shield_used',     false
    );
  end if;

  -- Continued from yesterday — extend streak
  if v_profile.last_workout_date = v_yesterday then
    v_new_streak := v_profile.current_streak + 1;

  -- Gap of exactly 2 days — try to use a shield
  elsif v_profile.last_workout_date = current_date - interval '2 days' then
    select id into v_shield_id
    from streak_shields
    where user_id = p_user_id and used_at is null
    order by granted_at
    limit 1;

    if found then
      -- Consume the shield
      update streak_shields
      set used_at = now(), used_for_date = v_yesterday
      where id = v_shield_id;

      v_new_streak := v_profile.current_streak + 1;
      v_shield_used := true;
    else
      -- No shield — streak resets
      v_new_streak := 1;
    end if;

  -- Longer gap — streak resets
  else
    v_new_streak := 1;
  end if;

  v_longest_streak := greatest(v_profile.longest_streak, v_new_streak);

  update profiles
  set
    current_streak    = v_new_streak,
    longest_streak    = v_longest_streak,
    last_workout_date = v_today
  where id = p_user_id;

  return jsonb_build_object(
    'current_streak',  v_new_streak,
    'longest_streak',  v_longest_streak,
    'shield_used',     v_shield_used
  );
end;
$$;

-- ── Streak milestone shield grant ─────────────────────────────
-- Fires after streak update; grants a free shield at 14-day milestone
create or replace function public.grant_streak_milestone_shield()
returns trigger language plpgsql as $$
begin
  -- Grant a shield at every 14-day streak milestone
  if new.current_streak % 14 = 0 and new.current_streak > old.current_streak then
    insert into streak_shields (user_id, source)
    values (new.id, 'milestone');
  end if;
  return new;
end;
$$;

create trigger profiles_streak_shield_grant
  after update of current_streak on public.profiles
  for each row execute function public.grant_streak_milestone_shield();
