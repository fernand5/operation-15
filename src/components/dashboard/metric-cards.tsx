import { TrendingUp, TrendingDown } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  trend?: number; // percentage change vs last period
  color?: string;
}

export function MetricCard({ label, value, unit, trend, color = "var(--operative-400)" }: MetricCardProps) {
  const trendPositive = trend !== undefined && trend > 0;
  const trendNegative = trend !== undefined && trend < 0;

  return (
    <div
      className="rounded-[var(--radius-md)] border p-4 flex flex-col gap-1"
      style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
    >
      <p
        className="text-[10px] font-bold uppercase tracking-[0.1em]"
        style={{ color: "var(--text-disabled)" }}
      >
        {label}
      </p>
      <div className="flex items-baseline gap-1">
        <span
          className="font-mono font-bold"
          style={{ fontSize: "24px", color, lineHeight: 1 }}
        >
          {value}
        </span>
        {unit && (
          <span className="text-[11px]" style={{ color: "var(--text-disabled)" }}>
            {unit}
          </span>
        )}
      </div>
      {trend !== undefined && (
        <div className="flex items-center gap-1">
          {trendPositive && <TrendingUp className="w-3 h-3" style={{ color: "var(--operative-500)" }} />}
          {trendNegative && <TrendingDown className="w-3 h-3" style={{ color: "var(--breach-400)" }} />}
          <span
            className="text-[10px] font-semibold"
            style={{ color: trendPositive ? "var(--operative-500)" : trendNegative ? "var(--breach-400)" : "var(--text-disabled)" }}
          >
            {trend > 0 ? "+" : ""}{trend}% vs last week
          </span>
        </div>
      )}
    </div>
  );
}

interface WeeklyStatsProps {
  sessions: number;
  xpEarned: number;
  caloriesBurned: number;
}

export function WeeklyStats({ sessions, xpEarned, caloriesBurned }: WeeklyStatsProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <MetricCard
        label="Sessions"
        value={sessions}
        unit="/ 6"
        color="var(--operative-400)"
      />
      <MetricCard
        label="XP Earned"
        value={xpEarned >= 1000 ? `${(xpEarned / 1000).toFixed(1)}k` : xpEarned}
        unit="pts"
        color="var(--signal-400)"
      />
      <MetricCard
        label="Cal Burned"
        value={caloriesBurned >= 1000 ? `${(caloriesBurned / 1000).toFixed(1)}k` : caloriesBurned}
        unit="kcal"
        color="var(--intel-400)"
      />
    </div>
  );
}
