-- ============================================================
-- OPERATION 15 — Migration 005
-- XP Events + Rank Promotion Trigger
-- ============================================================

-- ── XP events ledger ─────────────────────────────────────────
create table if not exists public.xp_events (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  amount      integer not null,   -- can be negative (e.g. XP spend for streak recovery)
  source      text not null
                check (source in (
                  'session_complete',
                  'perfect_session',
                  'personal_record',
                  'streak_milestone',
                  'squad_challenge_win',
                  'nutrition_log',
                  'referral',
                  'early_bird',
                  'weekend_warrior',
                  'month_complete',
                  'achievement',
                  'xp_spend',       -- e.g. streak recovery purchase
                  'admin_grant'
                )),
  description text,
  metadata    jsonb default '{}',  -- e.g. { "session_id": "...", "streak_days": 30 }
  created_at  timestamptz not null default now()
);

create index if not exists xp_events_user_idx  on public.xp_events(user_id);
create index if not exists xp_events_date_idx  on public.xp_events(user_id, created_at desc);

alter table public.xp_events enable row level security;

create policy "xp_events_select_own" on public.xp_events
  for select using (auth.uid() = user_id);

-- Insert only via service role (API routes) — no direct client inserts

-- ── Daily XP cap enforcement ──────────────────────────────────
-- Max 200 XP/day from non-workout sources (anti-gaming rule)
create or replace function public.check_daily_xp_cap()
returns trigger language plpgsql as $$
declare
  v_non_workout_xp_today integer;
  v_non_workout_sources text[] := array[
    'nutrition_log', 'referral', 'early_bird', 'weekend_warrior'
  ];
begin
  if new.source = any(v_non_workout_sources) then
    select coalesce(sum(amount), 0)
    into v_non_workout_xp_today
    from xp_events
    where user_id = new.user_id
      and source = any(v_non_workout_sources)
      and created_at::date = current_date;

    if v_non_workout_xp_today + new.amount > 200 then
      -- Cap the award rather than reject
      new.amount := greatest(0, 200 - v_non_workout_xp_today);
    end if;
  end if;
  return new;
end;
$$;

create trigger xp_events_cap
  before insert on public.xp_events
  for each row execute function public.check_daily_xp_cap();

-- ── Auto-promote rank when XP threshold is crossed ───────────
create or replace function public.check_rank_promotion()
returns trigger language plpgsql as $$
declare
  v_next_rank_id    integer;
  v_next_xp_needed  integer;
begin
  -- Only fire when total_xp increases
  if new.total_xp <= old.total_xp then
    return new;
  end if;

  -- Find the highest rank the user has now qualified for
  select id, xp_required
  into v_next_rank_id, v_next_xp_needed
  from ranks
  where xp_required <= new.total_xp
    and id > new.current_rank_id
  order by id desc
  limit 1;

  if found then
    new.current_rank_id := v_next_rank_id;
  end if;

  return new;
end;
$$;

create trigger profiles_rank_promotion
  before update of total_xp on public.profiles
  for each row execute function public.check_rank_promotion();
