-- ============================================================
-- OPERATION 15 — Migration 001
-- Extensions + Rank Seed Data
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Enable pg_cron for scheduled jobs (optional, requires Supabase Pro)
-- create extension if not exists "pg_cron";

-- ── Ranks lookup table (static seed data) ────────────────────
create table if not exists public.ranks (
  id                serial primary key,
  rank_number       integer unique not null check (rank_number between 1 and 8),
  name              text not null,
  xp_required       integer not null,
  insignia_color    text not null,
  description       text,
  unlocks           text[] default '{}',
  created_at        timestamptz default now()
);

-- Seed the 8 ranks
insert into public.ranks (rank_number, name, xp_required, insignia_color, description, unlocks) values
  (1, 'Recruit',     0,      '#7A8FA8', 'Your mission begins. Zero excuses.',
   array['core_workout_library', 'nutrition_tracker']),

  (2, 'Private',     500,    '#A8BBCC', 'You showed up. Now stay.',
   array['streak_shield_x1', 'basic_challenges']),

  (3, 'Corporal',    1200,   '#00E676', 'Discipline is forming.',
   array['squad_creation', 'advanced_workouts_t2']),

  (4, 'Sergeant',    4000,   '#FFB300', 'You lead by example.',
   array['squad_challenges', 'weekly_reports']),

  (5, 'Lieutenant',  10000,  '#5393FF', 'Command is earned, not given.',
   array['squad_of_10', 'challenge_creation']),

  (6, 'Captain',     25000,  '#2979FF', 'Your unit depends on you.',
   array['mentor_badge', 'beta_features']),

  (7, 'Major',       60000,  '#BA52CC', 'The mission never sleeps.',
   array['exclusive_content', 'founding_member_perks']),

  (8, 'Colonel',     120000, '#F8FAFB', 'You are Operation 15.',
   array['lifetime_premium', 'hall_of_fame', 'physical_medal'])
on conflict (rank_number) do nothing;

-- No RLS on ranks — it is public read-only reference data
alter table public.ranks enable row level security;
create policy "ranks_public_read" on public.ranks
  for select using (true);
-- ============================================================
-- OPERATION 15 — Migration 002
-- User Profiles
-- ============================================================

create table if not exists public.profiles (
  id                  uuid primary key references auth.users(id) on delete cascade,
  display_name        text not null,
  avatar_url          text,

  -- Body metrics (used for TDEE)
  weight_kg           numeric(5,2),
  height_cm           numeric(5,2),
  goal_weight_kg      numeric(5,2),
  date_of_birth       date,
  biological_sex      text check (biological_sex in ('male', 'female')),

  -- Display / personalization only — never used in calculations
  gender_identity     text,

  -- Fitness profile
  fitness_level       text not null default 'recruit'
                        check (fitness_level in ('recruit', 'soldier', 'veteran')),
  primary_goal        text not null default 'weight_loss'
                        check (primary_goal in ('weight_loss', 'strength', 'endurance')),

  -- Assessment results (determines initial difficulty, NOT rank)
  assessment_pushups  integer,
  assessment_squats   integer,
  assessment_plank_sec integer,
  assessment_score    integer,   -- 3–12 total points
  initial_difficulty  text check (initial_difficulty in ('t1', 't2', 't3', 't4')),

  -- Gamification (always visible rank starts at Recruit = 1)
  current_rank_id     integer not null default 1 references public.ranks(id),
  total_xp            integer not null default 0 check (total_xp >= 0),

  -- Streaks
  current_streak      integer not null default 0 check (current_streak >= 0),
  longest_streak      integer not null default 0 check (longest_streak >= 0),
  last_workout_date   date,

  -- Subscription
  subscription_tier   text not null default 'free'
                        check (subscription_tier in ('free', 'premium', 'elite')),

  -- Onboarding
  onboarding_complete boolean not null default false,
  onboarding_step     integer not null default 1 check (onboarding_step between 1 and 7),

  -- Ready Player Me avatar
  rpm_avatar_url      text,

  -- Timestamps
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- ── Indexes ──────────────────────────────────────────────────
create index if not exists profiles_rank_idx    on public.profiles(current_rank_id);
create index if not exists profiles_xp_idx      on public.profiles(total_xp desc);
create index if not exists profiles_streak_idx  on public.profiles(current_streak desc);

-- ── updated_at trigger ────────────────────────────────────────
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

-- ── Auto-create profile on sign-up ───────────────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'display_name',
      new.raw_user_meta_data->>'full_name',
      split_part(new.email, '@', 1)
    ),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── RLS ──────────────────────────────────────────────────────
