-- ============================================================
-- OPERATION 15 — Migration 004
-- Session Logs + Exercise Progress
-- ============================================================

-- ── Session logs ──────────────────────────────────────────────
create table if not exists public.session_logs (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid not null references public.profiles(id) on delete cascade,
  workout_id        uuid not null references public.workouts(id) on delete restrict,

  -- Timing
  started_at        timestamptz not null default now(),
  completed_at      timestamptz,   -- null = abandoned or in-progress

  -- Completion quality
  completion_pct    numeric(5,2) not null default 0
                      check (completion_pct between 0 and 100),
  duration_actual_sec integer,     -- actual time taken (may differ from 900)

  -- Rewards (server-computed, validated — not client-sent)
  xp_earned         integer not null default 0 check (xp_earned >= 0),
  calories_burned   integer,

  -- Wearable data (V2)
  avg_heart_rate    integer,
  max_heart_rate    integer,

  notes             text,
  created_at        timestamptz not null default now()
);

create index if not exists session_logs_user_idx      on public.session_logs(user_id);
create index if not exists session_logs_workout_idx   on public.session_logs(workout_id);
create index if not exists session_logs_date_idx      on public.session_logs(user_id, started_at desc);
create index if not exists session_logs_completed_idx on public.session_logs(user_id, completed_at)
  where completed_at is not null;

alter table public.session_logs enable row level security;

create policy "session_logs_select_own" on public.session_logs
  for select using (auth.uid() = user_id);

create policy "session_logs_insert_own" on public.session_logs
  for insert with check (auth.uid() = user_id);

-- Update only allowed on own rows (e.g. to set completed_at)
-- XP is set server-side via service role
create policy "session_logs_update_own" on public.session_logs
  for update using (auth.uid() = user_id);

-- ── Exercise progress (per-exercise performance log) ──────────
create table if not exists public.exercise_progress (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  session_id      uuid not null references public.session_logs(id) on delete cascade,
  exercise_id     uuid not null references public.exercise_library(id) on delete restrict,

  -- What was done
  sets_completed  integer not null default 0,
  reps_completed  integer,
  duration_sec    integer,
  hold_sec        integer,         -- for plank/static holds

  -- Performance flags
  is_personal_record boolean not null default false,
  difficulty_felt text check (difficulty_felt in ('too_easy','just_right','too_hard')),

  recorded_at     timestamptz not null default now()
);

create index if not exists exercise_progress_user_idx     on public.exercise_progress(user_id);
create index if not exists exercise_progress_session_idx  on public.exercise_progress(session_id);
create index if not exists exercise_progress_exercise_idx on public.exercise_progress(user_id, exercise_id);

alter table public.exercise_progress enable row level security;

create policy "exercise_progress_select_own" on public.exercise_progress
  for select using (auth.uid() = user_id);

create policy "exercise_progress_insert_own" on public.exercise_progress
  for insert with check (auth.uid() = user_id);

-- ── Server-side XP award function (called by API route) ───────
-- Validates session duration before awarding XP (anti-cheat)
create or replace function public.award_session_xp(
  p_session_id    uuid,
  p_user_id       uuid,
  p_completion_pct numeric,
  p_duration_sec  integer
)
returns integer   -- returns xp_earned
language plpgsql
security definer
set search_path = public
as $$
declare
  v_workout_duration integer;
  v_base_xp          integer;
  v_xp_earned        integer;
  v_tolerance        numeric := 1.25;   -- allow 25% longer than expected
begin
  -- Validate session belongs to user
  if not exists (
    select 1 from session_logs
    where id = p_session_id and user_id = p_user_id
  ) then
    raise exception 'Session not found or unauthorized';
  end if;

  -- Get expected workout duration
  select w.duration_seconds, w.xp_reward
  into v_workout_duration, v_base_xp
  from session_logs sl
  join workouts w on w.id = sl.workout_id
  where sl.id = p_session_id;

  -- Anti-cheat: session must have taken at least 50% of expected time
  if p_duration_sec < (v_workout_duration * 0.5) then
    raise exception 'Session duration too short — possible cheating detected';
  end if;

  -- XP scales with completion percentage
  v_xp_earned := floor(v_base_xp * (p_completion_pct / 100.0));

  -- Bonus for perfect completion
  if p_completion_pct = 100 then
    v_xp_earned := v_xp_earned + 25;
  end if;

  -- Update session log
  update session_logs
  set
    completed_at    = now(),
    completion_pct  = p_completion_pct,
    duration_actual_sec = p_duration_sec,
    xp_earned       = v_xp_earned
  where id = p_session_id;

  -- Update user total XP and last workout date
  update profiles
  set
    total_xp         = total_xp + v_xp_earned,
    last_workout_date = current_date
  where id = p_user_id;

  return v_xp_earned;
end;
$$;
