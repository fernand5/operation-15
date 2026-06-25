"use client";

import { useState } from "react";
import { MacroRing, MacroPill } from "@/components/nutrition/macro-ring";
import { WaterTracker } from "@/components/nutrition/water-tracker";
import { MealList } from "@/components/nutrition/meal-list";
import { FoodSearch } from "@/components/nutrition/food-search";
import { WeightLogForm } from "@/components/nutrition/weight-log-form";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Scale } from "lucide-react";

interface MealEntryRow {
  id: string;
  meal_type: string;
  food_name: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

interface NutritionClientProps {
  caloriesEaten: number;
  calorieTarget: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  waterMl: number;
  proteinTarget: number;
  carbsTarget: number;
  fatTarget: number;
  entries: MealEntryRow[];
  latestWeightKg: number | null;
  goalWeightKg: number | null;
  tdeeKcal: number;
}

export function NutritionClient({
  caloriesEaten, calorieTarget,
  proteinG, carbsG, fatG, waterMl,
  proteinTarget, carbsTarget, fatTarget,
  entries, latestWeightKg, goalWeightKg, tdeeKcal,
}: NutritionClientProps) {
  const [showFoodSearch,  setShowFoodSearch]  = useState(false);
  const [showWeightLog,   setShowWeightLog]   = useState(false);

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <>
      {showFoodSearch && <FoodSearch onClose={() => setShowFoodSearch(false)} />}

      <div className="flex flex-col min-h-full p-4 pb-6 max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="font-display font-bold uppercase"
              style={{ fontSize: "clamp(20px, 5vw, 32px)", letterSpacing: "-0.02em", color: "var(--text-primary)" }}>
              FIELD RATIONS
            </h1>
            <p className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>{today}</p>
          </div>
          <button
            onClick={() => setShowWeightLog((v) => !v)}
            className="flex items-center gap-1.5 px-3 h-9 rounded-[var(--radius-sm)] text-[11px] font-bold uppercase tracking-[0.06em] transition-colors"
            style={{
              background: showWeightLog ? "var(--operative-900)" : "var(--white-08)",
              border: `1px solid ${showWeightLog ? "var(--operative-600)" : "var(--border-default)"}`,
              color: showWeightLog ? "var(--operative-500)" : "var(--text-secondary)",
            }}
          >
            <Scale className="w-3.5 h-3.5" />
            Weight
          </button>
        </div>

        {/* Weight log form (inline) */}
        {showWeightLog && (
          <div className="rounded-[var(--radius-md)] border p-4 mb-5"
            style={{ background: "var(--bg-elevated)", borderColor: "var(--border-default)" }}>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] mb-3"
              style={{ color: "var(--text-disabled)" }}>
              Log Today&apos;s Weight
            </p>
            <WeightLogForm
              latestWeightKg={latestWeightKg}
              goalWeightKg={goalWeightKg}
              onClose={() => setShowWeightLog(false)}
            />
          </div>
        )}

        <Tabs defaultValue="today">
          <TabsList className="mb-4 w-full justify-start">
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="macros">Macros</TabsTrigger>
            <TabsTrigger value="water">Hydration</TabsTrigger>
          </TabsList>

          {/* ── Today tab ── */}
          <TabsContent value="today">
            <div className="flex flex-col gap-4">
              {/* Calorie ring */}
              <div className="rounded-[var(--radius-md)] border p-4"
                style={{ background: "var(--bg-elevated)", borderColor: "var(--border-default)" }}>
                <MacroRing
                  calories={caloriesEaten}
                  target={calorieTarget}
                  proteinG={proteinG}
                  carbsG={carbsG}
                  fatG={fatG}
                  proteinTarget={proteinTarget}
                  carbsTarget={carbsTarget}
                  fatTarget={fatTarget}
                />

                {/* TDEE note */}
                <div className="mt-3 pt-3 border-t" style={{ borderColor: "var(--border-subtle)" }}>
                  <p className="text-[10px]" style={{ color: "var(--text-disabled)" }}>
                    TDEE: {tdeeKcal.toLocaleString()} kcal/day · Target: {calorieTarget.toLocaleString()} kcal (−400 deficit)
                  </p>
                </div>
              </div>

