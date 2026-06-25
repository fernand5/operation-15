"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { CompleteSessionResult } from "@/actions/workout";

interface MissionCompleteProps {
  result: CompleteSessionResult;
  durationSec: number;
  completionPct: number;
}

function AnimatedNumber({ target, duration = 1500 }: { target: number; duration?: number }) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setValue(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);

  return <>{value.toLocaleString()}</>;
}

export function MissionComplete({ result, durationSec, completionPct }: MissionCompleteProps) {
  const mins = Math.floor(durationSec / 60);
  const secs = durationSec % 60;
  const isPerfect = completionPct === 100;

  return (
    <div className="flex flex-col gap-5 p-4 pb-8 max-w-lg mx-auto">
      {/* Hero */}
      <div className="text-center py-6">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{
            background: "var(--operative-900)",
            border: "2px solid var(--operative-500)",
            boxShadow: "0 0 32px rgba(0,230,118,0.25)",
          }}
        >
          <span className="text-3xl">{isPerfect ? "🎖️" : "✓"}</span>
        </div>

        <h1
          className="font-display font-bold uppercase"
          style={{ fontSize: "clamp(28px, 7vw, 48px)", letterSpacing: "-0.02em", color: "var(--text-primary)" }}
        >
          {isPerfect ? "MISSION COMPLETE" : "MISSION ENDED"}
        </h1>
        <p className="text-[13px] mt-1" style={{ color: "var(--text-tertiary)" }}>
          {isPerfect
            ? "Outstanding performance, Operator."
            : `${Math.round(completionPct)}% complete — well done for showing up.`}
        </p>
      </div>

      {/* XP award */}
      <div
        className="rounded-[var(--radius-md)] border p-5 text-center"
        style={{ background: "var(--operative-900)", borderColor: "var(--operative-600)" }}
      >
        <p
          className="text-[11px] font-bold uppercase tracking-[0.12em] mb-1"
          style={{ color: "var(--operative-600)" }}
        >
          XP Earned
        </p>
        <p
          className="font-mono font-bold"
          style={{ fontSize: "56px", color: "var(--operative-400)", lineHeight: 1 }}
        >
          +<AnimatedNumber target={result.xpEarned} />
        </p>
        {isPerfect && (
          <p className="text-[12px] mt-2" style={{ color: "var(--operative-600)" }}>
            Including +25 XP Perfect Completion bonus
          </p>
        )}
      </div>

      {/* Rank progress */}
      <div
        className="rounded-[var(--radius-md)] border p-4"
        style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
      >
        <div className="flex justify-between items-center mb-2">
          <div>
            <p
              className="text-[10px] font-bold uppercase tracking-[0.1em]"
              style={{ color: "var(--text-disabled)" }}
            >
              Rank
            </p>
            <p
              className="font-display font-bold uppercase text-[18px]"
              style={{ color: "var(--operative-400)" }}
            >
              {result.newRankName}
            </p>
          </div>
          <p className="font-mono text-[13px]" style={{ color: "var(--text-tertiary)" }}>
            <AnimatedNumber target={result.newTotalXp} /> XP total
          </p>
        </div>
        <Progress value={Math.min(100, (result.newTotalXp / 500) * 100)} size="sm" color="operative" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Time",   value: `${mins}:${secs.toString().padStart(2, "0")}`, unit: "" },
          { label: "XP",     value: `+${result.xpEarned}`, unit: "pts" },
          { label: "Streak", value: result.streakResult?.currentStreak ?? 1, unit: "days" },
        ].map(({ label, value, unit }) => (
          <div
            key={label}
            className="rounded-[var(--radius-sm)] border p-3 text-center"
            style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] mb-1" style={{ color: "var(--text-disabled)" }}>
              {label}
            </p>
            <p className="font-mono font-bold text-[20px]" style={{ color: "var(--text-primary)" }}>
              {value}
            </p>
            {unit && <p className="text-[10px]" style={{ color: "var(--text-disabled)" }}>{unit}</p>}
          </div>
        ))}
      </div>

      {/* Streak result */}
      {result.streakResult && (
        <div
          className="flex items-center gap-3 p-3 rounded-[var(--radius-sm)]"
          style={{ background: "var(--signal-900)", border: "1px solid var(--signal-800)" }}
        >
          <span className="text-xl">🔥</span>
          <p className="text-[13px]" style={{ color: "var(--signal-400)" }}>
            {result.streakResult.currentStreak === 1
              ? "Streak started! Complete tomorrow to keep it alive."
              : `${result.streakResult.currentStreak}-day streak active.${result.streakResult.shieldUsed ? " Streak Shield used." : " Keep it going!"}`}
          </p>
        </div>
      )}

      {/* CTAs */}
      <div className="flex flex-col gap-2">
        <Link href="/dashboard" className="no-underline">
          <Button variant="primary" size="lg" fullWidth>
            Return to Base
          </Button>
        </Link>
        <Button
          variant="secondary"
          size="md"
          fullWidth
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: "Operation 15",
                text: `Just completed a mission and earned ${result.xpEarned} XP as a ${result.newRankName}! 💪 #Operation15`,
              });
            }
          }}
        >
          Share Achievement
        </Button>
      </div>
    </div>
  );
}
