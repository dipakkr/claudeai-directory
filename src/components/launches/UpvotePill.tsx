/** Shared look for launch upvotes: a small horizontal pill with a solid triangle and the count. */

export function UpTriangle({ className = "h-3 w-3" }: { className?: string }) {
  return (
    <svg viewBox="0 0 12 10" aria-hidden="true" className={className} fill="currentColor">
      <path d="M6 0.6 11.4 9.4H0.6Z" />
    </svg>
  );
}

export const upvotePillClass = (voted = false) =>
  `inline-flex h-8 min-w-[56px] shrink-0 items-center justify-center gap-2 rounded-[8px] border px-3 font-mono text-[13px] tabular-nums transition-colors ${
    voted
      ? "border-primary/70 bg-primary/10 text-primary"
      : "border-border bg-transparent text-foreground hover:border-[var(--cad-line-hover)]"
  }`;

/** Display-only pill (links to the launch, no voting). */
export function UpvotePill({ count, highlight = false }: { count: number; highlight?: boolean }) {
  return (
    <span className={upvotePillClass(highlight)}>
      <UpTriangle className={`h-2.5 w-3 ${highlight ? "text-primary" : "text-muted-foreground"}`} />
      {count}
    </span>
  );
}
