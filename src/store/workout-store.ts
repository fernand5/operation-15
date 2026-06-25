"use client";

import { create } from "zustand";
import type { WorkoutDefinition, WorkoutSegment } from "@/lib/workout-engine";
import { getSegmentAt, getCompletionPct, getTotalDuration } from "@/lib/workout-engine";

export type WorkoutStatus = "idle" | "active" | "paused" | "complete";

interface WorkoutState {
  status: WorkoutStatus;
  workout: WorkoutDefinition | null;
  sessionId: string | null;

  // Wall-clock anchored timing
  startWallTime: number | null;   // Date.now() when first started
  pausedElapsed: number;          // cumulative seconds elapsed before current pause
  pauseStartTime: number | null;  // Date.now() when current pause began

  // Derived from elapsed time — updated by requestAnimationFrame
  elapsed: number;

  // Current segment info (recomputed from elapsed)
  currentSegment: WorkoutSegment | null;
  currentSegmentIndex: number;
  segmentElapsed: number;
  segmentRemaining: number;
  completionPct: number;

  // Actions
  startWorkout: (workout: WorkoutDefinition, sessionId: string) => void;
  pauseWorkout: () => void;
  resumeWorkout: () => void;
  endWorkout: () => void;
  tick: (nowMs: number) => void;
}

export const useWorkoutStore = create<WorkoutState>()((set, get) => ({
  status: "idle",
  workout: null,
  sessionId: null,
  startWallTime: null,
  pausedElapsed: 0,
  pauseStartTime: null,
  elapsed: 0,
  currentSegment: null,
  currentSegmentIndex: 0,
  segmentElapsed: 0,
  segmentRemaining: 0,
  completionPct: 0,

  startWorkout: (workout, sessionId) => {
    const now = Date.now();
    const info = getSegmentAt(workout.segments, 0);
    set({
      status: "active",
      workout,
      sessionId,
      startWallTime: now,
      pausedElapsed: 0,
      pauseStartTime: null,
      elapsed: 0,
      currentSegment: info.segment,
      currentSegmentIndex: info.index,
      segmentElapsed: 0,
      segmentRemaining: info.segmentRemaining,
      completionPct: 0,
    });
  },

  pauseWorkout: () => {
    const { status, startWallTime, pausedElapsed } = get();
    if (status !== "active" || !startWallTime) return;
    const now = Date.now();
    const currentElapsed = pausedElapsed + Math.floor((now - startWallTime) / 1000);
    set({
      status: "paused",
      pauseStartTime: now,
      pausedElapsed: currentElapsed,
      startWallTime: null,
    });
  },

  resumeWorkout: () => {
    const { status } = get();
    if (status !== "paused") return;
    set({ status: "active", startWallTime: Date.now(), pauseStartTime: null });
  },

  endWorkout: () => {
    set({
      status: "complete",
      startWallTime: null,
      pauseStartTime: null,
    });
  },

  tick: (nowMs) => {
    const { status, workout, startWallTime, pausedElapsed } = get();
    if (status !== "active" || !workout || !startWallTime) return;

    const elapsed = pausedElapsed + Math.floor((nowMs - startWallTime) / 1000);
    const totalDuration = getTotalDuration(workout.segments);

    if (elapsed >= totalDuration) {
      set({ status: "complete", elapsed: totalDuration, completionPct: 100 });
      return;
    }

    const info = getSegmentAt(workout.segments, elapsed);
    set({
      elapsed,
      currentSegment: info.segment,
      currentSegmentIndex: info.index,
      segmentElapsed: info.segmentElapsed,
      segmentRemaining: Math.ceil(info.segmentRemaining),
      completionPct: getCompletionPct(workout.segments, elapsed),
    });
  },
}));
