import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ServerCrash, WifiOff, ShieldX } from "lucide-react";

/* ── Inline field error ─────────────────────────────────────── */
interface FieldErrorProps {
  message: string;
  id?: string;
}

export function FieldError({ message, id }: FieldErrorProps) {
  return (
    <p
      id={id}
      role="alert"
      className="flex items-center gap-1 mt-1.5 text-[12px] text-[var(--breach-400)] font-sans"
    >
      <AlertTriangle className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
      {message}
    </p>
  );
}

/* ── Toast / inline banner ──────────────────────────────────── */
type AlertVariant = "error" | "warning" | "success" | "info";

interface AlertBannerProps {
  variant: AlertVariant;
  title?: string;
  message: string;
  onDismiss?: () => void;
  className?: string;
}

const alertConfig: Record<
  AlertVariant,
  { bg: string; border: string; text: string; icon: React.ReactNode }
> = {
  error: {
    bg: "bg-[var(--status-error-bg)]",
    border: "border-[var(--status-error-border)]",
    text: "text-[var(--status-error-text)]",
    icon: <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" aria-hidden="true" />,
  },
  warning: {
    bg: "bg-[var(--status-warning-bg)]",
    border: "border-[var(--status-warning-border)]",
    text: "text-[var(--status-warning-text)]",
    icon: <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" aria-hidden="true" />,
  },
  success: {
    bg: "bg-[var(--status-success-bg)]",
    border: "border-[var(--status-success-border)]",
    text: "text-[var(--status-success-text)]",
    icon: <ShieldX className="w-4 h-4 flex-shrink-0 mt-0.5" aria-hidden="true" />,
  },
  info: {
    bg: "bg-[var(--status-info-bg)]",
    border: "border-[var(--status-info-border)]",
    text: "text-[var(--status-info-text)]",
    icon: <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" aria-hidden="true" />,
  },
};

export function AlertBanner({ variant, title, message, onDismiss, className }: AlertBannerProps) {
  const config = alertConfig[variant];
  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-3 p-3 rounded-[var(--radius-sm)] border",
        config.bg,
        config.border,
        className
      )}
    >
      <span className={config.text}>{config.icon}</span>
      <div className="flex-1 min-w-0">
        {title && (
          <p className={cn("text-[12px] font-bold uppercase tracking-[0.06em] mb-0.5", config.text)}>
            {title}
          </p>
        )}
        <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">{message}</p>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-[var(--text-disabled)] hover:text-[var(--text-primary)] transition-colors text-xs flex-shrink-0"
          aria-label="Dismiss"
        >
          ✕
        </button>
      )}
    </div>
  );
}

/* ── Page-level error (404 / 500 / network) ─────────────────── */
interface PageErrorProps {
  code?: string | number;
  title: string;
  description: string;
  onRetry?: () => void;
  onHome?: () => void;
}

export function PageError({ code, title, description, onRetry, onHome }: PageErrorProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-8 bg-[var(--bg-page)]">
      {code && (
        <div
          aria-hidden="true"
          className="font-display font-extrabold leading-none tracking-[-0.04em] text-[var(--breach-900)] mb-6"
          style={{
            fontSize: "clamp(80px, 20vw, 160px)",
            WebkitTextStroke: `1px var(--breach-600)`,
          }}
        >
          {code}
        </div>
      )}
      <h1 className="font-display font-bold uppercase tracking-[-0.02em] text-[var(--text-primary)] mb-3"
          style={{ fontSize: "clamp(24px, 4vw, 40px)" }}>
        {title}
      </h1>
      <p className="text-[15px] text-[var(--text-tertiary)] max-w-[400px] leading-relaxed mb-8">
        {description}
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        {onRetry && (
          <Button variant="primary" onClick={onRetry}>
            Retry
          </Button>
        )}
        {onHome && (
          <Button variant="secondary" onClick={onHome}>
            Return to Base
          </Button>
        )}
      </div>
    </div>
  );
}

/* ── Pre-built page errors ──────────────────────────────────── */
export const PageErrors = {
  NotFound: (props: { onHome?: () => void }) => (
    <PageError
      code={404}
      title="LOCATION UNKNOWN"
      description="This coordinate does not exist in our system. Return to base."
      {...props}
    />
  ),
  Forbidden: (props: { onHome?: () => void }) => (
    <PageError
      code={403}
      title="ACCESS DENIED"
      description="You do not have clearance for this operation."
      {...props}
    />
  ),
  ServerError: (props: { onRetry?: () => void; onHome?: () => void }) => (
    <PageError
      code={500}
      title="SYSTEM FAILURE"
      description="Command center is experiencing technical difficulties. Stand by."
      {...props}
    />
  ),
  NetworkError: (props: { onRetry?: () => void }) => (
    <PageError
      title="CONNECTION LOST"
      description="Unable to reach base. Check signal and retry."
      {...props}
    />
  ),
} as const;

/* ── Inline component error boundary fallback ───────────────── */
export function ComponentError({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center p-6 rounded-[var(--radius-md)] border border-[var(--breach-600)] bg-[var(--breach-900)] gap-3 text-center">
      <ServerCrash className="w-8 h-8 text-[var(--breach-400)]" />
      <p className="text-[13px] text-[var(--breach-400)] font-semibold">
        Failed to load component
      </p>
      {onRetry && (
        <Button variant="destructive" size="sm" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  );
}

/* ── Network offline banner ─────────────────────────────────── */
export function OfflineBanner() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-0 left-0 right-0 z-[var(--z-toast)] flex items-center justify-center gap-2 bg-[var(--signal-900)] border-b border-[var(--signal-600)] py-2 text-[12px] font-semibold text-[var(--signal-400)] uppercase tracking-[0.06em]"
    >
      <WifiOff className="w-3 h-3" aria-hidden="true" />
      Signal Lost — Operating Offline
    </div>
  );
}
