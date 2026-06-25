"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Pause, Play, X, SkipForward } from "lucide-react";
import { useWorkoutStore } from "@/store/workout-store";
import { WorkoutTimer, GlobalProgress } from "@/components/workout/workout-timer";
import { ExerciseDisplay } from "@/components/workout/exercise-display";
import { MissionComplete } from "@/components/workout/mission-complete";
import { OPERATION_THUNDER, WORKOUT_TOTAL_SECONDS, PHASE_COLORS } from "@/lib/workout-engine";
import { completeSessionAction } from "@/actions/workout";
import type { CompleteSessionResult } from "@/actions/workout";
import { Button } from "@/components/ui/button";

interface ActiveWorkoutProps {
  sessionId: string;
  workoutId: string;
}

export function ActiveWorkout({ sessionId, workoutId }: ActiveWorkoutProps) {
  const router = useRouter();
  const rafRef = useRef<number | null>(null);
  const [showPause, setShowPause] = useState(false);
  const [completeResult, setCompleteResult] = useState<CompleteSessionResult | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);

  const {
    status, workout,
    elapsed, currentSegment, currentSegmentIndex, segmentRemaining,
    completionPct,
    startWorkout, pauseWorkout, resumeWorkout, endWorkout, tick,
  } = useWorkoutStore();

  // Start the workout on mount
  useEffect(() => {
    startWorkout(OPERATION_THUNDER, sessionId);
  }, [sessionId, startWorkout]);

  // rAF-based tick loop — wall-clock anchored
  const loop = useCallback(() => {
    tick(Date.now());
    rafRef.current = requestAnimationFrame(loop);
  }, [tick]);

  useEffect(() => {
    if (status === "active") {
      rafRef.current = requestAnimationFrame(loop);
    } else {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    }
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [status, loop]);

  // Auto-complete when timer reaches end
  useEffect(() => {
    if (status === "complete" && !completeResult && !isCompleting) {
      setIsCompleting(true);
      completeSessionAction(sessionId, elapsed, completionPct).then(setCompleteResult);
    }
  }, [status, completeResult, isCompleting, sessionId, elapsed, completionPct]);

  if (!workout || !currentSegment) return null;

  // Show complete screen
  if (status === "complete" && completeResult) {
    return (
      <MissionComplete
        result={completeResult}
        durationSec={elapsed}
        completionPct={completionPct}
      />
    );
  }

  // Loading complete result
  if (status === "complete" && !completeResult) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div
          className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin"
          style={{ borderColor: "var(--operative-500)", borderTopColor: "transparent" }}
        />
        <p className="type-callsign">Processing results...</p>
      </div>
    );
  }

  const isRest = currentSegment.type === "rest";
  const isPrepare = currentSegment.type === "prepare";
  const segmentColor = isRest
    ? "var(--intel-400)"
    : isPrepare
    ? "var(--signal-400)"
    : PHASE_COLORS[currentSegment.phase];

  // Next segment for preview
  const nextSegment = workout.segments[currentSegmentIndex + 1] ?? null;

  return (
    <div
      className="fixed inset-0 flex flex-col"
      style={{ background: "var(--bg-page)" }}
    >
      {/* ── Top bar ── */}
      <div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0 border-b"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <button
          onClick={() => { pauseWorkout(); setShowPause(true); }}
          className="w-9 h-9 rounded-[var(--radius-sm)] flex items-center justify-center transition-colors"
          style={{ background: "var(--white-08)" }}
          aria-label="Pause workout"
        >
          <Pause className="w-4 h-4" style={{ color: "var(--text-secondary)" }} />
        </button>

        <GlobalProgress
          completionPct={completionPct}
          elapsed={elapsed}
          total={WORKOUT_TOTAL_SECONDS}
        />

        <div className="w-9 flex justify-end">
          <span
            className="font-mono text-[12px]"
            style={{ color: "var(--text-disabled)" }}
          >
            {currentSegmentIndex + 1}/{workout.segments.length}
          </span>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col items-center justify-between p-4 overflow-hidden">

        {/* Timer */}
        <div className="flex flex-col items-center gap-3 pt-4">
          <WorkoutTimer
            remaining={segmentRemaining}
            total={currentSegment.duration}
            color={segmentColor}
            size={180}
          />
          {currentSegment.phase === "finisher" && currentSegment.type === "work" && (
            <p
              className="text-[11px] font-bold uppercase tracking-[0.12em]"
              style={{ color: "var(--breach-400)" }}
            >
              MAXIMUM EFFORT
            </p>
          )}
        </div>

        {/* Exercise info */}
        <div className="w-full max-w-sm flex-1 flex flex-col justify-center py-4">
          <ExerciseDisplay
            segment={currentSegment}
            nextSegment={nextSegment}
            isWorkoutPaused={status === "paused"}
          />
        </div>

        {/* Bottom controls */}
        <div className="w-full max-w-sm pb-4 flex gap-3">
          <button
            onClick={() => { pauseWorkout(); setShowPause(true); }}
            className="flex-1 h-12 rounded-[var(--radius-sm)] flex items-center justify-center gap-2 text-[12px] font-semibold uppercase tracking-[0.06em] transition-colors"
            style={{ background: "var(--white-08)", color: "var(--text-secondary)", border: "1px solid var(--border-default)" }}
          >
            <Pause className="w-4 h-4" />
            Pause
          </button>
        </div>
      </div>

      {/* ── Pause overlay ── */}
      {showPause && status === "paused" && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 p-8"
          style={{ background: "rgba(8,10,12,0.95)" }}
        >
          <div className="text-center mb-4">
            <p className="type-callsign mb-2">MISSION PAUSED</p>
            <p className="font-display font-bold uppercase text-[28px]" style={{ color: "var(--text-primary)" }}>
              {currentSegment.exerciseName ?? "Rest"}
            </p>
            <p className="text-[13px] mt-1" style={{ color: "var(--text-tertiary)" }}>
              {Math.round(completionPct)}% complete · {Math.floor(elapsed / 60)}m {elapsed % 60}s elapsed
            </p>
          </div>

          <div className="flex flex-col gap-3 w-full max-w-xs">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => { resumeWorkout(); setShowPause(false); }}
            >
              <Play className="w-4 h-4" fill="currentColor" />
              Resume Mission
            </Button>
            <Button
              variant="secondary"
              size="md"
              fullWidth
              onClick={() => {
                endWorkout();
                setShowPause(false);
                setIsCompleting(true);
                completeSessionAction(sessionId, elapsed, completionPct).then(setCompleteResult);
              }}
            >
              <SkipForward className="w-4 h-4" />
              End Session
            </Button>
            <Button
              variant="destructive"
              size="md"
              fullWidth
              onClick={() => { endWorkout(); router.push("/dashboard"); }}
            >
              <X className="w-4 h-4" />
              Abandon Mission
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
