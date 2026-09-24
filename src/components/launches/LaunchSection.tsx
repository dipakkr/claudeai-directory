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
    <section id={id} className="scroll-mt-24 border-b border-border">
      <div className="flex items-center gap-3 border-b border-border px-5 py-5 md:px-8">
        <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
        <h2 className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-primary">{title}</h2>
        {typeof count === "number" && (
          <span className="rounded-full border border-border px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
            {count}
          </span>
        )}
      </div>
      <div className={padded ? "px-5 py-6 md:px-8" : undefined}>{children}</div>
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
