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
