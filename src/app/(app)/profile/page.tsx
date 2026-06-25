import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ProfileClient } from "./profile-client";
import { getRankById } from "@/lib/ranks";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  const supabase = await createClient();

  const MOCK = {
    displayName: "Operator",
    rankId: 1,
    totalXp: 175,
    currentStreak: 0,
    sessionsTotal: 0,
    rpmAvatarUrl: null as string | null,
  };

  let data = { ...MOCK };

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, current_rank_id, total_xp, current_streak, rpm_avatar_url")
        .eq("id", user.id)
        .single();

      if (profile) {
        const p = profile as Record<string, unknown>;
        data = {
          displayName:   String(p.display_name ?? "Operator"),
          rankId:        Number(p.current_rank_id ?? 1),
          totalXp:       Number(p.total_xp ?? 0),
          currentStreak: Number(p.current_streak ?? 0),
          sessionsTotal: 0,
          rpmAvatarUrl:  p.rpm_avatar_url ? String(p.rpm_avatar_url) : null,
        };
      }
    }
  } catch { /* Supabase not connected */ }

  const rank = getRankById(data.rankId);

  return (
    <ProfileClient
      displayName={data.displayName}
      rankName={rank.name}
      rankId={data.rankId}
      totalXp={data.totalXp}
      currentStreak={data.currentStreak}
      sessionsTotal={data.sessionsTotal}
      rpmAvatarUrl={data.rpmAvatarUrl}
    />
  );
}
