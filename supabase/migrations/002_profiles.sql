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
