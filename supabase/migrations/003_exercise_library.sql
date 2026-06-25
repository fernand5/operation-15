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
