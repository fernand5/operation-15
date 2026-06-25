export function AuthDivider() {
  return (
    <div className="flex items-center gap-3 my-5">
      <div className="flex-1 h-px" style={{ background: "var(--border-subtle)" }} />
      <span
        className="text-[10px] font-bold uppercase tracking-[0.12em] shrink-0"
        style={{ color: "var(--text-disabled)" }}
      >
        OR
      </span>
      <div className="flex-1 h-px" style={{ background: "var(--border-subtle)" }} />
    </div>
  );
}
