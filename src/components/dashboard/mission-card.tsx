"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Play, Lock } from "lucide-react";

interface MissionCardProps {
  workoutId?: string;
  operationName?: string;
  title?: string;
  durationMin?: number;
  estimatedCalories?: number;
  xpReward?: number;
  difficulty?: string;
  weekNumber?: number;
  dayNumber?: number;
  isLocked?: boolean;
  completionPct?: number; // if already started today
}

const DIFFICULTY_LABELS: Record<string, string> = {
  t1: "Recruit", t2: "Soldier", t3: "Veteran", t4: "Elite",
};

export function MissionCard({
  workoutId,
  operationName = "Operation Thunder",
  title = "Lower Body Power",
  durationMin = 15,
  estimatedCalories = 320,
  xpReward = 100,
  difficulty = "t1",
  weekNumber = 1,
  dayNumber = 1,
  isLocked = false,
  completionPct = 0,
}: MissionCardProps) {
  const isComplete = completionPct >= 100;
  const isInProgress = completionPct > 0 && completionPct < 100;
  const difficultyLabel = DIFFICULTY_LABELS[difficulty] ?? difficulty;

  return (
    <div
      className="rounded-[var(--radius-md)] border overflow-hidden"
      style={{
        background: "var(--bg-elevated)",
        borderColor: isComplete
          ? "var(--operative-600)"
          : isInProgress
          ? "var(--signal-600)"
          : "var(--border-default)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between p-4 pb-3">
        <div>
          <p
            className="text-[10px] font-bold uppercase tracking-[0.12em] mb-0.5"
            style={{ color: "var(--text-disabled)" }}
          >
            {operationName} · Week {weekNumber}, Day {dayNumber}
          </p>
          <h2
            className="font-display font-bold uppercase"
            style={{
              fontSize: "22px",
              letterSpacing: "-0.01em",
              color: "var(--text-primary)",
              lineHeight: 1.1,
            }}
          >
            {title}
          </h2>
        </div>
        {/* Duration badge */}
        <div className="text-right flex-shrink-0 ml-3">
          <p
            className="font-mono font-bold"
            style={{ fontSize: "28px", color: "var(--operative-400)", lineHeight: 1 }}
          >
            {durationMin}
          </p>
          <p
            className="text-[10px] font-bold uppercase tracking-[0.12em]"
            style={{ color: "var(--text-disabled)" }}
          >
            MIN
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-3 px-4 pb-3">
        <Badge variant={isLocked ? "default" : "success"}>
          {isLocked ? <><Lock className="w-2.5 h-2.5" /> LOCKED</> : difficultyLabel}
        </Badge>
        <span
          className="text-[11px]"
          style={{ color: "var(--text-tertiary)" }}
        >
          ~{estimatedCalories} cal
        </span>
        <span
          className="text-[11px]"
          style={{ color: "var(--text-tertiary)" }}
        >
          +{xpReward} XP
        </span>
        {isComplete && (
          <Badge variant="success" className="ml-auto">✓ DONE</Badge>
        )}
        {isInProgress && (
          <Badge variant="warning" className="ml-auto">IN PROGRESS</Badge>
        )}
      </div>

      {/* Progress bar (if started) */}
      {isInProgress && (
        <div className="px-4 pb-3">
          <Progress value={completionPct} size="sm" color="signal" />
          <p className="text-[10px] mt-1" style={{ color: "var(--text-disabled)" }}>
            {Math.round(completionPct)}% complete
          </p>
        </div>
      )}

      {/* CTA */}
      <div className="px-4 pb-4">
        {isLocked ? (
          <div
            className="h-12 rounded-[var(--radius-sm)] flex items-center justify-center gap-2 text-[13px] font-bold uppercase tracking-[0.06em]"
            style={{
              background: "var(--white-06)",
              border: "1px solid var(--border-default)",
              color: "var(--text-disabled)",
            }}
          >
            <Lock className="w-4 h-4" aria-hidden="true" />
            Upgrade to Unlock
          </div>
        ) : isComplete ? (
          <Link
            href={workoutId ? `/missions/${workoutId}` : "/missions"}
            className="h-12 rounded-[var(--radius-sm)] flex items-center justify-center gap-2 text-[13px] font-bold uppercase tracking-[0.06em] no-underline"
            style={{
              background: "var(--operative-900)",
              border: "1px solid var(--operative-600)",
              color: "var(--operative-400)",
            }}
          >
            ✓ Mission Complete — View Details
          </Link>
        ) : (
          <Link
            href={workoutId ? `/missions/${workoutId}/active` : "/missions"}
            className="h-12 rounded-[var(--radius-sm)] flex items-center justify-center gap-2 text-[13px] font-bold uppercase tracking-[0.06em] no-underline transition-all duration-150"
            style={{
              background: "var(--operative-500)",
              color: "var(--ground-950)",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "var(--operative-400)")}
            onMouseLeave={e => (e.currentTarget.style.background = "var(--operative-500)")}
          >
            <Play className="w-4 h-4" aria-hidden="true" fill="currentColor" />
            {isInProgress ? "Resume Mission" : "Start Mission"}
          </Link>
        )}
      </div>
    </div>
  );
}
