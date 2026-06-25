"use client";

import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { ChevronRight } from "lucide-react";

interface RankProgressProps {
  rankName: string;
  rankNumber: number;
  totalXp: number;
  currentRankXp: number;
  nextRankXp: number | null;
  nextRankName: string | null;
}

export function RankProgress({
  rankName,
  rankNumber,
  totalXp,
  currentRankXp,
  nextRankXp,
  nextRankName,
}: RankProgressProps) {
  const xpIntoCurrentRank = totalXp - currentRankXp;
  const xpNeededForNext = nextRankXp ? nextRankXp - currentRankXp : 0;
  const pct = nextRankXp
    ? Math.min(100, Math.round((xpIntoCurrentRank / xpNeededForNext) * 100))
    : 100;

  return (
    <Link
      href="/ops"
      className="block rounded-[var(--radius-md)] border p-4 no-underline transition-colors duration-150"
      style={{
        background: "var(--bg-surface)",
        borderColor: "var(--border-subtle)",
      }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--border-strong)")}
      onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border-subtle)")}
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <p
            className="text-[10px] font-bold uppercase tracking-[0.1em] mb-0.5"
            style={{ color: "var(--text-disabled)" }}
          >
            Current Rank — {rankNumber} of 8
          </p>
          <p
            className="font-display font-bold uppercase"
            style={{ fontSize: "18px", letterSpacing: "0.02em", color: "var(--operative-400)" }}
          >
            {rankName}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {nextRankName && (
            <span
              className="text-[11px]"
              style={{ color: "var(--text-tertiary)" }}
            >
              → {nextRankName}
            </span>
          )}
          <ChevronRight className="w-4 h-4" style={{ color: "var(--text-disabled)" }} />
        </div>
      </div>

      <Progress value={pct} size="sm" color="operative" />

      <div className="flex items-center justify-between mt-2">
        <span className="text-[11px] font-mono" style={{ color: "var(--text-tertiary)" }}>
          {totalXp.toLocaleString()} XP
        </span>
        {nextRankXp && (
          <span className="text-[11px] font-mono" style={{ color: "var(--text-disabled)" }}>
            {(nextRankXp - totalXp).toLocaleString()} XP to {nextRankName}
          </span>
        )}
        {!nextRankXp && (
          <span className="text-[11px]" style={{ color: "var(--operative-400)" }}>
            Max Rank Achieved
          </span>
        )}
      </div>
    </Link>
  );
}