alter table public.profiles enable row level security;

-- Users can read their own profile
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

-- Users can update their own profile
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- Profile is created by the trigger (service role), not by the user
-- No insert policy needed for clients
-- ============================================================
-- OPERATION 15 — Migration 003
-- Exercise Library + Workouts
-- ============================================================

-- ── Exercise library (admin-managed) ─────────────────────────
create table if not exists public.exercise_library (
  id                    uuid primary key default uuid_generate_v4(),
  name                  text not null,
  slug                  text unique not null,

  -- Classification
  category              text not null
                          check (category in ('push','pull','legs','core','cardio','mobility','compound')),
  muscle_groups         text[] not null default '{}',
  difficulty_tier       text not null check (difficulty_tier in ('t1','t2','t3','t4')),

  -- Timing (seconds)
  default_duration_sec  integer not null default 40,
  default_rest_sec      integer not null default 20,
  default_sets          integer not null default 3,

  -- Media
  video_url             text,
  thumbnail_url         text,
  avatar_animation_url  text,   -- Mixamo GLB URL for R3F avatar

  -- Content
  instructions          text not null default '',
  cues                  text[] default '{}',   -- Audio coaching cues

  -- Metadata
  is_active             boolean not null default true,
  created_at            timestamptz not null default now()
);

create index if not exists exercise_category_idx   on public.exercise_library(category);
create index if not exists exercise_difficulty_idx on public.exercise_library(difficulty_tier);
create index if not exists exercise_active_idx     on public.exercise_library(is_active);

-- RLS: exercise library is public read (admin writes via service role)
alter table public.exercise_library enable row level security;
create policy "exercise_library_public_read" on public.exercise_library
  for select using (is_active = true);

-- ── Workouts (admin-managed, 8-week programme) ────────────────
create table if not exists public.workouts (
  id                  uuid primary key default uuid_generate_v4(),
  title               text not null,
  operation_name      text not null,   -- e.g. "Operation Thunder"
  description         text,

  -- Scheduling in the 8-week plan (null = library workout, not scheduled)
  week_number         integer check (week_number between 1 and 8),
  day_number          integer check (day_number between 1 and 7),

  -- Metadata
  duration_seconds    integer not null default 900,   -- always 900 = 15 min
  difficulty          text not null check (difficulty in ('t1','t2','t3','t4')),
  workout_type        text not null
                        check (workout_type in ('push','pull','legs','core','cardio','compound','recovery')),
  xp_reward           integer not null default 100,
  estimated_calories  integer not null default 200,
  tags                text[] default '{}',

  is_active           boolean not null default true,
  created_at          timestamptz not null default now()
);

create index if not exists workouts_week_day_idx on public.workouts(week_number, day_number);
create index if not exists workouts_difficulty_idx on public.workouts(difficulty);

alter table public.workouts enable row level security;
create policy "workouts_public_read" on public.workouts
  for select using (is_active = true);

-- ── Workout exercises join table ──────────────────────────────
-- Defines exact structure of each 15-min workout (Sacred Formula)
create table if not exists public.workout_exercises (
  id            uuid primary key default uuid_generate_v4(),
  workout_id    uuid not null references public.workouts(id) on delete cascade,
  exercise_id   uuid not null references public.exercise_library(id) on delete restrict,

  -- Phase within the Sacred Formula
  phase         text not null
                  check (phase in ('activation','circuit_a','circuit_b','finisher','decompression')),
  position      integer not null,   -- order within phase (1-based)

  -- Override defaults for this specific workout context
  sets          integer,
  reps          integer,
  duration_sec  integer,
  rest_sec      integer,

  notes         text,

  unique (workout_id, phase, position)
);

create index if not exists workout_exercises_workout_idx on public.workout_exercises(workout_id);

