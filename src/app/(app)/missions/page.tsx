import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Play, CheckCircle, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Missions" };

/* ── Week 1 mission plan ─────────────────────────────────────── */
const WEEK_PLAN = [
  {
    id: "op-thunder-w1d1",
    day: 1,
    dayLabel: "MON",
    operation: "Operation Thunder",
    title: "Lower Body Power",
    type: "LEGS",
    typeColor: "var(--signal-500)",
    durationMin: 15,
    xpReward: 100,
    estimatedCal: 320,
    difficulty: "Recruit",
    isRest: false,
  },
  {
    id: "op-push-w1d2",
    day: 2,
    dayLabel: "TUE",
    operation: "Operation Push",
    title: "Upper Body Strength",
    type: "PUSH",
    typeColor: "var(--operative-500)",
    durationMin: 15,
    xpReward: 100,
    estimatedCal: 280,
    difficulty: "Recruit",
    isRest: false,
  },
  {
    id: "op-core-w1d3",
    day: 3,
    dayLabel: "WED",
    operation: "Operation Core",
    title: "Core & Stability",
    type: "CORE",
    typeColor: "var(--intel-500)",
    durationMin: 15,
    xpReward: 75,
    estimatedCal: 220,
    difficulty: "Recruit",
    isRest: false,
  },
  {
    id: "recovery-w1d4",
    day: 4,
    dayLabel: "THU",
    operation: "Recovery Mission",
    title: "Active Recovery",
    type: "MOB",
    typeColor: "var(--classified-400)",
    durationMin: 15,
    xpReward: 50,
    estimatedCal: 120,
    difficulty: "Active Rest",
    isRest: false,
  },
  {
    id: "op-pull-w1d5",
    day: 5,
    dayLabel: "FRI",
    operation: "Operation Pull",
    title: "Back & Bicep Power",
    type: "PULL",
    typeColor: "var(--operative-500)",
    durationMin: 15,
    xpReward: 100,
    estimatedCal: 260,
    difficulty: "Recruit",
    isRest: false,
  },
  {
    id: "op-blitz-w1d6",
    day: 6,
    dayLabel: "SAT",
    operation: "Operation Blitz",
    title: "Full Body Cardio",
    type: "CARDIO",
    typeColor: "var(--breach-400)",
    durationMin: 15,
    xpReward: 125,
    estimatedCal: 340,
    difficulty: "Soldier",
    isRest: false,
  },
  {
    id: "rest-w1d7",
    day: 7,
    dayLabel: "SUN",
    operation: "Rest & Recharge",
    title: "Recovery Day",
    type: "REST",
    typeColor: "var(--ground-400)",
    durationMin: 0,
    xpReward: 0,
    estimatedCal: 0,
    difficulty: "Rest Day",
    isRest: true,
  },
] as const;

const TODAY_DAY = 1; // Day 1 of the plan (would be computed from join date in production)

