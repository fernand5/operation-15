"use client";

import { RANKS, getXpProgress } from "@/lib/ranks";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Lock, CheckCircle } from "lucide-react";

interface RankLadderProps {
  currentRankId: number;
  totalXp: number;
}

const RARITY_COLORS: Record<number, string> = {
  1: "var(--ground-400)",
  2: "var(--ground-300)",
  3: "var(--operative-500)",
  4: "var(--signal-500)",
  5: "var(--intel-500)",
  6: "var(--intel-400)",
  7: "var(--classified-400)",
  8: "var(--op15-white)",
};

export function RankLadder({ currentRankId, totalXp }: RankLadderProps) {
  const { pct, xpIntoRank, xpNeeded } = getXpProgress(totalXp, currentRankId);

  return (
    <div className="flex flex-col gap-3">
      {RANKS.map((rank, i) => {
        const isUnlocked = rank.id <= currentRankId;
        const isCurrent = rank.id === currentRankId;
        const isNext = rank.id === currentRankId + 1;
        const color = RARITY_COLORS[rank.id];

        return (
          <div
            key={rank.id}
            className={cn(
              "rounded-[var(--radius-md)] border p-4 transition-all duration-150",
              isCurrent && "ring-1"
            )}
            style={{
              background: isCurrent ? "var(--bg-elevated)" : "var(--bg-surface)",
              borderColor: isCurrent ? color : "var(--border-subtle)",
              // @ts-ignore
              "--tw-ring-color": color,
            }}
          >
            <div className="flex items-start gap-3">
              {/* Insignia circle */}
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 border-2 text-lg"
                style={{
                  borderColor: isUnlocked ? color : "var(--border-default)",
                  background: isUnlocked ? `${color}18` : "var(--bg-elevated)",
                  filter: !isUnlocked ? "grayscale(1) opacity(0.4)" : "none",
                }}
              >
                {rank.emoji}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p
                    className="font-display font-bold uppercase text-[15px]"
                    style={{ color: isUnlocked ? color : "var(--text-disabled)", letterSpacing: "0.02em" }}
                  >
                    {rank.name}
                  </p>
                  {isCurrent && (
                    <span
                      className="text-[9px] font-bold uppercase tracking-[0.12em] px-1.5 py-0.5 rounded-full"
                      style={{ background: `${color}20`, color }}
                    >
                      CURRENT
                    </span>
                  )}
                </div>

                <p className="text-[11px] mb-2" style={{ color: "var(--text-tertiary)" }}>
                  {rank.description}
                </p>

                {/* XP threshold */}
                <p className="font-mono text-[11px]" style={{ color: "var(--text-disabled)" }}>
                  {rank.xpRequired.toLocaleString()} XP required
                </p>

                {/* Progress bar for current rank */}
                {isCurrent && (
                  <div className="mt-2">
                    <Progress value={pct} size="xs" color="operative" />
                    <p className="text-[10px] mt-1 font-mono" style={{ color: "var(--text-disabled)" }}>
                      {xpIntoRank.toLocaleString()} / {xpNeeded.toLocaleString()} XP to next rank
                    </p>
                  </div>
                )}

                {/* Unlocks */}
                {(isUnlocked || isNext) && rank.unlocks.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {rank.unlocks.map((u) => (
                      <span
                        key={u}
                        className="text-[10px] px-1.5 py-0.5 rounded"
                        style={{
                          background: isUnlocked ? `${color}15` : "var(--white-04)",
                          color: isUnlocked ? color : "var(--text-disabled)",
                          border: `1px solid ${isUnlocked ? `${color}30` : "var(--border-subtle)"}`,
                        }}
                      >
                        {u}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Status icon */}
              <div className="flex-shrink-0 mt-0.5">
                {isUnlocked ? (
                  <CheckCircle className="w-5 h-5" style={{ color }} />
                ) : (
                  <Lock className="w-4 h-4" style={{ color: "var(--text-disabled)" }} />
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
