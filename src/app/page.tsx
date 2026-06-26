import { redirect } from "next/navigation";

export default function Home() {
  redirect("/dashboard");
}

export default function Home() {
  return (
    <main
      id="main-content"
      className="min-h-screen flex flex-col items-center justify-center gap-6 p-8"
    >
      {/* Logo mark */}
      <div
        className="w-16 h-16 flex items-center justify-center"
        style={{
          background: "var(--operative-500)",
          borderRadius: "var(--radius-lg)",
        }}
      >
        <Crosshair className="w-8 h-8" style={{ color: "var(--ground-950)" }} strokeWidth={2} />
      </div>

      {/* Wordmark */}
      <div className="text-center">
        <h1 className="type-display-xl" style={{ fontSize: "clamp(36px, 8vw, 72px)" }}>
          OPERATION{" "}
          <span style={{ color: "var(--operative-500)" }}>15</span>
        </h1>
        <p className="type-body-md mt-2">
          15 Minutes. Military Precision. Real Results.
        </p>
      </div>

      {/* Status badge */}
      <div
        className="flex items-center gap-2 px-4 py-2"
        style={{
          borderRadius: "var(--radius-sm)",
          border: "1px solid var(--operative-600)",
          background: "var(--operative-900)",
        }}
      >
        <span
          className="w-2 h-2 rounded-full animate-pulse"
          style={{ background: "var(--operative-500)" }}
        />
        <span className="type-callsign">Phase 0 — Design System Online</span>
      </div>

      {/* Color token preview */}
      <div className="mt-4 grid grid-cols-2 gap-3 w-full max-w-sm">
        {[
          { label: "Operative", bg: "var(--operative-500)" },
          { label: "Signal",    bg: "var(--signal-500)" },
          { label: "Breach",    bg: "var(--breach-500)" },
          { label: "Intel",     bg: "var(--intel-500)" },
        ].map(({ label, bg }) => (
          <div
            key={label}
            className="p-3 text-center"
            style={{
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border-subtle)",
              background: "var(--bg-surface)",
            }}
          >
            <div
              className="w-full h-6 mb-2"
              style={{ background: bg, borderRadius: "var(--radius-xs)" }}
            />
            <span className="type-label-md">{label}</span>
          </div>
        ))}
      </div>
    </main>
  );
}
