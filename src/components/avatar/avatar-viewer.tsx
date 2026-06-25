"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import type { AvatarSceneProps } from "./avatar-scene";

// Three.js / R3F must never run on the server
const AvatarScene = dynamic(
  () => import("./avatar-scene").then((m) => m.AvatarScene),
  {
    ssr: false,
    loading: () => (
      <div
        className="w-full flex flex-col items-center justify-center gap-3"
        style={{
          minHeight: "200px",
          background: "linear-gradient(180deg, #0D1014 0%, #161B21 100%)",
          borderRadius: "var(--radius-md)",
        }}
      >
        {/* Skeleton avatar silhouette */}
        <div className="relative flex flex-col items-center gap-1">
          <Skeleton className="w-10 h-10 rounded-full" />
          <Skeleton className="w-7 h-16 rounded-t-full" />
        </div>
        <p
          className="text-[10px] font-bold uppercase tracking-[0.1em]"
          style={{ color: "var(--text-disabled)" }}
        >
          Loading Avatar...
        </p>
      </div>
    ),
  }
);

export function AvatarViewer(props: AvatarSceneProps) {
  return <AvatarScene {...props} />;
}
