import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TopNav } from "@/components/navigation/top-nav";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { AchievementToastProvider } from "@/components/gamification/achievement-toast";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  let displayName = "Operator";
  let streak = 0;
  let initials = "OP";

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name, current_streak, onboarding_complete")
      .eq("id", user.id)
      .single();

    if (profile) {
      if (!profile.onboarding_complete) redirect("/onboarding/1");
      displayName = profile.display_name ?? "Operator";
      streak = profile.current_streak ?? 0;
      initials = displayName
        .split(" ")
        .map((w: string) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
  } catch (err) {
    // Re-throw Next.js redirect/notFound signals — never swallow them
    if (
      err instanceof Error &&
      (err.message === "NEXT_REDIRECT" || err.message === "NEXT_NOT_FOUND" ||
       (err as { digest?: string }).digest?.startsWith("NEXT_REDIRECT"))
    ) {
      throw err;
    }
    // Supabase unreachable — show shell with defaults
  }

  return (
    <AchievementToastProvider>
      <div
        className="h-dvh flex flex-col overflow-hidden"
        style={{ background: "var(--bg-page)" }}
      >
        <TopNav streak={streak} displayName={displayName} initials={initials} />

        <main
          id="main-content"
          className="flex-1 overflow-y-auto"
        >
          {children}
        </main>

        <BottomNav />
      </div>
    </AchievementToastProvider>
  );
}
