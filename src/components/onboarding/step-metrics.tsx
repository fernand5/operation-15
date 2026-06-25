"use client";

import { useActionState, useState } from "react";
import { saveMetricsAction } from "@/actions/onboarding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError, AlertBanner } from "@/components/states/error-state";

const initialState = { error: null as string | null };

export function StepMetrics() {
  const [state, formAction, isPending] = useActionState(saveMetricsAction, initialState);
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [sex, setSex] = useState<"male" | "female" | "">("");

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div>
        <h1
          className="font-display font-bold uppercase mb-2"
          style={{ fontSize: "clamp(24px, 5vw, 36px)", letterSpacing: "-0.02em", color: "var(--text-primary)" }}
        >
          BODY METRICS
        </h1>
        <p style={{ color: "var(--text-tertiary)", fontSize: "14px" }}>
          Used to calculate your daily calorie target. Accurate data = better results.
        </p>
      </div>

      {/* Unit toggle */}
      <div className="flex gap-1 p-1 rounded-[var(--radius-sm)]" style={{ background: "var(--white-06)", border: "1px solid var(--border-subtle)" }}>
        {(["metric", "imperial"] as const).map((u) => (
          <button
            key={u}
            type="button"
            onClick={() => setUnit(u)}
            className="flex-1 py-1.5 rounded-[var(--radius-xs)] text-[11px] font-bold uppercase tracking-[0.08em] transition-colors"
            style={{
              background: unit === u ? "var(--operative-900)" : "transparent",
              color: unit === u ? "var(--operative-500)" : "var(--text-disabled)",
            }}
          >
            {u === "metric" ? "Metric (kg/cm)" : "Imperial (lbs/ft)"}
          </button>
        ))}
      </div>

      <input type="hidden" name="unit" value={unit} />

      {/* Biological sex — required for TDEE */}
      <div>
        <Label>
          Biological Sex <span style={{ color: "var(--breach-500)" }}>*</span>
        </Label>
        <div className="flex gap-2 mt-1">
          {(["male", "female"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSex(s)}
              className="flex-1 h-11 rounded-[var(--radius-sm)] border text-[13px] font-semibold capitalize transition-all"
              style={{
                background: sex === s ? "var(--operative-900)" : "var(--bg-input)",
                borderColor: sex === s ? "var(--operative-500)" : "var(--border-default)",
                color: sex === s ? "var(--operative-500)" : "var(--text-secondary)",
              }}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <input type="hidden" name="biologicalSex" value={sex} />
        <p className="text-[11px] mt-1.5" style={{ color: "var(--text-disabled)" }}>
          Used only for TDEE calculations — never displayed on your profile.
        </p>
      </div>

      {/* Age */}
      <div>
        <Label htmlFor="age">Age <span style={{ color: "var(--breach-500)" }}>*</span></Label>
        <Input id="age" name="age" type="number" min={13} max={100} placeholder="Years" disabled={isPending} />
      </div>

      {/* Weight + Height side by side */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="weight">
            Weight <span style={{ color: "var(--breach-500)" }}>*</span>
          </Label>
          <Input
            id="weight"
            name="weight"
            type="number"
            step="0.1"
            min={40}
            placeholder={unit === "metric" ? "kg" : "lbs"}
            disabled={isPending}
          />
        </div>
        <div>
          <Label htmlFor="height">
            Height <span style={{ color: "var(--breach-500)" }}>*</span>
          </Label>
          <Input
            id="height"
            name="height"
            type="number"
            step="0.1"
            min={1}
            placeholder={unit === "metric" ? "cm" : "ft (e.g. 5.8)"}
            disabled={isPending}
          />
        </div>
      </div>

      {/* Goal weight — optional */}
      <div>
        <Label htmlFor="goalWeight">
          Goal Weight <span style={{ color: "var(--text-disabled)", fontWeight: 400 }}>(optional)</span>
        </Label>
        <Input
          id="goalWeight"
          name="goalWeight"
          type="number"
          step="0.1"
          placeholder={unit === "metric" ? "kg" : "lbs"}
          disabled={isPending}
        />
      </div>

      <AlertBanner
        variant="info"
        message="Your biological sex is stored securely and used only to calculate your personal calorie target using the Mifflin-St Jeor formula."
      />

      {state?.error && <FieldError message={state.error} />}

      <Button type="submit" variant="primary" size="lg" fullWidth loading={isPending}>
        {isPending ? "Saving..." : "Continue →"}
      </Button>
    </form>
  );
}
