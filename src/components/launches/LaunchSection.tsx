import type { ReactNode } from "react";

interface LaunchSectionProps {
  id?: string;
  title: ReactNode;
  count?: number;
  children: ReactNode;
  /** Pad the body. Off for rows that draw their own full-width dividers. */
  padded?: boolean;
}

export function LaunchSection({ id, title, count, children, padded = true }: LaunchSectionProps) {
  return (
    <section id={id} className="scroll-mt-32">
      {/* Quiet label with a rule, like "THE MAKER ————" */}
      <div className="flex items-center gap-3">
        <h2 className="shrink-0 font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">{title}</h2>
        {typeof count === "number" && <span className="font-mono text-[11px] text-muted-foreground/70">{count}</span>}
        <span className="h-px flex-1 bg-border" aria-hidden="true" />
      </div>
      <div className={padded ? "pt-5" : "pt-2"}>{children}</div>
    </section>
  );
}

export function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-md border border-border bg-card px-2.5 py-1 text-xs text-foreground">
      {children}
    </span>
  );
}
