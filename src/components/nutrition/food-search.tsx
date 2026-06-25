"use client";

import { useState, useTransition, useActionState } from "react";
import { searchFoodAction, logMealAction } from "@/actions/nutrition";
import type { FoodResult } from "@/actions/nutrition";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FieldError } from "@/components/states/error-state";
import { Search, X, Check } from "lucide-react";

const MEAL_TYPES = [
  { value: "breakfast", label: "Breakfast" },
  { value: "lunch",     label: "Lunch" },
  { value: "dinner",    label: "Dinner" },
  { value: "snack",     label: "Snack" },
];

const initialState = { error: null as string | null, success: false };

interface FoodSearchProps {
  onClose: () => void;
}

export function FoodSearch({ onClose }: FoodSearchProps) {
  const [logState, logAction, isLogging] = useActionState(logMealAction, initialState);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FoodResult[]>([]);
  const [selected, setSelected] = useState<FoodResult | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isSearching, startSearch] = useTransition();
  const [mealType, setMealType] = useState("breakfast");

  // Close on success
  if (logState?.success) {
    setTimeout(onClose, 300);
  }

  function handleSearch() {
    if (!query.trim()) return;
    setSearchError(null);
    startSearch(async () => {
      const { results: r, error } = await searchFoodAction(query);
      setResults(r);
      if (error) setSearchError(error);
    });
  }

  function selectFood(food: FoodResult) {
    setSelected(food);
    setResults([]);
    setQuery(food.name);
  }

  return (
    <div className="fixed inset-0 z-[var(--z-modal)] flex flex-col"
      style={{ background: "var(--bg-page)" }}>

      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b flex-shrink-0"
        style={{ background: "var(--bg-overlay)", borderColor: "var(--border-subtle)" }}>
        <div className="flex-1">
          <p className="font-display font-bold uppercase text-[16px]" style={{ color: "var(--text-primary)" }}>
            LOG MEAL
          </p>
          <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
            Search 3.5M+ foods via Open Food Facts
          </p>
        </div>
        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center"
          style={{ color: "var(--text-disabled)" }} aria-label="Close">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <form action={logAction} className="flex flex-col gap-4">
          {/* Hidden fields for selected food */}
          <input type="hidden" name="foodName" value={selected?.name ?? query} />
          <input type="hidden" name="calories" value={selected?.calories ?? ""} />
          <input type="hidden" name="proteinG" value={selected?.proteinG ?? "0"} />
          <input type="hidden" name="carbsG"   value={selected?.carbsG ?? "0"} />
          <input type="hidden" name="fatG"     value={selected?.fatG ?? "0"} />
          <input type="hidden" name="mealType" value={mealType} />

          {/* Meal type selector */}
          <div>
            <Label>Meal Type</Label>
            <Select value={mealType} onValueChange={setMealType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MEAL_TYPES.map((m) => (
                  <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Food search */}
          <div>
            <Label>Food / Meal</Label>
            <div className="flex gap-2">
              <Input
                value={query}
                onChange={(e) => { setQuery(e.target.value); setSelected(null); }}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleSearch())}
                placeholder="Search e.g. chicken breast, oats..."
                className="flex-1"
              />
              <Button type="button" variant="secondary" size="icon"
                onClick={handleSearch} loading={isSearching} aria-label="Search food">
                <Search className="w-4 h-4" />
              </Button>
            </div>
            {searchError && <FieldError message={searchError} />}
          </div>

          {/* Search results */}
          {results.length > 0 && (
            <div className="rounded-[var(--radius-md)] border overflow-hidden"
              style={{ borderColor: "var(--border-default)" }}>
              {results.map((food, i) => (
                <button key={i} type="button" onClick={() => selectFood(food)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
                  style={{
                    borderBottom: i < results.length - 1 ? "1px solid var(--border-subtle)" : "none",
                    background: "var(--bg-surface)",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-hover)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "var(--bg-surface)")}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium truncate" style={{ color: "var(--text-primary)" }}>
                      {food.name}
                    </p>
                    {food.brand && (
                      <p className="text-[11px] truncate" style={{ color: "var(--text-disabled)" }}>
                        {food.brand}
                      </p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-mono font-bold text-[13px]" style={{ color: "var(--operative-400)" }}>
                      {food.calories} kcal
                    </p>
                    <p className="text-[10px]" style={{ color: "var(--text-disabled)" }}>per 100g</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Selected food summary */}
          {selected && (
            <div className="rounded-[var(--radius-sm)] border p-3"
              style={{ background: "var(--operative-900)", borderColor: "var(--operative-600)" }}>
              <div className="flex items-center gap-2 mb-2">
                <Check className="w-4 h-4" style={{ color: "var(--operative-500)" }} />
                <p className="text-[12px] font-semibold" style={{ color: "var(--operative-400)" }}>
                  Selected: {selected.name}
                </p>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center">
                {[
                  { label: "Cal",   value: `${selected.calories}`,   color: "var(--text-primary)" },
                  { label: "Protein", value: `${selected.proteinG}g`, color: "var(--operative-400)" },
                  { label: "Carbs",  value: `${selected.carbsG}g`,    color: "var(--intel-400)" },
                  { label: "Fat",    value: `${selected.fatG}g`,      color: "var(--signal-400)" },
                ].map(({ label, value, color }) => (
                  <div key={label}>
                    <p className="font-mono font-bold text-[14px]" style={{ color }}>{value}</p>
                    <p className="text-[9px] uppercase tracking-[0.08em]" style={{ color: "var(--text-disabled)" }}>{label}</p>
                  </div>
                ))}
              </div>
              <p className="text-[10px] mt-2 text-center" style={{ color: "var(--operative-700)" }}>
                Values per 100g serving
              </p>
            </div>
          )}

          {/* Manual entry (if no search result selected) */}
          {!selected && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="manualCalories">Calories (kcal) *</Label>
                <Input id="manualCalories" name="calories" type="number" min={0} placeholder="e.g. 350" />
              </div>
              <div>
                <Label htmlFor="manualProtein">Protein (g)</Label>
                <Input id="manualProtein" name="proteinG" type="number" step="0.1" min={0} placeholder="0" />
              </div>
              <div>
                <Label htmlFor="manualCarbs">Carbs (g)</Label>
                <Input id="manualCarbs" name="carbsG" type="number" step="0.1" min={0} placeholder="0" />
              </div>
              <div>
                <Label htmlFor="manualFat">Fat (g)</Label>
                <Input id="manualFat" name="fatG" type="number" step="0.1" min={0} placeholder="0" />
              </div>
            </div>
          )}

          {logState?.error && <FieldError message={logState.error} />}

          <Button type="submit" variant="primary" size="lg" fullWidth loading={isLogging}
            disabled={!selected && !query.trim()}>
            {isLogging ? "Logging..." : "Log Meal"}
          </Button>
        </form>
      </div>
    </div>
  );
}