alter table public.workout_exercises enable row level security;
create policy "workout_exercises_public_read" on public.workout_exercises
  for select using (true);
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
-- ============================================================
-- OPERATION 15 — Migration 006
-- Achievements + User Achievements
-- ============================================================

-- ── Achievement definitions (admin-managed) ───────────────────
create table if not exists public.achievements (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  description text not null,
  category    text not null
                check (category in (
                  'mission','strength','streak','social',
                  'nutrition','rank','seasonal','elite'
                )),
  badge_url   text,
  xp_bonus    integer not null default 0,
  rarity      text not null default 'common'
                check (rarity in ('common','uncommon','rare','legendary')),

  -- Trigger conditions (evaluated server-side)
  trigger_type  text not null
                  check (trigger_type in (
                    'session_count','streak_days','xp_total',
                    'rank_reached','nutrition_streak','weight_lost',
                    'manual'
                  )),
  trigger_value integer,   -- e.g. 10 sessions, 30-day streak

  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

alter table public.achievements enable row level security;
create policy "achievements_public_read" on public.achievements
  for select using (is_active = true);

-- ── Seed achievements ─────────────────────────────────────────
insert into public.achievements (name, description, category, xp_bonus, rarity, trigger_type, trigger_value) values
  -- Mission
  ('First Blood',       'Complete your first mission.',              'mission',   50,    'common',   'session_count', 1),
  ('10-Mission Patch',  'Complete 10 missions.',                     'mission',   100,   'common',   'session_count', 10),
  ('50-Mission Medal',  'Complete 50 missions.',                     'mission',   300,   'uncommon', 'session_count', 50),
  ('Century Operator',  'Complete 100 missions.',                    'mission',   1000,  'rare',     'session_count', 100),

  -- Streak
  ('Week One Done',     'Maintain a 7-day streak.',                  'streak',    50,    'common',   'streak_days',   7),
  ('Iron Fortnight',    'Maintain a 14-day streak.',                 'streak',    100,   'common',   'streak_days',   14),
  ('30-Day Commendation','Maintain a 30-day streak.',                'streak',    300,   'uncommon', 'streak_days',   30),
  ('Iron Will',         'Maintain a 100-day streak.',                'streak',    1000,  'legendary','streak_days',   100),

  -- Rank
  ('Promoted: Private',     'Reach the rank of Private.',            'rank',      25,    'common',   'rank_reached',  2),
  ('Promoted: Corporal',    'Reach the rank of Corporal.',           'rank',      50,    'common',   'rank_reached',  3),
  ('Promoted: Sergeant',    'Reach the rank of Sergeant.',           'rank',      100,   'uncommon', 'rank_reached',  4),
  ('Promoted: Lieutenant',  'Reach the rank of Lieutenant.',         'rank',      200,   'uncommon', 'rank_reached',  5),
  ('Promoted: Captain',     'Reach the rank of Captain.',            'rank',      500,   'rare',     'rank_reached',  6),
  ('Promoted: Major',       'Reach the rank of Major.',              'rank',      1000,  'rare',     'rank_reached',  7),
  ('Promoted: Colonel',     'Reach the rank of Colonel.',            'rank',      5000,  'legendary','rank_reached',  8),

  -- Nutrition
  ('Hydration Hero',    'Log 8 glasses of water for 7 days.',        'nutrition', 75,    'common',   'nutrition_streak', 7),
  ('Macro Master',      'Log all macros for 14 consecutive days.',   'nutrition', 150,   'uncommon', 'nutrition_streak', 14),

  -- Elite
  ('Perfect Month',     'Complete every mission in a calendar month.','elite',    2000,  'legendary', 'manual', null)
on conflict do nothing;

-- ── User achievements (earned) ────────────────────────────────
create table if not exists public.user_achievements (
  id             uuid primary key default uuid_generate_v4(),
  user_id        uuid not null references public.profiles(id) on delete cascade,
  achievement_id uuid not null references public.achievements(id) on delete cascade,
  earned_at      timestamptz not null default now(),
  notified       boolean not null default false,

  unique (user_id, achievement_id)
);

create index if not exists user_achievements_user_idx on public.user_achievements(user_id);
create index if not exists user_achievements_unnotified_idx on public.user_achievements(user_id, notified)
  where notified = false;

alter table public.user_achievements enable row level security;

create policy "user_achievements_select_own" on public.user_achievements
  for select using (auth.uid() = user_id);

-- Insert via service role only
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
-- ============================================================
-- OPERATION 15 — Migration 008
-- Nutrition Logs + Body Metrics
-- ============================================================

-- ── Daily nutrition logs ──────────────────────────────────────
create table if not exists public.nutrition_logs (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  date        date not null,

  -- Macros (grams)
  calories    integer not null default 0 check (calories >= 0),
  protein_g   numeric(6,2) not null default 0 check (protein_g >= 0),
  carbs_g     numeric(6,2) not null default 0 check (carbs_g >= 0),
  fat_g       numeric(6,2) not null default 0 check (fat_g >= 0),

  -- Hydration
  water_ml    integer not null default 0 check (water_ml >= 0),

  -- One row per user per day
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  unique (user_id, date)
);

create index if not exists nutrition_logs_user_date_idx on public.nutrition_logs(user_id, date desc);

create trigger nutrition_logs_updated_at
  before update on public.nutrition_logs
  for each row execute function public.handle_updated_at();

alter table public.nutrition_logs enable row level security;

create policy "nutrition_logs_select_own" on public.nutrition_logs
  for select using (auth.uid() = user_id);

create policy "nutrition_logs_insert_own" on public.nutrition_logs
  for insert with check (auth.uid() = user_id);

create policy "nutrition_logs_update_own" on public.nutrition_logs
  for update using (auth.uid() = user_id);

-- ── Meal entries (items within a daily log) ───────────────────
create table if not exists public.meal_entries (
  id              uuid primary key default uuid_generate_v4(),
  nutrition_log_id uuid not null references public.nutrition_logs(id) on delete cascade,
  user_id         uuid not null references public.profiles(id) on delete cascade,

  meal_type       text not null
                    check (meal_type in ('breakfast','lunch','dinner','snack')),
  food_name       text not null,
  brand           text,

  -- Nutrition per serving
  serving_size_g  numeric(7,2),
  calories        integer not null check (calories >= 0),
  protein_g       numeric(6,2) not null default 0,
  carbs_g         numeric(6,2) not null default 0,
  fat_g           numeric(6,2) not null default 0,

  -- Open Food Facts barcode (V2)
  barcode         text,

  logged_at       timestamptz not null default now()
);

create index if not exists meal_entries_log_idx  on public.meal_entries(nutrition_log_id);
create index if not exists meal_entries_user_idx on public.meal_entries(user_id);

alter table public.meal_entries enable row level security;

create policy "meal_entries_select_own" on public.meal_entries
  for select using (auth.uid() = user_id);

create policy "meal_entries_insert_own" on public.meal_entries
  for insert with check (auth.uid() = user_id);

create policy "meal_entries_update_own" on public.meal_entries
  for update using (auth.uid() = user_id);

create policy "meal_entries_delete_own" on public.meal_entries
  for delete using (auth.uid() = user_id);

-- ── Body metrics log ──────────────────────────────────────────
create table if not exists public.body_metrics (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  recorded_at   timestamptz not null default now(),
  recorded_date date not null default current_date,

  weight_kg     numeric(5,2) not null check (weight_kg > 0),
  body_fat_pct  numeric(4,2) check (body_fat_pct between 0 and 100),
  notes         text
);

create index if not exists body_metrics_user_date_idx on public.body_metrics(user_id, recorded_date desc);

alter table public.body_metrics enable row level security;

create policy "body_metrics_select_own" on public.body_metrics
  for select using (auth.uid() = user_id);

create policy "body_metrics_insert_own" on public.body_metrics
  for insert with check (auth.uid() = user_id);

create policy "body_metrics_update_own" on public.body_metrics
  for update using (auth.uid() = user_id);

create policy "body_metrics_delete_own" on public.body_metrics
  for delete using (auth.uid() = user_id);

-- ── TDEE calculation function ─────────────────────────────────
-- Mifflin-St Jeor. Uses biological_sex from profiles (never exposed to client).
create or replace function public.calculate_tdee(p_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile record;
  v_age     integer;
  v_bmr     numeric;
  v_tdee    numeric;
  v_target  numeric;
  v_multiplier numeric := 1.375;  -- lightly active (default)
begin
  select * into v_profile from profiles where id = p_user_id;

  if v_profile.date_of_birth is not null then
    v_age := extract(year from age(v_profile.date_of_birth));
  else
    v_age := 30;  -- fallback
  end if;

  -- Mifflin-St Jeor BMR
  if v_profile.biological_sex = 'male' then
    v_bmr := (10 * v_profile.weight_kg) + (6.25 * v_profile.height_cm) - (5 * v_age) + 5;
  elsif v_profile.biological_sex = 'female' then
    v_bmr := (10 * v_profile.weight_kg) + (6.25 * v_profile.height_cm) - (5 * v_age) - 161;
  else
    -- No biological_sex set yet — return null targets
    return jsonb_build_object('bmr', null, 'tdee', null, 'daily_target', null);
  end if;

  v_tdee := v_bmr * v_multiplier;

  -- 400 calorie deficit for ~0.8 lbs/week loss (weight_loss goal)
  if v_profile.primary_goal = 'weight_loss' then
    v_target := v_tdee - 400;
    -- Floor: 1,400 (female) / 1,600 (male)
    v_target := greatest(
      v_target,
      case when v_profile.biological_sex = 'female' then 1400 else 1600 end
    );
  else
    -- Maintenance for strength/endurance goals
    v_target := v_tdee;
  end if;

  return jsonb_build_object(
    'bmr',          round(v_bmr),
    'tdee',         round(v_tdee),
    'daily_target', round(v_target)
  );
end;
$$;
-- ============================================================
-- OPERATION 15 — Migration 009
-- Convenience views (all RLS-aware)
-- ============================================================

-- ── Dashboard summary view ────────────────────────────────────
create or replace view public.v_dashboard_summary
with (security_invoker = true)
as
select
  p.id                                              as user_id,
  p.display_name,
  p.total_xp,
  p.current_streak,
  p.longest_streak,
  p.current_rank_id,
  r.name                                            as rank_name,
  r.xp_required                                     as rank_xp_required,
  -- XP needed for next rank
  nr.xp_required                                    as next_rank_xp_required,
  nr.name                                           as next_rank_name,

  -- This week's stats (ISO week, Mon–Sun)
  coalesce(week_stats.sessions_this_week,  0)       as sessions_this_week,
  coalesce(week_stats.xp_this_week,        0)       as xp_this_week,
  coalesce(week_stats.calories_this_week,  0)       as calories_this_week,

  -- Today's nutrition
  coalesce(today_nut.calories,             0)       as calories_today,
  coalesce(today_nut.water_ml,             0)       as water_ml_today,

  -- Latest body weight
  bm.weight_kg                                      as latest_weight_kg,
  p.goal_weight_kg,

  p.last_workout_date,
  p.onboarding_complete

from profiles p
left join ranks r  on r.id = p.current_rank_id
left join ranks nr on nr.id = p.current_rank_id + 1
left join lateral (
  select
    count(*)                         as sessions_this_week,
    coalesce(sum(xp_earned), 0)      as xp_this_week,
    coalesce(sum(calories_burned), 0) as calories_this_week
  from session_logs sl
  where sl.user_id = p.id
    and sl.completed_at is not null
    and date_trunc('week', sl.completed_at) = date_trunc('week', now())
) week_stats on true
left join lateral (
  select calories, water_ml
  from nutrition_logs nl
  where nl.user_id = p.id and nl.date = current_date
  limit 1
) today_nut on true
left join lateral (
  select weight_kg
  from body_metrics bm2
  where bm2.user_id = p.id
  order by recorded_date desc
  limit 1
) bm on true;

-- ── Weekly session history ────────────────────────────────────
create or replace view public.v_weekly_sessions
with (security_invoker = true)
as
select
  sl.id,
  sl.user_id,
  sl.workout_id,
  w.title               as workout_title,
  w.operation_name,
  w.workout_type,
  sl.started_at,
  sl.completed_at,
  sl.completion_pct,
  sl.xp_earned,
  sl.calories_burned,
  date_trunc('week', sl.completed_at)::date as week_start
from session_logs sl
join workouts w on w.id = sl.workout_id
where sl.completed_at is not null;
