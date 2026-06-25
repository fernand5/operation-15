"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface NutritionResult {
  error: string | null;
  success?: boolean;
}

/* ── Get or create today's nutrition log ─────────────────────── */
async function getOrCreateLog(userId: string, supabase: Awaited<ReturnType<typeof createClient>>) {
  const today = new Date().toISOString().split("T")[0];

  const { data: existing } = await supabase
    .from("nutrition_logs")
    .select("*")
    .eq("user_id", userId)
    .eq("date", today)
    .single();

  if (existing) return existing as Record<string, unknown>;

  const { data: created } = await supabase
    .from("nutrition_logs")
    .insert({ user_id: userId, date: today })
    .select("*")
    .single();

  return created as Record<string, unknown>;
}

/* ── Log a meal entry ────────────────────────────────────────── */
export async function logMealAction(
  _prev: NutritionResult,
  formData: FormData
): Promise<NutritionResult> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated." };

    const mealType = formData.get("mealType") as string;
    const foodName = formData.get("foodName") as string;
    const calories = parseInt(formData.get("calories") as string, 10);
    const proteinG = parseFloat(formData.get("proteinG") as string) || 0;
    const carbsG   = parseFloat(formData.get("carbsG")   as string) || 0;
    const fatG     = parseFloat(formData.get("fatG")     as string) || 0;

    if (!foodName || isNaN(calories)) return { error: "Food name and calories are required." };
    if (!["breakfast","lunch","dinner","snack"].includes(mealType)) {
      return { error: "Invalid meal type." };
    }

    const log = await getOrCreateLog(user.id, supabase);

    // Insert meal entry
    const { error: mealError } = await supabase.from("meal_entries").insert({
      nutrition_log_id: String(log.id),
      user_id: user.id,
      meal_type: mealType as "breakfast" | "lunch" | "dinner" | "snack",
      food_name: foodName,
      calories,
      protein_g: proteinG,
      carbs_g: carbsG,
      fat_g: fatG,
    });
    if (mealError) return { error: "Failed to log meal. Try again." };

    // Update daily totals
    await supabase.from("nutrition_logs").update({
      calories: Number(log.calories ?? 0) + calories,
      protein_g: Number(log.protein_g ?? 0) + proteinG,
      carbs_g:   Number(log.carbs_g ?? 0) + carbsG,
      fat_g:     Number(log.fat_g ?? 0) + fatG,
    }).eq("id", String(log.id));

    revalidatePath("/nutrition");
    return { success: true, error: null };
  } catch {
    return { error: "Service unavailable. Try again." };
  }
}

/* ── Log water intake ────────────────────────────────────────── */
export async function logWaterAction(glasses: number): Promise<NutritionResult> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated." };

    const log = await getOrCreateLog(user.id, supabase);
    const mlToAdd = glasses * 250; // 250ml per glass

    await supabase.from("nutrition_logs").update({
      water_ml: Number(log.water_ml ?? 0) + mlToAdd,
    }).eq("id", String(log.id));

    revalidatePath("/nutrition");
    return { success: true, error: null };
  } catch {
    return { error: "Service unavailable. Try again." };
  }
}

/* ── Log body weight ─────────────────────────────────────────── */
export async function logWeightAction(
  _prev: NutritionResult,
  formData: FormData
): Promise<NutritionResult> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated." };

    const weightKg = parseFloat(formData.get("weightKg") as string);
    const unit     = formData.get("unit") as string;
    const notes    = (formData.get("notes") as string)?.trim() || null;

    const finalKg = unit === "imperial" ? weightKg * 0.453592 : weightKg;
    if (isNaN(finalKg) || finalKg < 20 || finalKg > 400) {
      return { error: "Please enter a valid weight." };
    }

    await supabase.from("body_metrics").insert({
      user_id: user.id,
      weight_kg: Math.round(finalKg * 10) / 10,
      notes,
    });

    // Update profile current weight
    await supabase.from("profiles")
      .update({ weight_kg: Math.round(finalKg * 10) / 10 })
      .eq("id", user.id);

    revalidatePath("/nutrition");
    return { success: true, error: null };
  } catch {
    return { error: "Service unavailable. Try again." };
  }
}

/* ── Open Food Facts search ──────────────────────────────────── */
export interface FoodResult {
  name: string;
  brand: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  servingG: number;
  barcode: string;
}

export async function searchFoodAction(query: string): Promise<{ results: FoodResult[]; error: string | null }> {
  if (!query.trim() || query.length < 2) return { results: [], error: null };

  try {
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&action=process&json=1&page_size=8&fields=product_name,brands,nutriments,serving_size,code`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error("API failed");

    const data = await res.json() as { products?: Record<string, unknown>[] };
    const products = data.products ?? [];

    const results: FoodResult[] = products
      .filter((p) => p.product_name && (p.nutriments as Record<string, unknown>)?.["energy-kcal_100g"])
      .map((p) => {
        const n = (p.nutriments as Record<string, unknown>) ?? {};
        return {
          name:      String(p.product_name ?? "Unknown"),
          brand:     String(p.brands ?? ""),
          calories:  Math.round(Number(n["energy-kcal_100g"] ?? 0)),
          proteinG:  Math.round(Number(n["proteins_100g"] ?? 0) * 10) / 10,
          carbsG:    Math.round(Number(n["carbohydrates_100g"] ?? 0) * 10) / 10,
          fatG:      Math.round(Number(n["fat_100g"] ?? 0) * 10) / 10,
          servingG:  100,
          barcode:   String(p.code ?? ""),
        };
      })
      .slice(0, 6);

    return { results, error: null };
  } catch {
    return { results: [], error: "Food search unavailable. Enter manually." };
  }
}
