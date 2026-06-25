import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { RankLadder } from "@/components/gamification/rank-ladder";
import { AchievementGallery } from "@/components/gamification/achievement-gallery";
import { XpHistory } from "@/components/gamification/xp-history";
import { StreakStrip } from "@/components/dashboard/streak-strip";
import { MetricCard } from "@/components/dashboard/metric-cards";
import { ACHIEVEMENTS_MOCK, XP_HISTORY_MOCK } from "@/lib/ranks";

export const metadata: Metadata = { title: "Ops Center" };

const MOCK = {
  rankId: 1, totalXp: 175, currentStreak: 0, longestStreak: 0,
  sessions: 0, xpThisWeek: 0, caloriesThisWeek: 0, completedDates: [] as string[],
};

export default async function OpsPage() {
  const supabase = await createClient();
  let data = { ...MOCK };

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const [summaryRes, datesRes] = await Promise.all([
        supabase.from("v_dashboard_summary").select("*").eq("user_id", user.id).single(),
        supabase
          .from("session_logs").select("started_at").eq("user_id", user.id)
          .not("completed_at", "is", null)
          .gte("started_at", new Date(Date.now() - 14 * 86400000).toISOString()),
      ]);

      if (summaryRes.data) {
        const s = summaryRes.data as Record<string, unknown>;
        data = {
          rankId:            Number(s.current_rank_id ?? 1),
          totalXp:           Number(s.total_xp ?? 0),
          currentStreak:     Number(s.current_streak ?? 0),
          longestStreak:     Number(s.longest_streak ?? 0),
          sessions:          Number(s.sessions_this_week ?? 0),
          xpThisWeek:        Number(s.xp_this_week ?? 0),
          caloriesThisWeek:  Number(s.calories_this_week ?? 0),
          completedDates:    datesRes.data?.map((r: Record<string, unknown>) => String(r.started_at)) ?? [],
        };
      }
    }
  } catch { /* Supabase not connected — use mock */ }

  return (
    <div className="flex flex-col min-h-full p-4 pb-6 max-w-2xl mx-auto">
      <div className="mb-5">
        <h1
          className="font-display font-bold uppercase"
          style={{ fontSize: "clamp(22px, 5vw, 36px)", letterSpacing: "-0.02em", color: "var(--text-primary)" }}
        >
          OPS CENTER
        </h1>
        <p className="text-[13px] mt-1" style={{ color: "var(--text-tertiary)" }}>
          Track your progress, rank, and achievements.
        </p>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="mb-5 w-full justify-start">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="rank">Rank</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
          <TabsTrigger value="xp">XP Log</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] mb-3" style={{ color: "var(--text-disabled)" }}>
                This Week
              </p>
              <div className="grid grid-cols-3 gap-3">
                <MetricCard label="Sessions"   value={data.sessions}       unit="/ 6"   color="var(--operative-400)" />
                <MetricCard label="XP Earned"  value={data.xpThisWeek}     unit="pts"   color="var(--signal-400)" />
                <MetricCard label="Cal Burned"
                  value={data.caloriesThisWeek >= 1000 ? `${(data.caloriesThisWeek / 1000).toFixed(1)}k` : data.caloriesThisWeek}
                  unit="kcal" color="var(--intel-400)" />
              </div>
            </div>
            <StreakStrip currentStreak={data.currentStreak} longestStreak={data.longestStreak} completedDates={data.completedDates} />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] mb-3" style={{ color: "var(--text-disabled)" }}>
                Recent XP Activity
              </p>
              <div className="rounded-[var(--radius-md)] border p-4" style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}>
                <XpHistory events={XP_HISTORY_MOCK} />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="rank">
          <div className="flex flex-col gap-4">
            <div className="rounded-[var(--radius-md)] border p-4 text-center"
              style={{ background: "var(--operative-900)", borderColor: "var(--operative-800)" }}>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] mb-1" style={{ color: "var(--operative-600)" }}>Total XP</p>
              <p className="font-mono font-bold" style={{ fontSize: "36px", color: "var(--operative-400)", lineHeight: 1 }}>
                {data.totalXp.toLocaleString()}
              </p>
            </div>
            <RankLadder currentRankId={data.rankId} totalXp={data.totalXp} />
          </div>
        </TabsContent>

        <TabsContent value="badges">
          <AchievementGallery achievements={ACHIEVEMENTS_MOCK} />
        </TabsContent>

        <TabsContent value="xp">
          <div className="rounded-[var(--radius-md)] border p-4" style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}>
            <XpHistory events={XP_HISTORY_MOCK} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
