"use client";

import { Badge } from "@/components/ui/badge";
import { PHASE_LABELS, PHASE_COLORS } from "@/lib/workout-engine";
import { WorkoutAvatar } from "@/components/avatar/workout-avatar";
import type { WorkoutSegment } from "@/lib/workout-engine";

interface ExerciseDisplayProps {
  segment: WorkoutSegment;
  nextSegment?: WorkoutSegment | null;
  avatarUrl?: string | null;
  isWorkoutPaused?: boolean;
}

const MUSCLE_COLORS: Record<string, string> = {
  "Quads": "success", "Glutes": "success", "Hamstrings": "success",
  "Calves": "success", "Hip Flexors": "warning", "Adductors": "warning",
  "Lower Back": "info", "Core": "info",
};

export function ExerciseDisplay({ segment, nextSegment, avatarUrl, isWorkoutPaused = false }: ExerciseDisplayProps) {
  const phaseColor = PHASE_COLORS[segment.phase];
  const isRest = segment.type === "rest";
  const isPrepare = segment.type === "prepare";

  if (isRest) {
    return (
      <div className="flex flex-col items-center text-center gap-4">
        <div
          className="text-[11px] font-bold uppercase tracking-[0.16em] px-3 py-1 rounded-full"
          style={{ background: "var(--intel-900)", color: "var(--intel-400)", border: "1px solid var(--intel-600)" }}
        >
          REST
        </div>

        <p
          className="font-display font-bold uppercase"
          style={{ fontSize: "clamp(28px, 7vw, 48px)", letterSpacing: "-0.02em", color: "var(--text-primary)" }}
        >
          Recover
        </p>
        <p className="text-[14px]" style={{ color: "var(--text-tertiary)" }}>
          Breathe. Reset. Next exercise coming up.
        </p>

        {nextSegment?.exerciseName && nextSegment.type === "work" && (
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-full"
            style={{ background: "var(--white-06)", border: "1px solid var(--border-subtle)" }}
          >
            <span className="text-[11px]" style={{ color: "var(--text-disabled)" }}>NEXT:</span>
            <span className="text-[12px] font-semibold" style={{ color: "var(--text-secondary)" }}>
              {nextSegment.exerciseName}
            </span>
          </div>
        )}
      </div>
    );
  }

  if (isPrepare) {
    return (
      <div className="flex flex-col items-center text-center gap-3">
        <div
          className="text-[11px] font-bold uppercase tracking-[0.16em] px-3 py-1 rounded-full"
          style={{ background: "var(--signal-900)", color: "var(--signal-400)", border: "1px solid var(--signal-600)" }}
        >
          GET READY
        </div>
        <p
          className="font-display font-bold uppercase"
          style={{ fontSize: "clamp(24px, 6vw, 40px)", letterSpacing: "-0.02em", color: phaseColor }}
        >
          {PHASE_LABELS[segment.phase]}
        </p>
        {segment.instructions && (
          <p className="text-[14px]" style={{ color: "var(--text-tertiary)" }}>
            {segment.instructions}
          </p>
        )}
      </div>
    );
  }

  // Work segment
  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Phase label */}
      <div className="flex items-center justify-between">
        <span
          className="text-[10px] font-bold uppercase tracking-[0.16em]"
          style={{ color: phaseColor }}
        >
          {PHASE_LABELS[segment.phase]}
          {segment.round && segment.totalRounds ? ` · Round ${segment.round}/${segment.totalRounds}` : ""}
        </span>
        {segment.phase === "finisher" && (
          <Badge variant="error">AMRAP</Badge>
        )}
      </div>

      {/* Exercise name */}
      <h2
        className="font-display font-bold uppercase"
        style={{
          fontSize: "clamp(30px, 8vw, 52px)",
          letterSpacing: "-0.02em",
          color: "var(--text-primary)",
          lineHeight: 1.05,
        }}
      >
        {segment.exerciseName}
      </h2>

      {/* 3D Avatar */}
      <WorkoutAvatar
        avatarUrl={avatarUrl}
        exerciseName={segment.exerciseName ?? "default"}
        phase={segment.phase}
        isWorkoutPaused={isWorkoutPaused}
        isRest={false}
        isPrepare={false}
      />

      {/* Muscle groups */}
      {segment.muscleGroups && segment.muscleGroups.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {segment.muscleGroups.map((m) => (
            <Badge key={m} variant={(MUSCLE_COLORS[m] as "success" | "warning" | "info") ?? "default"}>
              {m}
            </Badge>
          ))}
        </div>
      )}

      {/* Coaching cues */}
      {segment.cues && segment.cues.length > 0 && (
        <div className="flex flex-col gap-1">
          {segment.cues.map((cue, i) => (
            <div key={i} className="flex items-center gap-2">
              <div
                className="w-1 h-1 rounded-full flex-shrink-0"
                style={{ background: phaseColor }}
              />
              <p className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>{cue}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
