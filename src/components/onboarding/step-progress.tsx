import Link from "next/link";
import { ChevronLeft } from "lucide-react";

const STEP_LABELS = ["Objective", "Metrics", "Identity", "Level", "Assessment", "Rank", "Mission"];
const TOTAL_STEPS = 7;

interface StepProgressProps {
  currentStep: number;
}

export function StepProgress({ currentStep }: StepProgressProps) {
  const canGoBack = currentStep > 1 && currentStep < 6; // assessment locks back

  return (
    <div
      className="flex-shrink-0 border-b"
      style={{ background: "var(--ground-900)", borderColor: "var(--border-subtle)" }}
    >
      <div className="max-w-lg mx-auto px-4 py-3">
        {/* Top row: back button + step label */}
        <div className="flex items-center justify-between mb-3">
          <div className="w-8">
            {canGoBack && (
              <Link
                href={`/onboarding/${currentStep - 1}`}
                className="flex items-center justify-center w-8 h-8 rounded-[var(--radius-xs)] transition-colors"
                style={{ color: "var(--text-tertiary)" }}
                aria-label="Go back"
              >
                <ChevronLeft className="w-5 h-5" />
              </Link>
            )}
          </div>
          <span
            className="text-[10px] font-bold uppercase tracking-[0.12em]"
            style={{ color: "var(--text-tertiary)" }}
          >
            {STEP_LABELS[currentStep - 1]} — Step {currentStep}/{TOTAL_STEPS}
          </span>
          <div className="w-8" />
        </div>

        {/* Segment progress bar */}
        <div className="flex gap-1" role="progressbar" aria-valuenow={currentStep} aria-valuemin={1} aria-valuemax={TOTAL_STEPS}>
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className="flex-1 h-[3px] rounded-full transition-colors duration-300"
              style={{
                background:
                  i < currentStep
                    ? "var(--operative-500)"
                    : i === currentStep - 1
                    ? "var(--operative-400)"
                    : "var(--ground-600)",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
