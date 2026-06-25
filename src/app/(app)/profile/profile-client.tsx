"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { AvatarViewer } from "@/components/avatar/avatar-viewer";
import { RPMCreator } from "@/components/avatar/rpm-creator";
import { AvatarControls } from "@/components/avatar/avatar-controls";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/actions/auth";
import { User, Settings, Bell, Lock, ChevronRight, Edit3 } from "lucide-react";

interface ProfileClientProps {
  displayName: string;
  rankName: string;
  rankId: number;
  totalXp: number;
  currentStreak: number;
  sessionsTotal: number;
  rpmAvatarUrl: string | null;
}

export function ProfileClient({
  displayName,
  rankName,
  rankId,
  totalXp,
  currentStreak,
  sessionsTotal,
  rpmAvatarUrl,
}: ProfileClientProps) {
  const [showRPMCreator, setShowRPMCreator] = useState(false);
  const [localAvatarUrl, setLocalAvatarUrl] = useState<string | null>(rpmAvatarUrl);
  const [avatarPaused, setAvatarPaused] = useState(false);
  const [replayKey, setReplayKey] = useState(0);
  const [isLoggingOut, startLogoutTransition] = useTransition();

  const initials = displayName.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  function handleAvatarCreated(url: string) {
    setLocalAvatarUrl(url);
    setShowRPMCreator(false);
    // TODO: persist to profile via server action
  }

  return (
    <>
      {showRPMCreator && (
        <RPMCreator
          onAvatarCreated={handleAvatarCreated}
          onClose={() => setShowRPMCreator(false)}
        />
      )}

      <div className="flex flex-col min-h-full p-4 pb-6 max-w-lg mx-auto">
        {/* ── Rank card ── */}
        <div
          className="rounded-[var(--radius-md)] border p-5 mb-5 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, var(--bg-elevated) 0%, var(--bg-overlay) 100%)",
            borderColor: "var(--operative-600)",
            boxShadow: "0 0 32px rgba(0,230,118,0.08)",
          }}
        >
          <div className="flex items-center gap-4 mb-4">
            {/* Avatar preview (small) */}
            <div
              className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 border-2"
              style={{ borderColor: "var(--operative-500)" }}
            >
              {localAvatarUrl ? (
                <div className="w-full h-full">
                  <AvatarViewer
                    key={replayKey}
                    avatarUrl={localAvatarUrl}
                    isPaused={avatarPaused}
                    showControls={false}
                    className="w-full h-full"
                  />
                </div>
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center text-xl"
                  style={{ background: "var(--bg-elevated)" }}
                >
                  🪖
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] mb-0.5" style={{ color: "var(--text-disabled)" }}>
                Operator
              </p>
              <p className="font-display font-bold uppercase text-[20px] truncate" style={{ color: "var(--text-primary)", letterSpacing: "0.02em" }}>
                {displayName}
              </p>
              <p className="font-display font-bold uppercase text-[14px]" style={{ color: "var(--operative-500)" }}>
                {rankName}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label: "XP Total",  value: totalXp.toLocaleString(), color: "var(--signal-400)" },
              { label: "Streak",    value: `${currentStreak}🔥`,       color: "var(--signal-400)" },
              { label: "Sessions",  value: sessionsTotal,              color: "var(--intel-400)" },
            ].map(({ label, value, color }) => (
              <div key={label} className="text-center">
                <p className="font-mono font-bold text-[18px]" style={{ color }}>{value}</p>
                <p className="text-[9px] font-bold uppercase tracking-[0.1em] mt-0.5" style={{ color: "var(--text-disabled)" }}>{label}</p>
              </div>
            ))}
          </div>

          {/* Share rank card */}
          <Button variant="secondary" size="sm" fullWidth>
            Share Rank Card
          </Button>
        </div>

        {/* ── Avatar section ── */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: "var(--text-disabled)" }}>
              Your Operator Avatar
            </p>
            <button
              onClick={() => setShowRPMCreator(true)}
              className="flex items-center gap-1 text-[11px] font-semibold transition-colors"
              style={{ color: "var(--operative-400)" }}
            >
              <Edit3 className="w-3 h-3" />
              {localAvatarUrl ? "Edit Avatar" : "Create Avatar"}
            </button>
          </div>

          <div
            className="rounded-[var(--radius-md)] border overflow-hidden"
            style={{ borderColor: "var(--border-subtle)" }}
          >
            {/* Full avatar viewer */}
            <div style={{ height: "280px" }}>
              <AvatarViewer
                key={replayKey}
                avatarUrl={localAvatarUrl}
                isPaused={avatarPaused}
                showControls
                className="w-full h-full"
              />
            </div>

            {/* Controls */}
            <div
              className="flex items-center justify-between px-4 py-2 border-t"
              style={{ borderColor: "var(--border-subtle)", background: "var(--bg-overlay)" }}
            >
              <p className="text-[11px]" style={{ color: "var(--text-disabled)" }}>
                {localAvatarUrl ? "Ready Player Me Avatar" : "Default Placeholder — Create yours above"}
              </p>
              <AvatarControls
                isPaused={avatarPaused}
                onTogglePause={() => setAvatarPaused((v) => !v)}
                onReplay={() => { setReplayKey((k) => k + 1); setAvatarPaused(false); }}
                compact
              />
            </div>
          </div>
        </div>

        {/* ── Settings list ── */}
        <div className="mb-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] mb-3" style={{ color: "var(--text-disabled)" }}>
            Settings
          </p>
          <div className="rounded-[var(--radius-md)] border overflow-hidden" style={{ borderColor: "var(--border-subtle)" }}>
            {[
              { icon: User,     label: "Edit Profile",         href: "#" },
              { icon: Settings, label: "Goals & Mission Plan", href: "#" },
              { icon: Bell,     label: "Notifications",        href: "#" },
              { icon: Lock,     label: "Account & Privacy",    href: "#" },
            ].map(({ icon: Icon, label, href }, i) => (
              <Link
                key={label}
                href={href}
                className="flex items-center gap-3 px-4 py-3 no-underline transition-colors"
                style={{
                  borderBottom: i < 3 ? "1px solid var(--border-subtle)" : "none",
                  background: "var(--bg-surface)",
                  color: "var(--text-secondary)",
                }}
              >
                <div className="w-8 h-8 rounded-[var(--radius-xs)] flex items-center justify-center flex-shrink-0"
                  style={{ background: "var(--white-06)" }}>
                  <Icon className="w-4 h-4" style={{ color: "var(--text-tertiary)" }} />
                </div>
                <span className="flex-1 text-[13px] font-medium">{label}</span>
                <ChevronRight className="w-4 h-4" style={{ color: "var(--text-disabled)" }} />
              </Link>
            ))}
          </div>
        </div>

        {/* ── Upgrade CTA ── */}
        <div
          className="rounded-[var(--radius-md)] border p-4 mb-5 flex items-center gap-3"
          style={{ background: "var(--operative-900)", borderColor: "var(--operative-800)" }}
        >
          <span className="text-xl">⭐</span>
          <div className="flex-1">
            <p className="text-[13px] font-semibold" style={{ color: "var(--operative-400)" }}>Upgrade to Operator</p>
            <p className="text-[11px]" style={{ color: "var(--operative-800)" }}>Unlock all 8 ranks · Unlimited workouts</p>
          </div>
          <Button variant="primary" size="sm">$9.99/mo</Button>
        </div>

        {/* ── Logout ── */}
        <Button
          variant="destructive"
          size="md"
          fullWidth
          loading={isLoggingOut}
          onClick={() => startLogoutTransition(() => logoutAction())}
        >
          Log Out
        </Button>
      </div>
    </>
  );
}
