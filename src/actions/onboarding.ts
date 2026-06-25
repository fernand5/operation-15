"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface OnboardingResult {
  error: string | null;
  success?: boolean;
}

/* ── Shared helper ───────────────────────────────────────────── */
async function getAuthenticatedUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Unauthenticated");
  return { supabase, user };
}

/* ── Step 1: Goal ────────────────────────────────────────────── */
export async function saveGoalAction(
  _prev: OnboardingResult,
  formData: FormData
): Promise<OnboardingResult> {
  try {
    const { supabase, user } = await getAuthenticatedUser();

    const primaryGoal = formData.get("primaryGoal") as string;
    if (!["weight_loss", "strength", "endurance"].includes(primaryGoal)) {
      return { error: "Please select a mission objective." };
    }

    const { error } = await supabase
      .from("profiles")
      .update({ primary_goal: primaryGoal as "weight_loss" | "strength" | "endurance", onboarding_step: 2 })
      .eq("id", user.id);

    if (error) return { error: "Failed to save. Please try again." };

    redirect("/onboarding/2");
  } catch (err) {
    if (err instanceof Error && err.message === "NEXT_REDIRECT") throw err;
    return { error: "Service unavailable. Please try again." };
  }
}

/* ── Step 2: Body metrics ────────────────────────────────────── */
export async function saveMetricsAction(
  _prev: OnboardingResult,
  formData: FormData
): Promise<OnboardingResult> {
  try {
    const { supabase, user } = await getAuthenticatedUser();

    const biologicalSex = formData.get("biologicalSex") as string;
    const ageStr        = formData.get("age") as string;
    const weightStr     = formData.get("weight") as string;
    const heightStr     = formData.get("height") as string;
    const goalWeightStr = formData.get("goalWeight") as string;
    const unit          = formData.get("unit") as "metric" | "imperial";

    if (!biologicalSex || !ageStr || !weightStr || !heightStr) {
      return { error: "Biological sex, age, weight, and height are required." };
    }
    if (!["male", "female"].includes(biologicalSex)) {
      return { error: "Please select a biological sex." };
    }

    const age = parseInt(ageStr, 10);
    if (isNaN(age) || age < 13 || age > 100) {
      return { error: "Please enter a valid age (13–100)." };
    }

    // Convert to metric for storage
    let weightKg  = parseFloat(weightStr);
    let heightCm  = parseFloat(heightStr);
    let goalWeightKg = goalWeightStr ? parseFloat(goalWeightStr) : null;

    if (unit === "imperial") {
      weightKg     = weightKg * 0.453592;      // lbs → kg
      heightCm     = heightCm * 30.48;         // ft → cm (user enters ft)
      if (goalWeightKg) goalWeightKg = goalWeightKg * 0.453592;
    }

    if (isNaN(weightKg) || weightKg < 20 || weightKg > 400) {
      return { error: "Please enter a valid weight." };
    }
    if (isNaN(heightCm) || heightCm < 100 || heightCm > 250) {
      return { error: "Please enter a valid height." };
    }

    const dob = new Date();
    dob.setFullYear(dob.getFullYear() - age);

    const { error } = await supabase
      .from("profiles")
      .update({
        biological_sex:  biologicalSex as "male" | "female",
        weight_kg:       Math.round(weightKg * 10) / 10,
        height_cm:       Math.round(heightCm * 10) / 10,
        goal_weight_kg:  goalWeightKg ? Math.round(goalWeightKg * 10) / 10 : null,
        date_of_birth:   dob.toISOString().split("T")[0],
        onboarding_step: 3,
      })
      .eq("id", user.id);

    if (error) return { error: "Failed to save. Please try again." };

    redirect("/onboarding/3");
  } catch (err) {
    if (err instanceof Error && err.message === "NEXT_REDIRECT") throw err;
    return { error: "Service unavailable. Please try again." };
  }
}

