"use client";

import { useActionState, useState } from "react";
import { saveGoalAction } from "@/actions/onboarding";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/states/error-state";
import { Target, Dumbbell, Zap } from "lucide-react";

const GOALS = [
  {
    id: "weight_loss",
    label: "Lose Weight",
    sublabel: "Burn fat, build discipline",
    icon: Target,
    color: "var(--operative-500)",
    bg: "var(--operative-900)",
    border: "var(--operative-600)",
  },
  {
    id: "strength",
    label: "Build Strength",
    sublabel: "Increase power and muscle",
    icon: Dumbbell,
    color: "var(--intel-400)",
    bg: "var(--intel-900)",
    border: "var(--intel-600)",
  },
  {
    id: "endurance",
    label: "Increase Endurance",
    sublabel: "Go further, last longer",
    icon: Zap,
    color: "var(--signal-400)",
    bg: "var(--signal-900)",
    border: "var(--signal-600)",
  },
] as const;

const initialState = { error: null as string | null };

export function StepGoal() {
  const [state, formAction, isPending] = useActionState(saveGoalAction, initialState);
  const [selected, setSelected] = useState<string>("weight_loss");

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <div>
        <h1
          className="font-display font-bold uppercase mb-2"
          style={{ fontSize: "clamp(24px, 5vw, 36px)", letterSpacing: "-0.02em", color: "var(--text-primary)" }}
        >
          PRIMARY OBJECTIVE
        </h1>
        <p style={{ color: "var(--text-tertiary)", fontSize: "14px" }}>
          What's your mission? Choose your primary focus.
        </p>
      </div>

      <input type="hidden" name="primaryGoal" value={selected} />

      <div className="flex flex-col gap-3">
        {GOALS.map(({ id, label, sublabel, icon: Icon, color, bg, border }) => {
          const isSelected = selected === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setSelected(id)}
              className="flex items-center gap-4 p-4 rounded-[var(--radius-md)] border text-left transition-all duration-150"
              style={{
                background: isSelected ? bg : "var(--bg-surface)",
                borderColor: isSelected ? border : "var(--border-subtle)",
                boxShadow: isSelected ? `0 0 0 1px ${border}` : "none",
              }}
              aria-pressed={isSelected}
            >
              <div
                className="w-12 h-12 rounded-[var(--radius-sm)] flex items-center justify-center flex-shrink-0"
                style={{ background: isSelected ? bg : "var(--bg-elevated)", border: `1px solid ${isSelected ? border : "var(--border-default)"}` }}
              >
                <Icon className="w-5 h-5" style={{ color: isSelected ? color : "var(--text-tertiary)" }} />
              </div>
              <div>
                <p className="font-semibold text-[15px]" style={{ color: isSelected ? color : "var(--text-primary)" }}>
                  {label}
                </p>
                <p className="text-[12px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                  {sublabel}
                </p>
              </div>
              {/* Selection indicator */}
              <div
                className="ml-auto w-4 h-4 rounded-full border-2 flex-shrink-0 transition-all"
                style={{
                  borderColor: isSelected ? color : "var(--border-default)",
                  background: isSelected ? color : "transparent",
                }}
              />
            </button>
          );
        })}
      </div>

      {state?.error && <FieldError message={state.error} />}

      <Button type="submit" variant="primary" size="lg" fullWidth loading={isPending}>
        {isPending ? "Saving..." : "Continue →"}
      </Button>
    </form>
  );
}
