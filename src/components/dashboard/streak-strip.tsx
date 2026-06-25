"use client";

import Link from "next/link";
import { format, subDays, isSameDay } from "date-fns";

interface StreakStripProps {
  currentStreak: number;
  longestStreak: number;
  completedDates?: string[]; // ISO date strings of completed workout days
}

export function StreakStrip({
  currentStreak,
  longestStreak,
  completedDates = [],
}: StreakStripProps) {
  const today = new Date();
  // Show last 14 days
  const days = Array.from({ length: 14 }, (_, i) => subDays(today, 13 - i));

  return (
    <Link
      href="/ops"
      className="block rounded-[var(--radius-md)] border p-4 no-underline"
      style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-base">🔥</span>
          <div>
            <p
              className="text-[10px] font-bold uppercase tracking-[0.1em]"
              style={{ color: "var(--text-disabled)" }}
            >
              Current Streak
            </p>
            <p
              className="font-mono font-bold"
              style={{ fontSize: "20px", color: "var(--signal-400)", lineHeight: 1 }}
            >
              {currentStreak} <span className="text-[12px]" style={{ color: "var(--text-disabled)" }}>days</span>
            </p>
          </div>
        </div>
        <div className="text-right">
          <p
            className="text-[10px] font-bold uppercase tracking-[0.1em]"
            style={{ color: "var(--text-disabled)" }}
          >
            Best
          </p>
          <p
            className="font-mono font-bold text-[14px]"
            style={{ color: "var(--text-tertiary)" }}
          >
            {longestStreak}d
          </p>
        </div>
      </div>

      {/* Calendar grid — last 14 days */}
      <div className="grid gap-1" style={{ gridTemplateColumns: "repeat(14, 1fr)" }}>
        {days.map((day) => {
          const isToday = isSameDay(day, today);
          const isDone = completedDates.some((d) =>
            isSameDay(new Date(d), day)
          );
          const dayLabel = format(day, "d");

          return (
            <div key={day.toISOString()} className="flex flex-col items-center gap-0.5">
              <div
                className="w-full aspect-square rounded-[2px] flex items-center justify-center"
                style={{
                  background: isToday
                    ? isDone ? "var(--operative-500)" : "var(--white-12)"
                    : isDone
                    ? "var(--operative-800)"
                    : "var(--white-06)",
                  border: isToday ? "1px solid var(--operative-500)" : "none",
                }}
                aria-label={`${format(day, "MMMM d")}${isDone ? " — completed" : ""}`}
              >
                {isDone && !isToday && (
                  <span
                    className="text-[6px] font-bold"
                    style={{ color: "var(--operative-400)" }}
                  >
                    ✓
                  </span>
                )}
                {isToday && (
                  <span
                    className="text-[7px] font-bold"
                    style={{ color: isDone ? "var(--ground-950)" : "var(--text-primary)" }}
                  >
                    {dayLabel}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Link>
  );
}
