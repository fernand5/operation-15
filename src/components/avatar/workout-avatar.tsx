"use client";

import { useState, useCallback } from "react";
import { AvatarViewer } from "./avatar-viewer";
import { AvatarControls } from "./avatar-controls";
import type { PhaseType } from "@/lib/workout-engine";

interface WorkoutAvatarProps {
  avatarUrl?: string | null;
  exerciseName: string;
  phase: PhaseType;
  isWorkoutPaused: boolean;
  isRest: boolean;
  isPrepare: boolean;
}

export function WorkoutAvatar({
  avatarUrl,
  exerciseName,
  phase,
  isWorkoutPaused,
  isRest,
  isPrepare,
}: WorkoutAvatarProps) {
  const [avatarPaused, setAvatarPaused] = useState(false);
  const [replayKey, setReplayKey] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const effectivePaused = isWorkoutPaused || avatarPaused;

  const handleReplay = useCallback(() => {
    setReplayKey((k) => k + 1);
    setAvatarPaused(false);
  }, []);

  const content = (
    <div
      className="flex flex-col rounded-[var(--radius-md)] overflow-hidden"
      style={{
        background: "var(--bg-elevated)",
        border: "1px solid var(--border-subtle)",
      }}
    >
      {/* 3D Viewport */}
      <div style={{ height: isFullscreen ? "calc(100vh - 120px)" : "200px" }}>
        <AvatarViewer
          key={replayKey}
          avatarUrl={avatarUrl}
          exerciseName={isPrepare ? "default" : exerciseName}
          phase={phase}
          isPaused={effectivePaused}
          isRest={isRest || isPrepare}
          showControls={!isFullscreen}
          className="w-full h-full"
        />
      </div>

      {/* Controls bar */}
      <div
        className="flex items-center justify-between px-3 py-2 border-t"
        style={{ borderColor: "var(--border-subtle)", background: "var(--bg-overlay)" }}
      >
        <div>
          <p
            className="text-[9px] font-bold uppercase tracking-[0.12em]"
            style={{ color: "var(--text-disabled)" }}
          >
            {isRest ? "REST" : isPrepare ? "GET READY" : "3D AVATAR"}
          </p>
          {!isRest && !isPrepare && (
            <p className="text-[11px] font-semibold" style={{ color: "var(--text-secondary)" }}>
              {exerciseName}
            </p>
          )}
        </div>

        <AvatarControls
          isPaused={avatarPaused}
          onTogglePause={() => setAvatarPaused((v) => !v)}
          onReplay={handleReplay}
          isFullscreen={isFullscreen}
          onToggleFullscreen={() => setIsFullscreen((v) => !v)}
          compact
        />
      </div>
    </div>
  );

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-[var(--z-modal)] flex flex-col" style={{ background: "var(--bg-page)" }}>
        {content}
      </div>
    );
  }

  return content;
}
