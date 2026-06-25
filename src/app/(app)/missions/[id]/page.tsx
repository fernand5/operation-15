import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OPERATION_THUNDER, PHASE_LABELS, PHASE_COLORS } from "@/lib/workout-engine";
import { ChevronLeft, Play, Clock, Flame, Zap } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return { title: `Mission — ${id}` };
}

const PHASE_BADGE_VARIANT: Record<string, "success" | "warning" | "error" | "info" | "default"> = {
  activation:    "info",
  circuit_a:     "success",
  circuit_b:     "success",
  finisher:      "error",
  decompression: "default",
};

export default async function MissionDetailPage({ params }: PageProps) {
  const { id } = await params;
  // For now, all IDs resolve to the mock workout
  const workout = OPERATION_THUNDER;
  if (!workout) notFound();

  // Group segments by phase (deduplicated)
  const phases = workout.segments.reduce<{ phase: string; segments: typeof workout.segments }[]>(
    (acc, seg) => {
      const last = acc[acc.length - 1];
      if (last && last.phase === seg.phase) {
        last.segments.push(seg);
      } else {
        acc.push({ phase: seg.phase, segments: [seg] });
      }
      return acc;
    },
    []
  );

  const totalSeconds = workout.segments.reduce((a, s) => a + s.duration, 0);
  const workSegments = workout.segments.filter(s => s.type === "work");

  return (
    <div className="flex flex-col min-h-full">
      {/* Back nav */}
      <div
        className="flex items-center gap-2 px-4 py-3 border-b flex-shrink-0"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <Link
          href="/dashboard"
          className="flex items-center gap-1 text-[12px] font-semibold uppercase tracking-[0.06em] no-underline transition-colors"
          style={{ color: "var(--text-tertiary)" }}
        >
          <ChevronLeft className="w-4 h-4" />
          Dashboard
        </Link>
      </div>

      <div className="flex-1 p-4 pb-6 max-w-lg mx-auto w-full">
        {/* Hero */}
        <div
          className="rounded-[var(--radius-md)] border p-5 mb-5"
          style={{ background: "var(--bg-elevated)", borderColor: "var(--border-default)" }}
        >
          <p
            className="text-[10px] font-bold uppercase tracking-[0.12em] mb-1"
            style={{ color: "var(--text-disabled)" }}
          >
            {workout.operationName}
          </p>
          <h1
            className="font-display font-bold uppercase mb-4"
            style={{ fontSize: "clamp(24px, 6vw, 40px)", letterSpacing: "-0.02em", color: "var(--text-primary)" }}
          >
            {workout.title}
          </h1>

          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { icon: Clock, label: "Duration", value: `${Math.round(totalSeconds / 60)} min`, color: "var(--intel-400)" },
              { icon: Zap, label: "XP Reward", value: `+${workout.xpReward}`, color: "var(--signal-400)" },
              { icon: Flame, label: "Est. Cal", value: `~${workout.estimatedCalories}`, color: "var(--breach-400)" },
            ].map(({ icon: Icon, label, value, color }) => (
              <div
                key={label}
                className="rounded-[var(--radius-sm)] border p-3 text-center"
                style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
              >
                <Icon className="w-4 h-4 mx-auto mb-1" style={{ color }} />
                <p className="font-mono font-bold text-[16px]" style={{ color }}>{value}</p>
                <p className="text-[10px] uppercase tracking-[0.08em] mt-0.5" style={{ color: "var(--text-disabled)" }}>{label}</p>
              </div>
            ))}
          </div>

          <Link href={`/missions/${id}/active`} className="block no-underline">
            <Button variant="primary" size="lg" fullWidth>
              <Play className="w-4 h-4" fill="currentColor" />
              Start Mission
            </Button>
          </Link>
        </div>

        {/* Mission structure */}
        <div>
          <p
            className="text-[11px] font-bold uppercase tracking-[0.12em] mb-3"
            style={{ color: "var(--text-disabled)" }}
          >
            Mission Structure
          </p>

          <div
            className="rounded-[var(--radius-md)] border overflow-hidden"
            style={{ borderColor: "var(--border-subtle)" }}
          >
            {phases.map(({ phase, segments }, i) => {
              const phaseDuration = segments.reduce((a, s) => a + s.duration, 0);
              const workSegs = segments.filter(s => s.type === "work");
              const phaseColor = PHASE_COLORS[phase as keyof typeof PHASE_COLORS];

              return (
                <div
                  key={`${phase}-${i}`}
                  className="flex items-center gap-3 p-4"
                  style={{
                    borderBottom: i < phases.length - 1 ? "1px solid var(--border-subtle)" : "none",
                    background: i % 2 === 0 ? "var(--bg-surface)" : "var(--bg-elevated)",
                  }}
                >
                  {/* Color bar */}
                  <div
                    className="w-1 rounded-full flex-shrink-0 self-stretch min-h-[40px]"
                    style={{ background: phaseColor }}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <Badge variant={PHASE_BADGE_VARIANT[phase] ?? "default"}>
                        {PHASE_LABELS[phase as keyof typeof PHASE_LABELS]}
                      </Badge>
                    </div>
                    <p className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
                      {workSegs.map(s => s.exerciseName).filter(Boolean).join(" · ") || "Rest & Recover"}
                    </p>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="font-mono font-bold text-[14px]" style={{ color: phaseColor }}>
                      {Math.floor(phaseDuration / 60)}:{(phaseDuration % 60).toString().padStart(2, "0")}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Exercises involved */}
        <div className="mt-5">
          <p
            className="text-[11px] font-bold uppercase tracking-[0.12em] mb-3"
            style={{ color: "var(--text-disabled)" }}
          >
            Exercises ({workSegments.length} total)
          </p>
          <div className="flex flex-col gap-2">
            {[...new Set(workSegments.map(s => s.exerciseName))].map((name) => {
              const seg = workSegments.find(s => s.exerciseName === name)!;
              return (
                <div
                  key={name}
                  className="flex items-center gap-3 p-3 rounded-[var(--radius-sm)] border"
                  style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
                >
                  <div
                    className="w-8 h-8 rounded flex-shrink-0"
                    style={{ background: "var(--white-08)" }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                      {name}
                    </p>
                    <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                      {seg.muscleGroups?.join(" · ")}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
