export default function Page() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3 p-8 text-center">
      <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "var(--white-06)", border: "1px solid var(--border-subtle)" }}>
        <span className="text-2xl">🚧</span>
      </div>
      <p className="font-display font-bold uppercase text-[20px]" style={{ color: "var(--text-primary)" }}>COMING SOON</p>
      <p className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>This section is under construction. Check back after the next mission briefing.</p>
    </div>
  );
}
