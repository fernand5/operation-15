"use client";

import { useActionState, useState } from "react";
import { saveFitnessLevelAction } from "@/actions/onboarding";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/states/error-state";

const LEVELS = [
  {
    id: "recruit",
    label: "Recruit",
    emoji: "🟢",
    description: "Little or no exercise in the last 6 months. Starting fresh.",
    examples: "Can do 0–10 push-ups",
  },
  {
    id: "soldier",
    label: "Soldier",
    emoji: "🟡",
    description: "Exercise 1–3 times per week. Some baseline fitness.",
    examples: "Can do 10–25 push-ups",
  },
  {
    id: "veteran",
    label: "Veteran",
    emoji: "🔴",
    description: "Train 4+ times per week. Strong base, pushing limits.",
    examples: "Can do 25+ push-ups",
  },
] as const;

const initialState = { error: null as string | null };

export function StepFitness() {
  const [state, formAction, isPending] = useActionState(saveFitnessLevelAction, initialState);
  const [selected, setSelected] = useState<string>("recruit");

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div>
        <h1
          className="font-display font-bold uppercase mb-2"
          style={{ fontSize: "clamp(24px, 5vw, 36px)", letterSpacing: "-0.02em", color: "var(--text-primary)" }}
        >
          FITNESS LEVEL
        </h1>
        <p style={{ color: "var(--text-tertiary)", fontSize: "14px" }}>
          Be honest — this sets your starting workout intensity. You can always level up.
        </p>
      </div>

      <input type="hidden" name="fitnessLevel" value={selected} />

      <div className="flex flex-col gap-3">
        {LEVELS.map(({ id, label, emoji, description, examples }) => {
          const isSelected = selected === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setSelected(id)}
              aria-pressed={isSelected}
              className="flex items-start gap-4 p-4 rounded-[var(--radius-md)] border text-left transition-all duration-150"
              style={{
                background: isSelected ? "var(--bg-elevated)" : "var(--bg-surface)",
                borderColor: isSelected ? "var(--operative-500)" : "var(--border-subtle)",
                boxShadow: isSelected ? "0 0 0 1px var(--operative-500)" : "none",
              }}
            >
              <span className="text-2xl flex-shrink-0 mt-0.5">{emoji}</span>
              <div className="flex-1 min-w-0">
                <p
                  className="font-bold text-[15px] mb-0.5"
                  style={{ color: isSelected ? "var(--operative-500)" : "var(--text-primary)" }}
                >
                  {label}
                </p>
                <p className="text-[12px] leading-relaxed" style={{ color: "var(--text-tertiary)" }}>
                  {description}
                </p>
                <p className="text-[11px] mt-1 font-mono" style={{ color: "var(--text-disabled)" }}>
                  {examples}
                </p>
              </div>
              <div
                className="w-4 h-4 rounded-full border-2 flex-shrink-0 mt-1 transition-all"
                style={{
                  borderColor: isSelected ? "var(--operative-500)" : "var(--border-default)",
                  background: isSelected ? "var(--operative-500)" : "transparent",
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
