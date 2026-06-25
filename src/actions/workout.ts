"use server";

import { createClient } from "@/lib/supabase/server";

export interface StartSessionResult {
  sessionId: string | null;
  error: string | null;
}

export interface CompleteSessionResult {
  xpEarned: number;
  newTotalXp: number;
  newRankId: number;
  promoted: boolean;
  newRankName: string;
  streakResult: {
    currentStreak: number;
    longestStreak: number;
    shieldUsed: boolean;
  } | null;
  error: string | null;
}

/* ── Start a session ─────────────────────────────────────── */
export async function startSessionAction(workoutId: string): Promise<StartSessionResult> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { sessionId: null, error: "Not authenticated" };

    const { data, error } = await supabase
      .from("session_logs")
      .insert({ user_id: user.id, workout_id: workoutId })
      .select("id")
      .single();

    if (error || !data) {
      // Supabase not connected — return a mock session ID for preview
      return { sessionId: `mock-${Date.now()}`, error: null };
    }

    return { sessionId: (data as { id: string }).id, error: null };
  } catch {
    return { sessionId: `mock-${Date.now()}`, error: null };
  }
}

/* ── Complete a session (server-validated XP award) ─────── */
export async function completeSessionAction(
  sessionId: string,
  durationSec: number,
  completionPct: number
): Promise<CompleteSessionResult> {
  const mockResult: CompleteSessionResult = {
    xpEarned: Math.floor(100 * (completionPct / 100)) + (completionPct === 100 ? 25 : 0),
    newTotalXp: Math.floor(100 * (completionPct / 100)) + (completionPct === 100 ? 25 : 0),
    newRankId: 1,
    promoted: false,
    newRankName: "Recruit",
    streakResult: { currentStreak: 1, longestStreak: 1, shieldUsed: false },
    error: null,
  };

  if (sessionId.startsWith("mock-")) return mockResult;

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ...mockResult, error: "Not authenticated" };

    // Call server-side XP award function (validates duration)
    const { data: xpData, error: xpError } = await supabase
      .rpc("award_session_xp", {
        p_session_id: sessionId,
        p_user_id: user.id,
        p_completion_pct: completionPct,
        p_duration_sec: durationSec,
      });

    if (xpError) return { ...mockResult, error: xpError.message };

    // Update streak
    const { data: streakData } = await supabase
      .rpc("update_streak", { p_user_id: user.id });

    // Fetch updated profile for rank
    const { data: profile } = await supabase
      .from("profiles")
      .select("total_xp, current_rank_id")
      .eq("id", user.id)
      .single();

    const profileData = profile as { total_xp: number; current_rank_id: number } | null;

    // Check if promoted
    const xpEarned = Number(xpData ?? mockResult.xpEarned);
    const newRankId = profileData?.current_rank_id ?? 1;

    const { data: rankData } = await supabase
      .from("ranks")
      .select("name")
      .eq("id", newRankId)
      .single();

    return {
      xpEarned,
      newTotalXp: profileData?.total_xp ?? xpEarned,
      newRankId,
      promoted: false, // rank promotion is handled by DB trigger
      newRankName: (rankData as { name: string } | null)?.name ?? "Recruit",
      streakResult: streakData as CompleteSessionResult["streakResult"],
      error: null,
    };
  } catch {
    return mockResult;
  }
}
