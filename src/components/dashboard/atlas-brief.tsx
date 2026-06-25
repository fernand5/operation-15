interface AtlasBriefProps {
  message?: string;
  streak?: number;
  displayName?: string;
}

const FALLBACK_MESSAGES = [
  "Your mission begins now. Complete Day 1 to earn your first 100 XP.",
  "Discipline is not motivation. It is a decision. Make it every day.",
  "15 minutes. That is all that stands between you and progress.",
  "Operators don't wait to feel ready. They deploy and get ready in the field.",
];

function getDailyMessage(streak: number, name: string): string {
  if (streak === 0) return `Welcome, ${name}. Your mission starts today. No excuses.`;
  if (streak === 1) return `Day 1 complete. The hardest step is done. Now do it again.`;
  if (streak < 7)  return `Day ${streak} active. Momentum is building. Do not break the chain.`;
  if (streak < 30) return `${streak}-day streak, ${name}. You are building something real. Push harder today.`;
  return `${streak} days straight, ${name}. That is not a streak — that is a lifestyle. ATLAS honours your service.`;
}

export function AtlasBrief({ message, streak = 0, displayName = "Operator" }: AtlasBriefProps) {
  const text = message ?? getDailyMessage(streak, displayName);

  return (
    <div
      className="rounded-[var(--radius-md)] p-4 flex gap-3 items-start"
      style={{
        background: "var(--operative-900)",
        border: "1px solid var(--operative-800)",
        borderLeft: "3px solid var(--operative-500)",
      }}
    >
      {/* ATLAS icon */}
      <div
        className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0"
        style={{ background: "var(--operative-800)", borderRadius: "var(--radius-xs)" }}
        aria-hidden="true"
      >
        <span className="text-sm">🪖</span>
      </div>

      <div className="flex-1 min-w-0">
        <p
          className="text-[10px] font-bold uppercase tracking-[0.12em] mb-1"
          style={{ color: "var(--operative-600)" }}
        >
          ATLAS — DAILY BRIEF
        </p>
        <p
          className="text-[13px] leading-relaxed"
          style={{ color: "var(--operative-300)" }}
        >
          &ldquo;{text}&rdquo;
        </p>
      </div>
    </div>
  );
}
