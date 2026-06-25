import Link from "next/link";
import { Crosshair } from "lucide-react";

interface TopNavProps {
  streak?: number;
  displayName?: string;
  initials?: string;
}

export function TopNav({ streak = 0, displayName, initials = "OP" }: TopNavProps) {
  return (
    <header
      className="h-14 flex-shrink-0 flex items-center px-4 gap-3 border-b z-50"
      style={{ background: "var(--bg-overlay)", borderColor: "var(--border-subtle)" }}
    >
      {/* Brand */}
      <Link
        href="/dashboard"
        className="flex items-center gap-2 no-underline"
        aria-label="Operation 15 — Go to dashboard"
      >
        <div
          className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0"
          style={{ background: "var(--operative-500)", borderRadius: "var(--radius-xs)" }}
        >
          <Crosshair
            className="w-4 h-4"
            style={{ color: "var(--ground-950)" }}
            strokeWidth={2.5}
          />
        </div>
        <span
          className="font-display font-bold uppercase hidden sm:block"
          style={{ fontSize: "15px", letterSpacing: "0.1em", color: "var(--text-primary)" }}
        >
          OP-15
        </span>
      </Link>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Streak badge */}
      {streak > 0 && (
        <Link
          href="/ops"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded no-underline"
          style={{
            background: "var(--signal-900)",
            border: "1px solid var(--signal-600)",
            borderRadius: "var(--radius-xs)",
          }}
          aria-label={`${streak}-day streak`}
        >
          <span className="text-sm leading-none">🔥</span>
          <span
            className="font-mono font-bold text-[13px]"
            style={{ color: "var(--signal-400)" }}
          >
            {streak}
          </span>
        </Link>
      )}

      {/* Avatar */}
      <Link
        href="/profile"
        className="w-8 h-8 rounded-full flex items-center justify-center border no-underline flex-shrink-0"
        style={{
          background: "var(--bg-elevated)",
          borderColor: "var(--border-default)",
          borderRadius: "var(--radius-full)",
        }}
        aria-label={`Profile${displayName ? ` — ${displayName}` : ""}`}
      >
        <span
          className="text-[11px] font-bold uppercase"
          style={{ color: "var(--text-tertiary)" }}
        >
          {initials.slice(0, 2)}
        </span>
      </Link>
    </header>
  );
}
