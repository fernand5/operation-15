"use client";

import { useActionState, useState } from "react";
import { logWeightAction } from "@/actions/nutrition";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/states/error-state";

const initialState = { error: null as string | null, success: false };

interface WeightLogFormProps {
  latestWeightKg: number | null;
  goalWeightKg: number | null;
  onClose: () => void;
}

export function WeightLogForm({ latestWeightKg, goalWeightKg, onClose }: WeightLogFormProps) {
  const [state, formAction, isPending] = useActionState(logWeightAction, initialState);
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");

  if (state?.success) setTimeout(onClose, 300);

  const displayWeight = latestWeightKg
    ? unit === "imperial"
      ? `${(latestWeightKg * 2.205).toFixed(1)} lbs`
      : `${latestWeightKg} kg`
    : null;

  const displayGoal = goalWeightKg
    ? unit === "imperial"
      ? `${(goalWeightKg * 2.205).toFixed(1)} lbs`
      : `${goalWeightKg} kg`
    : null;

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="unit" value={unit} />

      {/* Unit toggle */}
      <div className="flex gap-1 p-1 rounded-[var(--radius-xs)]"
        style={{ background: "var(--white-06)", border: "1px solid var(--border-subtle)" }}>
        {(["metric", "imperial"] as const).map((u) => (
          <button key={u} type="button" onClick={() => setUnit(u)}
            className="flex-1 py-1 rounded-[2px] text-[11px] font-bold uppercase tracking-[0.06em] transition-colors"
            style={{
              background: unit === u ? "var(--operative-900)" : "transparent",
              color: unit === u ? "var(--operative-500)" : "var(--text-disabled)",
            }}>
            {u === "metric" ? "kg" : "lbs"}
          </button>
        ))}
      </div>

      {/* Previous + goal */}
      {(displayWeight || displayGoal) && (
        <div className="grid grid-cols-2 gap-2 text-center">
          {displayWeight && (
            <div className="rounded-[var(--radius-xs)] p-2"
              style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}>
              <p className="text-[10px] font-bold uppercase tracking-[0.08em]" style={{ color: "var(--text-disabled)" }}>Last</p>
              <p className="font-mono font-bold text-[14px]" style={{ color: "var(--text-primary)" }}>{displayWeight}</p>
            </div>
          )}
          {displayGoal && (
            <div className="rounded-[var(--radius-xs)] p-2"
              style={{ background: "var(--operative-900)", border: "1px solid var(--operative-800)" }}>
              <p className="text-[10px] font-bold uppercase tracking-[0.08em]" style={{ color: "var(--operative-700)" }}>Goal</p>
              <p className="font-mono font-bold text-[14px]" style={{ color: "var(--operative-400)" }}>{displayGoal}</p>
            </div>
          )}
        </div>
      )}

      <div>
        <Label htmlFor="weightKg">
          Today&apos;s Weight ({unit === "metric" ? "kg" : "lbs"}) *
        </Label>
        <Input
          id="weightKg"
          name="weightKg"
          type="number"
          step="0.1"
          min={unit === "metric" ? 20 : 44}
          max={unit === "metric" ? 400 : 882}
          placeholder={unit === "metric" ? "e.g. 80.5" : "e.g. 177.5"}
          required
          disabled={isPending}
          error={!!state?.error}
        />
      </div>

      <div>
        <Label htmlFor="notes">Notes (optional)</Label>
        <Input id="notes" name="notes" type="text" placeholder="Morning weigh-in, post-workout..." disabled={isPending} />
      </div>

      {state?.error && <FieldError message={state.error} />}

      <div className="flex gap-2">
        <Button type="button" variant="ghost" size="md" fullWidth onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" size="md" fullWidth loading={isPending}>
          Log Weight
        </Button>
      </div>
    </form>
  );
}
