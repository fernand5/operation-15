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
