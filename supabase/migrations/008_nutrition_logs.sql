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
