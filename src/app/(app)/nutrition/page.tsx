import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { NutritionClient } from "./nutrition-client";

export const metadata: Metadata = { title: "Field Rations" };
export const dynamic = "force-dynamic";

const MOCK_TDEE = { bmr: 1750, tdee: 2100, daily_target: 1700 };
const MOCK_LOG  = { calories: 480, protein_g: 42, carbs_g: 55, fat_g: 14, water_ml: 750 };

export default async function NutritionPage() {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  let tdee       = MOCK_TDEE;
  let log        = MOCK_LOG;
  let entries: Record<string, unknown>[] = [];
  let latestWeight: number | null = null;
  let goalWeight:   number | null = null;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const [tdeeRes, logRes, entriesRes, weightRes, profileRes] = await Promise.all([
        supabase.rpc("calculate_tdee", { p_user_id: user.id }),
        supabase.from("nutrition_logs").select("*").eq("user_id", user.id).eq("date", today).single(),
        supabase.from("meal_entries").select("*").eq("user_id", user.id)
          .gte("logged_at", `${today}T00:00:00`).order("logged_at"),
        supabase.from("body_metrics").select("weight_kg").eq("user_id", user.id)
          .order("recorded_date", { ascending: false }).limit(1).single(),
        supabase.from("profiles").select("goal_weight_kg").eq("id", user.id).single(),
      ]);

      if (tdeeRes.data)    tdee        = tdeeRes.data as typeof MOCK_TDEE;
      if (logRes.data)     log         = logRes.data  as typeof MOCK_LOG;
      if (entriesRes.data) entries     = entriesRes.data;
      if (weightRes.data)  latestWeight = Number((weightRes.data as Record<string, unknown>).weight_kg);
      if (profileRes.data) goalWeight   = Number((profileRes.data as Record<string, unknown>).goal_weight_kg) || null;
    }
  } catch { /* Supabase not configured — use mock */ }

  const proteinTarget = Math.round(tdee.daily_target * 0.30 / 4);  // 30% protein at 4 kcal/g
  const carbsTarget   = Math.round(tdee.daily_target * 0.40 / 4);  // 40% carbs
  const fatTarget     = Math.round(tdee.daily_target * 0.30 / 9);  // 30% fat at 9 kcal/g

  return (
    <NutritionClient
      caloriesEaten={log.calories ?? 0}
      calorieTarget={tdee.daily_target}
      proteinG={Number(log.protein_g ?? 0)}
      carbsG={Number(log.carbs_g ?? 0)}
      fatG={Number(log.fat_g ?? 0)}
      waterMl={log.water_ml ?? 0}
      proteinTarget={proteinTarget}
      carbsTarget={carbsTarget}
      fatTarget={fatTarget}
      entries={entries as unknown as Parameters<typeof NutritionClient>[0]["entries"]}
      latestWeightKg={latestWeight}
      goalWeightKg={goalWeight}
      tdeeKcal={tdee.tdee}
    />
  );
}
