"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { X, Loader2 } from "lucide-react";

interface RPMCreatorProps {
  subdomain?: string;
  onAvatarCreated: (avatarUrl: string) => void;
  onClose: () => void;
}

export function RPMCreator({
  subdomain = "demo",
  onAvatarCreated,
  onClose,
}: RPMCreatorProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loading, setLoading] = useState(true);

  const handleMessage = useCallback(
    (event: MessageEvent) => {
      const VALID_ORIGINS = [
        "https://readyplayer.me",
        `https://${subdomain}.readyplayer.me`,
      ];

      if (!VALID_ORIGINS.some((o) => event.origin.startsWith(o))) return;

      const { data } = event;

      if (typeof data === "string") {
        // RPM sends the avatar URL as a string ending in .glb
        if (data.endsWith(".glb")) {
          onAvatarCreated(data);
          return;
        }
        try {
          const parsed = JSON.parse(data);
          if (parsed.source === "readyplayerme" && parsed.eventName === "v1.avatar.exported") {
            onAvatarCreated(parsed.data.url);
          }
        } catch { /* not JSON */ }
      }
    },
    [subdomain, onAvatarCreated]
  );

  useEffect(() => {
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [handleMessage]);

  const rpmUrl = `https://${subdomain}.readyplayer.me/avatar?frameApi`;

  return (
    <div
      className="fixed inset-0 z-[var(--z-modal)] flex flex-col"
      style={{ background: "var(--bg-page)" }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0"
        style={{ background: "var(--bg-overlay)", borderColor: "var(--border-subtle)" }}
      >
        <div>
          <p
            className="font-display font-bold uppercase text-[16px] tracking-[0.04em]"
            style={{ color: "var(--text-primary)" }}
          >
            CREATE YOUR OPERATOR
          </p>
          <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
            Powered by Ready Player Me
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close avatar creator">
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* RPM iframe */}
      <div className="flex-1 relative">
        {loading && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10"
            style={{ background: "var(--bg-page)" }}
          >
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--operative-500)" }} />
            <p className="type-callsign">Loading Avatar Creator...</p>
          </div>
        )}
        <iframe
          ref={iframeRef}
          src={rpmUrl}
          className="w-full h-full border-0"
          allow="camera *; microphone *"
          onLoad={() => setLoading(false)}
          title="Ready Player Me Avatar Creator"
        />
      </div>

      {/* Footer note */}
      <div
        className="px-4 py-2 border-t flex-shrink-0 text-center"
        style={{ borderColor: "var(--border-subtle)", background: "var(--bg-overlay)" }}
      >
        <p className="text-[11px]" style={{ color: "var(--text-disabled)" }}>
          Create your avatar, then tap &quot;Next&quot; to save it to your operator profile.
        </p>
      </div>
    </div>
  );
}
