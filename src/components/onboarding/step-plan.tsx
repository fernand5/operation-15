"use client";

import { useTransition } from "react";
import { completeOnboardingAction } from "@/actions/onboarding";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const WEEK_PLAN = [
  { day: "MON", operation: "Operation Push",    type: "PUSH",   cal: "~280", difficulty: "Recruit" },
  { day: "TUE", operation: "Operation Thunder", type: "LEGS",   cal: "~320", difficulty: "Recruit" },
  { day: "WED", operation: "Operation Core",    type: "CORE",   cal: "~220", difficulty: "Recruit" },
  { day: "THU", operation: "Recovery Mission",  type: "MOB",    cal: "~120", difficulty: "Active Rest" },
  { day: "FRI", operation: "Operation Pull",    type: "PULL",   cal: "~260", difficulty: "Recruit" },
  { day: "SAT", operation: "Operation Blitz",   type: "CARDIO", cal: "~340", difficulty: "Recruit" },
  { day: "SUN", operation: "Rest & Recharge",   type: "REST",   cal: "—",    difficulty: "Rest Day" },
] as const;

const TYPE_COLORS: Record<string, string> = {
  PUSH: "var(--operative-500)", PULL: "var(--operative-500)", LEGS: "var(--signal-500)",
  CORE: "var(--intel-500)", CARDIO: "var(--breach-400)", MOB: "var(--classified-400)",
  REST: "var(--ground-400)",
};

export function StepPlan() {
  const [isPending, startTransition] = useTransition();

  function handleBegin() {
    startTransition(() => completeOnboardingAction());
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1
          className="font-display font-bold uppercase mb-2"
          style={{ fontSize: "clamp(24px, 5vw, 36px)", letterSpacing: "-0.02em", color: "var(--text-primary)" }}
        >
          YOUR MISSION PLAN
        </h1>
        <p style={{ color: "var(--text-tertiary)", fontSize: "14px" }}>
          8-week progressive programme. 15 minutes per day. This is Week 1.
        </p>
      </div>

      {/* Week 1 schedule */}
      <div
        className="rounded-[var(--radius-md)] border overflow-hidden"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        {WEEK_PLAN.map(({ day, operation, type, cal, difficulty }, i) => (
          <div
            key={day}
            className="flex items-center gap-3 px-4 py-3"
            style={{
              background: i % 2 === 0 ? "var(--bg-surface)" : "var(--bg-elevated)",
              borderBottom: i < WEEK_PLAN.length - 1 ? "1px solid var(--border-subtle)" : "none",
            }}
          >
            {/* Day + colour bar */}
            <div className="flex items-center gap-2 flex-shrink-0 w-12">
              <div
                className="w-1 h-8 rounded-full flex-shrink-0"
                style={{ background: TYPE_COLORS[type] ?? "var(--ground-500)" }}
              />
              <span
                className="font-mono font-bold text-[11px]"
                style={{ color: "var(--text-disabled)" }}
              >
                {day}
              </span>
            </div>

            {/* Operation name */}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[13px] truncate" style={{ color: "var(--text-primary)" }}>
                {operation}
              </p>
              <p className="text-[11px]" style={{ color: "var(--text-disabled)" }}>
                {difficulty}
              </p>
            </div>

            {/* Duration + cal */}
            <div className="text-right flex-shrink-0">
              <p className="font-mono text-[12px] font-bold" style={{ color: "var(--operative-400)" }}>
                {type !== "REST" ? "15 min" : "—"}
              </p>
              <p className="text-[11px]" style={{ color: "var(--text-disabled)" }}>{cal}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Sessions/Week", value: "6" },
          { label: "Min/Session",   value: "15" },
          { label: "Est. Cal/Week", value: "~1,540" },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="p-3 rounded-[var(--radius-sm)] border text-center"
            style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
          >
            <p
              className="font-mono font-bold"
              style={{ fontSize: "20px", color: "var(--operative-400)" }}
            >
              {value}
            </p>
            <p className="text-[10px] font-bold uppercase tracking-[0.08em] mt-0.5" style={{ color: "var(--text-disabled)" }}>
              {label}
            </p>
          </div>
        ))}
      </div>

      <div
        className="flex items-start gap-3 p-3 rounded-[var(--radius-sm)] border"
        style={{ background: "var(--operative-900)", borderColor: "var(--operative-600)" }}
      >
        <span className="text-lg flex-shrink-0">🪖</span>
        <p className="text-[12px] leading-relaxed" style={{ color: "var(--operative-300)" }}>
          <strong>ATLAS:</strong> "Your mission begins now. Complete Day 1 to earn your first 100 XP and start climbing the ranks. No excuses — 15 minutes is all it takes."
        </p>
      </div>

      <Button
        variant="primary"
        size="xl"
        fullWidth
        loading={isPending}
        onClick={handleBegin}
      >
        {isPending ? "Deploying..." : "▶ BEGIN MISSION"}
      </Button>

      <p className="text-center text-[11px]" style={{ color: "var(--text-disabled)" }}>
        Your plan adapts as you progress. You can modify it anytime in settings.
      </p>
    </div>
  );
}
