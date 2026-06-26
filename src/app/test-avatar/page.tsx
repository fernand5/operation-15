"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

const AvatarScene = dynamic(
  () => import("@/components/avatar/avatar-scene").then(m => m.AvatarScene),
  { ssr: false, loading: () => <div style={{ height: 300, background: "#0D1014", display:"flex", alignItems:"center", justifyContent:"center", color:"#546070" }}>Loading 3D...</div> }
);

const EXERCISES = [
  "Glute Bridge", "Hip Circles", "Squat", "Jump Squat",
  "Forward Lunge", "Reverse Lunge", "Wall Sit", "Hip Flexor Stretch",
  "Quad Stretch", "Plank", "Push-Up", "idle",
];

export default function TestAvatarPage() {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const ex = EXERCISES[idx];

  return (
    <div style={{ background: "#080A0C", minHeight: "100vh", padding: 16, fontFamily: "monospace" }}>
      <h1 style={{ color: "#00E676", fontSize: 18, marginBottom: 12 }}>AVATAR EXERCISE TEST</h1>

      {/* Canvas */}
      <div style={{ height: 340, borderRadius: 8, overflow: "hidden", marginBottom: 12, border: "1px solid #273040" }}>
        <AvatarScene
          exerciseName={ex}
          phase="circuit_a"
          isPaused={paused}
          isRest={ex === "idle"}
          showControls
          className="w-full h-full"
        />
      </div>

      {/* Current exercise */}
      <div style={{ color: "#00E676", fontSize: 22, fontWeight: 700, textTransform: "uppercase", marginBottom: 8 }}>
        {ex}
      </div>
      <div style={{ color: "#546070", fontSize: 11, marginBottom: 16 }}>
        {idx + 1} / {EXERCISES.length}
      </div>

      {/* Controls */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <button onClick={() => setIdx(i => Math.max(0, i - 1))}
          style={{ padding: "8px 16px", background: "#161B21", border: "1px solid #38455A", color: "#A8BBCC", borderRadius: 4, cursor: "pointer" }}>
          ← PREV
        </button>
        <button onClick={() => setPaused(p => !p)}
          style={{ padding: "8px 16px", background: paused ? "#003D20" : "#161B21", border: `1px solid ${paused ? "#00C260" : "#38455A"}`, color: paused ? "#00E676" : "#A8BBCC", borderRadius: 4, cursor: "pointer" }}>
          {paused ? "▶ PLAY" : "⏸ PAUSE"}
        </button>
        <button onClick={() => setIdx(i => Math.min(EXERCISES.length - 1, i + 1))}
          style={{ padding: "8px 16px", background: "#161B21", border: "1px solid #38455A", color: "#A8BBCC", borderRadius: 4, cursor: "pointer" }}>
          NEXT →
        </button>
      </div>

      {/* All exercises grid */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {EXERCISES.map((e, i) => (
          <button key={e} onClick={() => setIdx(i)}
            style={{ padding: "4px 10px", fontSize: 11, borderRadius: 4, cursor: "pointer",
              background: i === idx ? "#002714" : "#111418",
              border: `1px solid ${i === idx ? "#00C260" : "#273040"}`,
              color: i === idx ? "#00E676" : "#7A8FA8",
              textTransform: "uppercase", fontFamily: "monospace" }}>
            {e}
          </button>
        ))}
      </div>
    </div>
  );
}
