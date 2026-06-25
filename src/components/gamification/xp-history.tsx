import { formatDistanceToNow } from "date-fns";
import type { XP_HISTORY_MOCK } from "@/lib/ranks";

type XpEvent = (typeof XP_HISTORY_MOCK)[number];

const SOURCE_LABELS: Record<string, { label: string; color: string; emoji: string }> = {
  session_complete:  { label: "Mission Complete",    color: "var(--operative-400)", emoji: "⚔️" },
  perfect_session:   { label: "Perfect Completion",  color: "var(--operative-400)", emoji: "🎯" },
  streak_milestone:  { label: "Streak Milestone",    color: "var(--signal-400)",    emoji: "🔥" },
  achievement:       { label: "Achievement Unlocked", color: "var(--intel-400)",    emoji: "🏅" },
  nutrition_log:     { label: "Nutrition Logged",     color: "var(--classified-400)", emoji: "🥗" },
  personal_record:   { label: "Personal Record",      color: "var(--breach-400)",   emoji: "💪" },
};

interface XpHistoryProps {
  events: XpEvent[];
}

export function XpHistory({ events }: XpHistoryProps) {
  if (events.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>
          No XP events yet. Complete a mission to earn your first XP.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {events.map((event, i) => {
        const meta = SOURCE_LABELS[event.source] ?? { label: event.source, color: "var(--text-secondary)", emoji: "⭐" };
        const timeAgo = formatDistanceToNow(new Date(event.createdAt), { addSuffix: true });

        return (
          <div
            key={event.id}
            className="flex items-center gap-3 py-3"
            style={{ borderBottom: i < events.length - 1 ? "1px solid var(--border-subtle)" : "none" }}
          >
            <div
              className="w-9 h-9 rounded-[var(--radius-sm)] flex items-center justify-center flex-shrink-0 text-base"
              style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}
            >
              {meta.emoji}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium truncate" style={{ color: "var(--text-primary)" }}>
                {event.description}
              </p>
              <p className="text-[11px]" style={{ color: "var(--text-disabled)" }}>
                {meta.label} · {timeAgo}
              </p>
            </div>

            <div
              className="font-mono font-bold text-[15px] flex-shrink-0"
              style={{ color: meta.color }}
            >
              +{event.amount}
            </div>
          </div>
        );
      })}
    </div>
  );
}
