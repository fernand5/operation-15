"use client";

import { Play, Pause, RotateCcw, Maximize2, Minimize2 } from "lucide-react";

interface AvatarControlsProps {
  isPaused: boolean;
  onTogglePause: () => void;
  onReplay: () => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  compact?: boolean;
}

export function AvatarControls({
  isPaused,
  onTogglePause,
  onReplay,
  isFullscreen,
  onToggleFullscreen,
  compact = false,
}: AvatarControlsProps) {
  const btnBase = "flex items-center justify-center transition-colors duration-150";
  const btnStyle = compact
    ? "w-8 h-8 rounded-[var(--radius-xs)]"
    : "w-10 h-10 rounded-[var(--radius-sm)]";

  return (
    <div className="flex items-center gap-2">
      {/* Play / Pause */}
      <button
        onClick={onTogglePause}
        className={`${btnBase} ${btnStyle}`}
        style={{
          background: "var(--operative-900)",
          border: "1px solid var(--operative-600)",
          color: "var(--operative-500)",
        }}
        aria-label={isPaused ? "Play animation" : "Pause animation"}
      >
        {isPaused
          ? <Play className={compact ? "w-3.5 h-3.5" : "w-4 h-4"} fill="currentColor" />
          : <Pause className={compact ? "w-3.5 h-3.5" : "w-4 h-4"} />
        }
      </button>

      {/* Replay */}
      <button
        onClick={onReplay}
        className={`${btnBase} ${btnStyle}`}
        style={{
          background: "var(--white-06)",
          border: "1px solid var(--border-default)",
          color: "var(--text-secondary)",
        }}
        aria-label="Replay animation from start"
      >
        <RotateCcw className={compact ? "w-3.5 h-3.5" : "w-4 h-4"} />
      </button>

      {/* Fullscreen toggle */}
      {onToggleFullscreen && (
        <button
          onClick={onToggleFullscreen}
          className={`${btnBase} ${btnStyle}`}
          style={{
            background: "var(--white-06)",
            border: "1px solid var(--border-default)",
            color: "var(--text-secondary)",
          }}
          aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen avatar"}
        >
          {isFullscreen
            ? <Minimize2 className={compact ? "w-3.5 h-3.5" : "w-4 h-4"} />
            : <Maximize2 className={compact ? "w-3.5 h-3.5" : "w-4 h-4"} />
          }
        </button>
      )}
    </div>
  );
}