export default async function MissionsPage() {
  const supabase = await createClient();
  const completedIds = new Set<string>();

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: sessions } = await supabase
        .from("session_logs")
        .select("workout_id")
        .eq("user_id", user.id)
        .not("completed_at", "is", null);
      sessions?.forEach((s: { workout_id: string }) => completedIds.add(s.workout_id));
    }
  } catch { /* use defaults */ }

  return (
    <div className="flex flex-col min-h-full p-4 pb-6 max-w-2xl mx-auto">

      {/* Header */}
      <div className="mb-5">
        <h1
          className="font-display font-bold uppercase"
          style={{ fontSize: "clamp(22px, 5vw, 36px)", letterSpacing: "-0.02em", color: "var(--text-primary)" }}
        >
          MISSIONS
        </h1>
        <p className="text-[13px] mt-1" style={{ color: "var(--text-tertiary)" }}>
          8-Week Programme · Week 1 · 15 minutes per day
        </p>
      </div>

      {/* Week progress bar */}
      <div
        className="rounded-[var(--radius-md)] border p-4 mb-5"
        style={{ background: "var(--bg-elevated)", borderColor: "var(--border-default)" }}
      >
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.1em]" style={{ color: "var(--text-disabled)" }}>
            Week 1 Progress
          </p>
          <p className="font-mono text-[12px]" style={{ color: "var(--operative-400)" }}>
            {completedIds.size} / 6 sessions
          </p>
        </div>
        <div className="flex gap-1">
          {WEEK_PLAN.filter(m => !m.isRest).map((mission, i) => (
            <div
              key={mission.id}
              className="flex-1 h-[6px] rounded-full"
              style={{
                background: completedIds.has(mission.id)
                  ? "var(--operative-500)"
                  : i < TODAY_DAY - 1
                  ? "var(--breach-500)"
                  : i === TODAY_DAY - 1
                  ? "var(--signal-500)"
                  : "var(--white-08)",
              }}
            />
          ))}
        </div>
      </div>

      {/* Mission list */}
      <div className="flex flex-col gap-3">
        {WEEK_PLAN.map((mission) => {
          const isComplete = completedIds.has(mission.id);
          const isToday = mission.day === TODAY_DAY;
          const isLocked = mission.day > TODAY_DAY && !isComplete;

          if (mission.isRest) {
            return (
              <div
                key={mission.id}
                className="rounded-[var(--radius-md)] border p-4 flex items-center gap-3"
                style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)", opacity: 0.6 }}
              >
                <div
                  className="w-10 h-10 rounded flex items-center justify-center flex-shrink-0 font-bold text-[11px] uppercase tracking-[0.1em]"
                  style={{ background: "var(--white-06)", color: "var(--text-disabled)" }}
                >
                  {mission.dayLabel}
                </div>
                <div className="flex-1">
                  <p className="text-[13px] font-semibold" style={{ color: "var(--text-disabled)" }}>
                    {mission.title}
                  </p>
                  <p className="text-[11px]" style={{ color: "var(--text-disabled)" }}>
                    Rest & recovery
                  </p>
                </div>
                <Badge variant="default">REST</Badge>
              </div>
            );
          }

          return (
            <div
              key={mission.id}
              className="rounded-[var(--radius-md)] border overflow-hidden"
              style={{
                background: isToday ? "var(--bg-elevated)" : "var(--bg-surface)",
                borderColor: isToday
                  ? "var(--operative-600)"
                  : isComplete
                  ? "var(--operative-800)"
                  : "var(--border-subtle)",
              }}
            >
              {/* Card header */}
              <div className="flex items-start gap-3 p-4 pb-3">
                {/* Day badge */}
                <div
                  className="w-10 h-10 rounded flex items-center justify-center flex-shrink-0 font-bold text-[11px] uppercase tracking-[0.1em]"
                  style={{
                    background: isToday
                      ? "var(--operative-900)"
                      : isComplete
                      ? "var(--operative-900)"
                      : "var(--white-06)",
                    color: isToday || isComplete
                      ? "var(--operative-500)"
                      : "var(--text-disabled)",
                    border: `1px solid ${isToday ? "var(--operative-600)" : "transparent"}`,
                  }}
                >
                  {mission.dayLabel}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span
                      className="text-[9px] font-bold uppercase tracking-[0.12em]"
                      style={{ color: mission.typeColor }}
                    >
                      {mission.type}
                    </span>
                    {isToday && <Badge variant="warning">TODAY</Badge>}
                    {isComplete && <Badge variant="success">✓ DONE</Badge>}
                    {isLocked && (
                      <span className="text-[9px]" style={{ color: "var(--text-disabled)" }}>
                        <Lock className="w-3 h-3 inline mr-0.5" />Upcoming
                      </span>
                    )}
                  </div>
                  <p
                    className="font-display font-bold uppercase text-[16px]"
                    style={{
                      letterSpacing: "-0.01em",
                      color: isLocked ? "var(--text-disabled)" : "var(--text-primary)",
                    }}
                  >
                    {mission.title}
                  </p>
                  <p className="text-[11px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                    {mission.operation}
                  </p>
                </div>

                {/* Duration */}
                <div className="text-right flex-shrink-0">
                  <p className="font-mono font-bold text-[18px]" style={{ color: isLocked ? "var(--text-disabled)" : "var(--operative-400)", lineHeight: 1 }}>
                    {mission.durationMin}
                  </p>
                  <p className="text-[9px] font-bold uppercase tracking-[0.1em]" style={{ color: "var(--text-disabled)" }}>MIN</p>
                </div>
              </div>

              {/* Stats row */}
              <div className="flex items-center gap-3 px-4 pb-3">
                <span className="text-[11px]" style={{ color: "var(--text-disabled)" }}>
                  ~{mission.estimatedCal} cal
                </span>
                <span className="text-[11px]" style={{ color: "var(--text-disabled)" }}>·</span>
                <span className="text-[11px]" style={{ color: "var(--text-disabled)" }}>
                  +{mission.xpReward} XP
                </span>
                <span className="text-[11px]" style={{ color: "var(--text-disabled)" }}>·</span>
                <span className="text-[11px]" style={{ color: "var(--text-disabled)" }}>
                  {mission.difficulty}
                </span>
              </div>

              {/* CTA */}
              {!isLocked && (
                <div className="px-4 pb-4">
                  {isComplete ? (
                    <Link
                      href={`/missions/${mission.id}`}
                      className="h-10 rounded-[var(--radius-sm)] flex items-center justify-center gap-2 text-[12px] font-bold uppercase tracking-[0.06em] no-underline"
                      style={{
                        background: "var(--operative-900)",
                        border: "1px solid var(--operative-800)",
                        color: "var(--operative-600)",
                      }}
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      View Details
                    </Link>
                  ) : (
                    <Link
                      href={`/missions/${mission.id}/active`}
                      className="h-11 rounded-[var(--radius-sm)] flex items-center justify-center gap-2 text-[13px] font-bold uppercase tracking-[0.06em] no-underline"
                      style={{
                        background: isToday ? "var(--operative-500)" : "var(--white-08)",
                        color: isToday ? "var(--ground-950)" : "var(--text-secondary)",
                        border: isToday ? "none" : "1px solid var(--border-default)",
                      }}
                    >
                      <Play className="w-4 h-4" fill="currentColor" aria-hidden />
                      {isToday ? "Start Today's Mission" : "Start Mission"}
                    </Link>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Coming weeks hint */}
      <div
        className="mt-4 rounded-[var(--radius-sm)] border p-3 text-center"
        style={{ borderColor: "var(--border-subtle)", background: "var(--bg-surface)" }}
      >
        <p className="text-[11px]" style={{ color: "var(--text-disabled)" }}>
          Weeks 2–8 unlock as you progress. Complete Week 1 to advance.
        </p>
      </div>
    </div>
  );
}
