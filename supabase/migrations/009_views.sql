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
