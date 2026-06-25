import { Crosshair } from "lucide-react";

export function AuthBrand() {
  return (
    <div className="flex flex-col items-center gap-3 mb-8 md:items-start">
      <div
        className="w-12 h-12 flex items-center justify-center"
        style={{ background: "var(--operative-500)", borderRadius: "var(--radius-md)" }}
      >
        <Crosshair
          className="w-6 h-6"
          style={{ color: "var(--ground-950)" }}
          strokeWidth={2.5}
        />
      </div>
      <div className="text-center md:text-left">
        <p
          className="font-display font-bold uppercase tracking-[0.12em]"
          style={{ fontSize: "20px", color: "var(--operative-500)" }}
        >
          OPERATION 15
        </p>
        <p className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
          15 Minutes. Military Precision. Real Results.
        </p>
      </div>
    </div>
  );
}