              {/* Macro pills */}
              <div className="grid grid-cols-3 gap-2">
                <MacroPill label="Protein" value={proteinG} target={proteinTarget} unit="g"
                  color="var(--operative-400)" bgColor="var(--operative-900)" />
                <MacroPill label="Carbs"   value={carbsG}   target={carbsTarget}   unit="g"
                  color="var(--intel-400)"    bgColor="var(--intel-900)" />
                <MacroPill label="Fat"     value={fatG}     target={fatTarget}     unit="g"
                  color="var(--signal-400)"   bgColor="var(--signal-900)" />
              </div>

              {/* Water summary */}
              <div className="flex items-center gap-3 rounded-[var(--radius-sm)] border p-3"
                style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}>
                <span className="text-xl">💧</span>
                <div className="flex-1">
                  <p className="text-[12px] font-semibold" style={{ color: "var(--intel-400)" }}>
                    {Math.floor(waterMl / 250)} / 8 glasses
                  </p>
                  <p className="text-[10px]" style={{ color: "var(--text-disabled)" }}>
                    {waterMl}ml hydrated today
                  </p>
                </div>
              </div>

              {/* Meals */}
              <MealList entries={entries} onAddMeal={() => setShowFoodSearch(true)} />
            </div>
          </TabsContent>

          {/* ── Macros tab ── */}
          <TabsContent value="macros">
            <div className="flex flex-col gap-4">
              <div className="rounded-[var(--radius-md)] border p-5"
                style={{ background: "var(--bg-elevated)", borderColor: "var(--border-default)" }}>
                <MacroRing
                  calories={caloriesEaten} target={calorieTarget}
                  proteinG={proteinG} carbsG={carbsG} fatG={fatG}
                  proteinTarget={proteinTarget} carbsTarget={carbsTarget} fatTarget={fatTarget}
                  size={140}
                />
              </div>

              {/* Macro breakdown */}
              <div className="flex flex-col gap-2">
                {[
                  { label: "Protein", value: proteinG, target: proteinTarget, color: "var(--operative-500)", kcal: proteinG * 4, pct: 30 },
                  { label: "Carbohydrates", value: carbsG, target: carbsTarget, color: "var(--intel-500)", kcal: carbsG * 4, pct: 40 },
                  { label: "Fat", value: fatG, target: fatTarget, color: "var(--signal-500)", kcal: fatG * 9, pct: 30 },
                ].map(({ label, value, target, color, kcal, pct }) => (
                  <div key={label} className="rounded-[var(--radius-sm)] border p-4"
                    style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-[13px] font-semibold" style={{ color: "var(--text-primary)" }}>{label}</p>
                        <p className="text-[10px]" style={{ color: "var(--text-disabled)" }}>
                          Target: {pct}% · {target}g · {target * (label === "Fat" ? 9 : 4)} kcal
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono font-bold text-[16px]" style={{ color }}>{value}g</p>
                        <p className="text-[10px]" style={{ color: "var(--text-disabled)" }}>{kcal} kcal</p>
                      </div>
                    </div>
                    <div className="h-[4px] rounded-full overflow-hidden" style={{ background: "var(--white-08)" }}>
                      <div className="h-full rounded-full" style={{
                        width: `${Math.min(100, target > 0 ? (value / target) * 100 : 0)}%`,
                        background: color,
                      }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Military macro framework reference */}
              <div className="rounded-[var(--radius-sm)] border p-3"
                style={{ background: "var(--intel-900)", borderColor: "var(--intel-800)" }}>
                <p className="text-[10px] font-bold uppercase tracking-[0.1em] mb-1"
                  style={{ color: "var(--intel-600)" }}>
                  Field Rations Formula (Fat Loss)
                </p>
                <p className="text-[11px]" style={{ color: "var(--intel-400)" }}>
                  Protein 40% · Fat 30% · Carbs 30% · Protein = bodyweight × 0.8g
                </p>
              </div>
            </div>
          </TabsContent>

          {/* ── Hydration tab ── */}
          <TabsContent value="water">
            <div className="flex flex-col gap-4">
              <WaterTracker waterMl={waterMl} />
              <div className="rounded-[var(--radius-sm)] border p-3"
                style={{ background: "var(--intel-900)", borderColor: "var(--intel-800)" }}>
                <p className="text-[10px] font-bold uppercase tracking-[0.1em] mb-1"
                  style={{ color: "var(--intel-600)" }}>
                  Hydration Intel
                </p>
                <p className="text-[11px]" style={{ color: "var(--intel-400)" }}>
                  Aim for 2–3L daily. Log each 250ml glass with the + button. Dehydration reduces performance by up to 20%.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