/* ── Step 3: Gender identity (optional) ──────────────────────── */
export async function saveGenderAction(
  _prev: OnboardingResult,
  formData: FormData
): Promise<OnboardingResult> {
  try {
    const { supabase, user } = await getAuthenticatedUser();

    const genderIdentity = (formData.get("genderIdentity") as string)?.trim() || null;

    const { error } = await supabase
      .from("profiles")
      .update({ gender_identity: genderIdentity, onboarding_step: 4 })
      .eq("id", user.id);

    if (error) return { error: "Failed to save. Please try again." };

    redirect("/onboarding/4");
  } catch (err) {
    if (err instanceof Error && err.message === "NEXT_REDIRECT") throw err;
    return { error: "Service unavailable. Please try again." };
  }
}

/* ── Step 4: Fitness level ───────────────────────────────────── */
export async function saveFitnessLevelAction(
  _prev: OnboardingResult,
  formData: FormData
): Promise<OnboardingResult> {
  try {
    const { supabase, user } = await getAuthenticatedUser();

    const fitnessLevel = formData.get("fitnessLevel") as string;
    if (!["recruit", "soldier", "veteran"].includes(fitnessLevel)) {
      return { error: "Please select your fitness level." };
    }

    const { error } = await supabase
      .from("profiles")
      .update({ fitness_level: fitnessLevel as "recruit" | "soldier" | "veteran", onboarding_step: 5 })
      .eq("id", user.id);

    if (error) return { error: "Failed to save. Please try again." };

    redirect("/onboarding/5");
  } catch (err) {
    if (err instanceof Error && err.message === "NEXT_REDIRECT") throw err;
    return { error: "Service unavailable. Please try again." };
  }
}

/* ── Step 5: Baseline assessment ─────────────────────────────── */
function scoreAssessment(pushups: number, squats: number, plankSec: number): {
  score: number;
  difficulty: "t1" | "t2" | "t3" | "t4";
} {
  let pushupsPoints = pushups >= 31 ? 4 : pushups >= 21 ? 3 : pushups >= 11 ? 2 : 1;
  let squatsPoints  = squats  >= 46 ? 4 : squats  >= 31 ? 3 : squats  >= 16 ? 2 : 1;
  let plankPoints   = plankSec >= 91 ? 4 : plankSec >= 61 ? 3 : plankSec >= 31 ? 2 : 1;

  const score = pushupsPoints + squatsPoints + plankPoints;

  let difficulty: "t1" | "t2" | "t3" | "t4";
  if (score <= 4)       difficulty = "t1";
  else if (score <= 6)  difficulty = "t1";
  else if (score <= 8)  difficulty = "t2";
  else if (score <= 10) difficulty = "t3";
  else                  difficulty = "t3";

  return { score, difficulty };
}

export async function saveAssessmentAction(
  _prev: OnboardingResult,
  formData: FormData
): Promise<OnboardingResult> {
  try {
    const { supabase, user } = await getAuthenticatedUser();

    const pushups  = parseInt(formData.get("pushups")  as string, 10) || 0;
    const squats   = parseInt(formData.get("squats")   as string, 10) || 0;
    const plankSec = parseInt(formData.get("plankSec") as string, 10) || 0;

    const { score, difficulty } = scoreAssessment(pushups, squats, plankSec);

    const { error } = await supabase
      .from("profiles")
      .update({
        assessment_pushups:   pushups,
        assessment_squats:    squats,
        assessment_plank_sec: plankSec,
        assessment_score:     score,
        initial_difficulty:   difficulty,
        onboarding_step:      6,
      })
      .eq("id", user.id);

    if (error) return { error: "Failed to save assessment. Please try again." };

    redirect("/onboarding/6");
  } catch (err) {
    if (err instanceof Error && err.message === "NEXT_REDIRECT") throw err;
    return { error: "Service unavailable. Please try again." };
  }
}

/* ── Step 6: Skip rank reveal (just advance) ─────────────────── */
export async function advanceToStep7Action(): Promise<void> {
  const { supabase, user } = await getAuthenticatedUser();
  await supabase.from("profiles").update({ onboarding_step: 7 }).eq("id", user.id);
  redirect("/onboarding/7");
}

/* ── Step 7: Complete onboarding ─────────────────────────────── */
export async function completeOnboardingAction(): Promise<void> {
  const { supabase, user } = await getAuthenticatedUser();
  await supabase
    .from("profiles")
    .update({ onboarding_complete: true, onboarding_step: 7 })
    .eq("id", user.id);
  revalidatePath("/", "layout");
  redirect("/dashboard");
}
