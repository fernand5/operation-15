import type { Metadata } from "next";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { AtlasBrief } from "@/components/dashboard/atlas-brief";
import { MissionCard } from "@/components/dashboard/mission-card";
import { WeeklyStats } from "@/components/dashboard/metric-cards";
import { RankProgress } from "@/components/dashboard/rank-progress";
import { StreakStrip } from "@/components/dashboard/streak-strip";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";

export const metadata: Metadata = { title: "HQ Dashboard" };

/* ── Mock data used when Supabase is not connected ──────────── */
const MOCK = {
  displayName:   "Operator",
  streak:        0,
  longestStreak: 0,
  rankName:      "Recruit",
  rankNumber:    1,
  totalXp:       0,
  currentRankXp: 0,
  nextRankXp:    500,
  nextRankName:  "Private",
  sessions:      0,
  xpEarned:      0,
  caloriesBurned:0,
  completedDates: [] as string[],
};

async function DashboardContent() {
  const supabase = await createClient();

  let data = { ...MOCK };

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("not-auth");

    // Fetch dashboard summary + completed dates in parallel
    const [summaryRes, sessionsRes] = await Promise.all([
      supabase.from("v_dashboard_summary").select("*").eq("user_id", user.id).single(),
      supabase
        .from("session_logs")
        .select("started_at")
        .eq("user_id", user.id)
        .not("completed_at", "is", null)
        .gte("started_at", new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()),
    ]);

    if (summaryRes.data) {
      const s = summaryRes.data as Record<string, unknown>;
      data = {
        displayName:    String(s.display_name ?? "Operator"),
        streak:         Number(s.current_streak ?? 0),
        longestStreak:  Number(s.longest_streak ?? 0),
        rankName:       String(s.rank_name ?? "Recruit"),
        rankNumber:     Number(s.current_rank_id ?? 1),
        totalXp:        Number(s.total_xp ?? 0),
        currentRankXp:  Number(s.rank_xp_required ?? 0),
        nextRankXp:     s.next_rank_xp_required != null ? Number(s.next_rank_xp_required) : null as unknown as number,
        nextRankName:   s.next_rank_name ? String(s.next_rank_name) : null as unknown as string,
        sessions:       Number(s.sessions_this_week ?? 0),
        xpEarned:       Number(s.xp_this_week ?? 0),
        caloriesBurned: Number(s.calories_this_week ?? 0),
        completedDates: sessionsRes.data?.map(
          (r: Record<string, unknown>) => String(r.started_at)
        ) ?? [],
      };
    }
  } catch {
    // Supabase not connected — fall back to mock data
  }

  return (
    <div className="flex flex-col gap-4 p-4 pb-6 max-w-2xl mx-auto">
      {/* ATLAS daily brief */}
      <AtlasBrief streak={data.streak} displayName={data.displayName} />

      {/* Today's mission */}
      <div>
        <div
          className="flex items-center justify-between mb-3 pb-3 border-b"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          <p
            className="text-[11px] font-bold uppercase tracking-[0.12em]"
            style={{ color: "var(--text-disabled)" }}
          >
            Today&apos;s Mission
          </p>
          <p
            className="text-[11px]"
            style={{ color: "var(--text-tertiary)" }}
          >
            Day 1 of 56
          </p>
        </div>
        <MissionCard
          workoutId="op-thunder-w1d1"
          operationName="Operation Thunder"
          title="Lower Body Power"
          durationMin={15}
          estimatedCalories={320}
          xpReward={100}
          difficulty="t1"
          weekNumber={1}
          dayNumber={1}
        />
      </div>

      {/* This week's stats */}
      <div>
        <p
          className="text-[11px] font-bold uppercase tracking-[0.12em] mb-3"
          style={{ color: "var(--text-disabled)" }}
        >
          This Week
        </p>
        <WeeklyStats
          sessions={data.sessions}
          xpEarned={data.xpEarned}
          caloriesBurned={data.caloriesBurned}
        />
      </div>

      {/* Streak calendar */}
      <StreakStrip
        currentStreak={data.streak}
        longestStreak={data.longestStreak}
        completedDates={data.completedDates}
      />

      {/* Rank progress */}
      <RankProgress
        rankName={data.rankName}
        rankNumber={data.rankNumber}
        totalXp={data.totalXp}
        currentRankXp={data.currentRankXp}
        nextRankXp={data.nextRankXp}
        nextRankName={data.nextRankName}
      />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}
