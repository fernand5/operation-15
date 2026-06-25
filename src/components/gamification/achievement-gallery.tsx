"use client";

import { useState } from "react";
import type { ACHIEVEMENTS_MOCK } from "@/lib/ranks";

type Achievement = (typeof ACHIEVEMENTS_MOCK)[number];

const RARITY_STYLES: Record<string, { border: string; glow: string; label: string }> = {
  common:    { border: "var(--border-default)",    glow: "none",                                        label: "COMMON" },
  uncommon:  { border: "var(--intel-600)",          glow: "0 0 12px rgba(41,121,255,0.2)",               label: "UNCOMMON" },
  rare:      { border: "var(--classified-600)",     glow: "0 0 16px rgba(156,39,176,0.3)",               label: "RARE" },
  legendary: { border: "var(--signal-600)",         glow: "0 0 20px rgba(255,179,0,0.4)",                label: "LEGENDARY" },
};

const CATEGORY_FILTER = ["All", "Mission", "Streak", "Rank", "Nutrition", "Elite"] as const;

interface AchievementGalleryProps {
  achievements: Achievement[];
}

export function AchievementGallery({ achievements }: AchievementGalleryProps) {
  const [filter, setFilter] = useState<string>("All");

  const filtered = filter === "All"
    ? achievements
    : achievements.filter((a) => a.category.toLowerCase() === filter.toLowerCase());

  const earned = achievements.filter((a) => a.earned).length;

  return (
    <div className="flex flex-col gap-4">
      {/* Stats */}
      <div className="flex items-center justify-between">
        <p className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
          <span className="font-bold font-mono" style={{ color: "var(--operative-400)" }}>{earned}</span>
          <span style={{ color: "var(--text-disabled)" }}> / {achievements.length} unlocked</span>
        </p>
        <div
          className="h-1.5 rounded-full overflow-hidden flex-1 mx-4"
          style={{ background: "var(--white-08)" }}
        >
          <div
            className="h-full rounded-full"
            style={{
              width: `${(earned / achievements.length) * 100}%`,
              background: "linear-gradient(90deg, var(--operative-600), var(--operative-500))",
            }}
          />
        </div>
        <p className="text-[11px] font-mono" style={{ color: "var(--text-disabled)" }}>
          {Math.round((earned / achievements.length) * 100)}%
        </p>
      </div>

      {/* Category filter */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
        {CATEGORY_FILTER.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className="px-3 py-1 rounded-[var(--radius-full)] text-[10px] font-bold uppercase tracking-[0.08em] whitespace-nowrap flex-shrink-0 transition-all duration-150"
            style={{
              background: filter === cat ? "var(--operative-900)" : "var(--white-06)",
              color: filter === cat ? "var(--operative-500)" : "var(--text-disabled)",
              border: filter === cat ? "1px solid var(--operative-600)" : "1px solid transparent",
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Badge grid */}
      <div className="grid grid-cols-3 gap-3">
        {filtered.map((ach) => {
          const rarity = RARITY_STYLES[ach.rarity] ?? RARITY_STYLES.common;
          return (
            <div
              key={ach.id}
              className="rounded-[var(--radius-md)] border p-3 flex flex-col items-center gap-2 text-center"
              style={{
                background: ach.earned ? "var(--bg-elevated)" : "var(--bg-surface)",
                borderColor: ach.earned ? rarity.border : "var(--border-subtle)",
                boxShadow: ach.earned ? rarity.glow : "none",
                opacity: ach.earned ? 1 : 0.5,
                filter: ach.earned ? "none" : "grayscale(0.8)",
              }}
            >
              <span className="text-2xl">{ach.emoji}</span>
              <p
                className="text-[10px] font-semibold leading-tight"
                style={{ color: ach.earned ? "var(--text-primary)" : "var(--text-disabled)" }}
              >
                {ach.name}
              </p>
              <span
                className="text-[8px] font-bold uppercase tracking-[0.1em] px-1.5 py-0.5 rounded-full"
                style={{
                  background: ach.earned ? `${rarity.border}20` : "var(--white-04)",
                  color: ach.earned ? rarity.border : "var(--text-disabled)",
                }}
              >
                {rarity.label}
              </span>
              {ach.earned && (
                <p className="text-[9px] font-mono" style={{ color: "var(--operative-600)" }}>
                  +{ach.xpBonus} XP
                </p>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-8">
          <p className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>No achievements in this category yet.</p>
        </div>
      )}
    </div>
  );
}
