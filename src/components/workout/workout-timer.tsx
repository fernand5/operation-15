"use client";

import { useMemo } from "react";

interface WorkoutTimerProps {
  remaining: number;   // seconds remaining in current segment
  total: number;       // total seconds in current segment
  color?: string;
  size?: number;
  strokeWidth?: number;
  showMs?: boolean;
}

export function WorkoutTimer({
  remaining,
  total,
  color = "var(--operative-500)",
  size = 160,
  strokeWidth = 8,
}: WorkoutTimerProps) {
  const r = (size - strokeWidth * 2) / 2;
  const circ = 2 * Math.PI * r;
  const progress = total > 0 ? Math.max(0, Math.min(1, remaining / total)) : 0;
  const dashOffset = circ * (1 - progress);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const display = mins > 0
    ? `${mins}:${secs.toString().padStart(2, "0")}`
    : `${remaining}`;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
      role="timer"
      aria-label={`${remaining} seconds remaining`}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="absolute inset-0 -rotate-90"
        aria-hidden="true"
      >
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--white-08)"
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={dashOffset}
          style={{ transition: "stroke-dashoffset 0.5s linear, stroke 0.3s ease" }}
        />
      </svg>

      {/* Time display */}
      <span
        className="font-mono font-bold tabular-nums z-10"
        style={{
          fontSize: remaining < 10 ? "52px" : "44px",
          color: remaining <= 5 ? "var(--breach-400)" : "var(--text-primary)",
          lineHeight: 1,
          transition: "color 0.2s ease",
        }}
      >
        {display}
      </span>
    </div>
  );
}

/* ── Global progress bar (top of workout screen) ──────────── */
interface GlobalProgressProps {
  completionPct: number;
  elapsed: number;
  total: number;
}

export function GlobalProgress({ completionPct, elapsed, total }: GlobalProgressProps) {
  const totalMins = Math.floor(total / 60);
  const elapsedMins = Math.floor(elapsed / 60);
  const elapsedSecs = elapsed % 60;

  return (
    <div className="flex flex-col gap-1">
      <div
        className="h-[3px] rounded-full overflow-hidden"
        style={{ background: "var(--white-08)" }}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: `${completionPct}%`,
            background: "linear-gradient(90deg, var(--operative-600), var(--operative-500))",
            transition: "width 0.5s linear",
          }}
        />
      </div>
      <div className="flex justify-between">
        <span
          className="font-mono text-[11px]"
          style={{ color: "var(--text-disabled)" }}
        >
          {elapsedMins}:{elapsedSecs.toString().padStart(2, "0")} elapsed
        </span>
        <span
          className="font-mono text-[11px]"
          style={{ color: "var(--text-disabled)" }}
        >
          {totalMins} min total
        </span>
      </div>
    </div>
  );
}
