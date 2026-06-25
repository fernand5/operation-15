import * as React from "react";
import { cn } from "@/lib/utils";

/* ── Inline spinner ────────────────────────────────────────── */
interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = { sm: "w-4 h-4", md: "w-6 h-6", lg: "w-10 h-10" };

export function Spinner({ size = "md", className }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn(
        "inline-block rounded-full border-2 border-[var(--border-default)] border-t-[var(--operative-500)]",
        "animate-[spin_600ms_linear_infinite]",
        sizeMap[size],
        className
      )}
    />
  );
}

/* ── Radar pulse — full-screen page loading ────────────────── */
export function RadarPulse() {
  return (
    <div className="relative w-12 h-12">
      {[0, 700].map((delay) => (
        <span
          key={delay}
          aria-hidden="true"
          className="absolute inset-0 rounded-full border-2 border-[var(--operative-500)] animate-[radar-ping_1.4s_ease-out_infinite]"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
      <span className="absolute inset-[14px] rounded-full bg-[var(--operative-500)]" />
    </div>
  );
}

/* ── Full-screen loading overlay ───────────────────────────── */
interface FullScreenLoadingProps {
  message?: string;
}

export function FullScreenLoading({ message = "Loading..." }: FullScreenLoadingProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[var(--z-toast)] bg-[var(--bg-page)] flex flex-col items-center justify-center gap-4"
    >
      <RadarPulse />
      <p className="type-label-md text-[var(--text-tertiary)]">{message}</p>
    </div>
  );
}

/* ── Page-level loading (inline, inside layout) ────────────── */
export function PageLoading({ message }: { message?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center justify-center min-h-[320px] gap-4"
    >
      <RadarPulse />
      {message && <p className="type-label-md text-[var(--text-tertiary)]">{message}</p>}
    </div>
  );
}

/* ── Top progress bar (route transitions) ─────────────────── */
export function TopProgressBar({ visible }: { visible: boolean }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "fixed top-0 left-0 right-0 z-[var(--z-sticky)] h-[2px]",
        "bg-[var(--white-08)] transition-opacity duration-300",
        visible ? "opacity-100" : "opacity-0"
      )}
    >
      <div
        className={cn(
          "h-full bg-[var(--operative-500)] shadow-[0_0_8px_var(--operative-500)]",
          "rounded-[var(--radius-full)]",
          visible && "animate-[shimmer_1.4s_ease-in-out_infinite]"
        )}
        style={{ width: "60%" }}
      />
    </div>
  );
}

/* ── Button-level loading indicator (used inside Button) ───── */
export function ButtonSpinner() {
  return (
    <span
      aria-hidden="true"
      className="inline-block w-[14px] h-[14px] border-2 border-current border-r-transparent rounded-full animate-[spin_600ms_linear_infinite]"
    />
  );
}
