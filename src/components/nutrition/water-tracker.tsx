"use client";

import { useState, useTransition } from "react";
import { logWaterAction } from "@/actions/nutrition";
import { Plus } from "lucide-react";

interface WaterTrackerProps {
  waterMl: number;
  targetMl?: number;
}

const GLASS_ML = 250;
const GLASSES_PER_DAY = 8;

export function WaterTracker({ waterMl, targetMl = 2000 }: WaterTrackerProps) {
  const [optimisticMl, setOptimisticMl] = useState(waterMl);
  const [isPending, startTransition] = useTransition();

  const glassesLogged  = Math.floor(optimisticMl / GLASS_ML);
  const pct = Math.min(100, Math.round((optimisticMl / targetMl) * 100));

  function addGlass() {
    setOptimisticMl((v) => v + GLASS_ML);
    startTransition(async () => {
      await logWaterAction(1);
    });
  }

  return (
    <div className="rounded-[var(--radius-md)] border p-4"
      style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}>

      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.1em]" style={{ color: "var(--text-disabled)" }}>
            Hydration Status
          </p>
          <p className="font-mono font-bold text-[18px]" style={{ color: "var(--intel-400)", lineHeight: 1 }}>
            {glassesLogged}
            <span className="text-[12px] font-normal" style={{ color: "var(--text-disabled)" }}>
              /{GLASSES_PER_DAY} glasses
            </span>
          </p>
          <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
            {optimisticMl}ml / {targetMl}ml
          </p>
        </div>
        <button
          onClick={addGlass}
          disabled={isPending}
          className="flex items-center gap-1.5 px-3 h-9 rounded-[var(--radius-sm)] text-[11px] font-bold uppercase tracking-[0.06em] transition-colors disabled:opacity-50"
          style={{
            background: "var(--intel-900)",
            border: "1px solid var(--intel-600)",
            color: "var(--intel-400)",
          }}
          aria-label="Add one glass of water"
        >
          <Plus className="w-3.5 h-3.5" />
          + Glass
        </button>
      </div>

      {/* Glass grid */}
      <div className="flex gap-1.5 flex-wrap mb-2" role="progressbar"
        aria-valuenow={glassesLogged} aria-valuemin={0} aria-valuemax={GLASSES_PER_DAY}
        aria-label={`${glassesLogged} of ${GLASSES_PER_DAY} glasses logged`}>
        {Array.from({ length: GLASSES_PER_DAY }, (_, i) => (
          <div key={i}
            className="flex-1 h-3 rounded-[2px] min-w-[20px] transition-colors duration-300"
            style={{
              background: i < glassesLogged ? "var(--intel-500)" : "var(--white-06)",
              border: `1px solid ${i < glassesLogged ? "var(--intel-600)" : "var(--border-subtle)"}`,
            }}
          />
        ))}
      </div>

      <div className="flex justify-between">
        <span className="text-[10px]" style={{ color: "var(--text-disabled)" }}>
          💧 {pct}% hydrated
        </span>
        <span className="text-[10px]" style={{ color: "var(--text-disabled)" }}>
          Goal: {targetMl / 1000}L
        </span>
      </div>
    </div>
  );
}
