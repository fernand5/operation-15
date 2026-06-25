"use client";

interface MacroRingProps {
  calories: number;
  target: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  proteinTarget: number;
  carbsTarget: number;
  fatTarget: number;
  size?: number;
}

export function MacroRing({
  calories, target,
  proteinG, carbsG, fatG,
  size = 120,
}: MacroRingProps) {
  const total = proteinG + carbsG + fatG;
  const r = (size / 2) - 10;
  const circ = 2 * Math.PI * r;
  const cx = size / 2;
  const cy = size / 2;

  // Segments as fractions of circumference
  const proteinLen = total > 0 ? (proteinG / total) * circ : 0;
  const carbsLen   = total > 0 ? (carbsG   / total) * circ : 0;
  const fatLen     = total > 0 ? (fatG     / total) * circ : 0;
  const gap = 2; // gap between segments in pixels

  const pct = Math.min(100, target > 0 ? Math.round((calories / target) * 100) : 0);
  const remaining = Math.max(0, target - calories);

  return (
    <div className="flex items-center gap-4">
      {/* Donut SVG */}
      <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
          {/* Background track */}
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--white-08)" strokeWidth="8" />

          {total > 0 ? (
            <>
              {/* Protein (green) */}
              <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--operative-500)" strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${Math.max(0, proteinLen - gap)} ${circ - Math.max(0, proteinLen - gap)}`}
                strokeDashoffset={circ * 0.25}
                transform={`rotate(-90 ${cx} ${cy})`}
              />
              {/* Carbs (blue) */}
              <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--intel-400)" strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${Math.max(0, carbsLen - gap)} ${circ - Math.max(0, carbsLen - gap)}`}
                strokeDashoffset={circ * 0.25 - proteinLen}
                transform={`rotate(-90 ${cx} ${cy})`}
              />
              {/* Fat (amber) */}
              <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--signal-400)" strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${Math.max(0, fatLen - gap)} ${circ - Math.max(0, fatLen - gap)}`}
                strokeDashoffset={circ * 0.25 - proteinLen - carbsLen}
                transform={`rotate(-90 ${cx} ${cy})`}
              />
            </>
          ) : (
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--white-06)" strokeWidth="8"
              strokeDasharray={`${circ * 0.75} ${circ * 0.25}`}
              strokeDashoffset={circ * 0.25}
              transform={`rotate(-90 ${cx} ${cy})`}
            />
          )}
        </svg>

        {/* Center text */}
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        }}>
          <span className="font-mono font-bold" style={{ fontSize: "18px", color: "var(--text-primary)", lineHeight: 1 }}>
            {calories.toLocaleString()}
          </span>
          <span className="text-[9px] font-bold uppercase tracking-[0.08em]" style={{ color: "var(--text-disabled)" }}>
            kcal
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="flex-1 flex flex-col gap-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.1em]" style={{ color: "var(--text-disabled)" }}>
            Daily Target
          </p>
          <p className="font-mono font-bold text-[18px]" style={{ color: "var(--text-primary)" }}>
            {target.toLocaleString()} <span className="text-[12px]" style={{ color: "var(--text-disabled)" }}>kcal</span>
          </p>
        </div>

        {/* Overall progress bar */}
        <div>
          <div className="h-[4px] rounded-full overflow-hidden" style={{ background: "var(--white-08)" }}>
            <div className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${pct}%`,
                background: pct >= 100
                  ? "var(--breach-500)"
                  : "linear-gradient(90deg, var(--operative-600), var(--operative-500))",
              }}
            />
          </div>
          <p className="text-[11px] mt-1 font-mono" style={{ color: "var(--operative-400)" }}>
            {pct >= 100
              ? `${calories - target} over target`
              : `${remaining.toLocaleString()} kcal remaining`}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Individual macro bar ──────────────────────────────────────── */
interface MacroPillProps {
  label: string;
  value: number;
  target: number;
  unit: string;
  color: string;
  bgColor: string;
}

export function MacroPill({ label, value, target, unit, color, bgColor }: MacroPillProps) {
  const pct = target > 0 ? Math.min(100, Math.round((value / target) * 100)) : 0;
  return (
    <div className="rounded-[var(--radius-sm)] p-3 text-center"
      style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
      <p className="font-mono font-bold text-[20px]" style={{ color, lineHeight: 1 }}>
        {value}<span className="text-[11px]" style={{ color: "var(--text-disabled)" }}>{unit}</span>
      </p>
      <p className="text-[9px] font-bold uppercase tracking-[0.1em] my-1" style={{ color: "var(--text-disabled)" }}>
        {label}
      </p>
      <div className="h-[3px] rounded-full overflow-hidden" style={{ background: "var(--white-08)" }}>
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
      <p className="text-[9px] mt-0.5" style={{ color: "var(--text-disabled)" }}>{pct}%</p>
    </div>
  );
}
