"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

interface AchievementToastProps {
  achievementName: string;
  emoji: string;
  xpBonus: number;
  onDismiss?: () => void;
}

export function AchievementToast({ achievementName, emoji, xpBonus, onDismiss }: AchievementToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Animate in
    const t1 = setTimeout(() => setVisible(true), 50);
    // Auto-dismiss after 5 seconds
    const t2 = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onDismiss?.(), 300);
    }, 5000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDismiss]);

  function dismiss() {
    setVisible(false);
    setTimeout(() => onDismiss?.(), 300);
  }

  return (
    <div
      className="fixed bottom-20 left-4 right-4 z-[var(--z-toast)] max-w-sm mx-auto"
      style={{
        transform: visible ? "translateY(0)" : "translateY(120%)",
        opacity: visible ? 1 : 0,
        transition: "transform 300ms cubic-bezier(0.34,1.56,0.64,1), opacity 300ms ease",
      }}
      role="status"
      aria-live="polite"
    >
      <div
        className="flex items-center gap-3 p-4 rounded-[var(--radius-md)] border"
        style={{
          background: "var(--bg-elevated)",
          borderColor: "var(--signal-600)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.5), 0 0 20px rgba(255,179,0,0.1)",
        }}
      >
        {/* Achievement badge */}
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 text-xl"
          style={{
            background: "var(--signal-900)",
            border: "2px solid var(--signal-500)",
            boxShadow: "0 0 12px rgba(255,179,0,0.3)",
          }}
        >
          {emoji}
        </div>

        <div className="flex-1 min-w-0">
          <p
            className="text-[10px] font-bold uppercase tracking-[0.12em] mb-0.5"
            style={{ color: "var(--signal-600)" }}
          >
            Achievement Unlocked
          </p>
          <p className="text-[13px] font-semibold truncate" style={{ color: "var(--text-primary)" }}>
            {achievementName}
          </p>
          <p className="text-[11px] font-mono" style={{ color: "var(--signal-400)" }}>
            +{xpBonus} XP bonus
          </p>
        </div>

        <button
          onClick={dismiss}
          className="w-6 h-6 flex items-center justify-center flex-shrink-0 rounded transition-colors"
          style={{ color: "var(--text-disabled)" }}
          aria-label="Dismiss"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

/* ── Provider — manages a queue of achievement toasts ──────── */
import { createContext, useContext, useCallback } from "react";

interface ToastItem {
  id: string;
  achievementName: string;
  emoji: string;
  xpBonus: number;
}

interface ToastContextValue {
  showAchievement: (item: Omit<ToastItem, "id">) => void;
}

const ToastContext = createContext<ToastContextValue>({ showAchievement: () => {} });

export function useAchievementToast() {
  return useContext(ToastContext);
}

export function AchievementToastProvider({ children }: { children: React.ReactNode }) {
  const [queue, setQueue] = useState<ToastItem[]>([]);

  const showAchievement = useCallback((item: Omit<ToastItem, "id">) => {
    setQueue((q) => [...q, { ...item, id: `${Date.now()}` }]);
  }, []);

  const dismiss = useCallback((id: string) => {
    setQueue((q) => q.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showAchievement }}>
      {children}
      {queue[0] && (
        <AchievementToast
          key={queue[0].id}
          achievementName={queue[0].achievementName}
          emoji={queue[0].emoji}
          xpBonus={queue[0].xpBonus}
          onDismiss={() => dismiss(queue[0].id)}
        />
      )}
    </ToastContext.Provider>
  );
}
