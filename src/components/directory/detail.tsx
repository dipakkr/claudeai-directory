"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, Check, ChevronDown, Copy } from "lucide-react";
import { track, type AnalyticsEvent, type EventProps } from "@/lib/analytics";

// Shared building blocks for resource detail pages (MCP, skills, prompts):
// a centered single column, a title row, and collapsible config cards.

export function DetailPage({ backHref, backLabel, children }: { backHref: string; backLabel: string; children: ReactNode }) {
  return (
    <div className="mx-auto max-w-[860px] px-4 pb-8 pt-10 md:px-8 md:pt-14">
      <Link
        href={backHref}
        className="mb-10 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        {backLabel}
      </Link>
      {children}
    </div>
  );
}

export function DetailHeader({
  icon,
  title,
  stats,
}: {
  icon: ReactNode;
  title: string;
  stats?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex min-w-0 items-center gap-4">
        {icon}
        <h1 className="min-w-0 break-words text-[clamp(28px,4vw,40px)] font-normal leading-tight text-foreground">{title}</h1>
      </div>
      {stats && <div className="flex shrink-0 items-center gap-2 pt-1.5">{stats}</div>}
    </div>
  );
}

export function IconTile({ src, name, size = 44 }: { src?: string | null; name: string; size?: number }) {
  const [failed, setFailed] = useState(false);
  return (
    <span
      className="flex shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-card font-mono text-muted-foreground"
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {src && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          className="object-contain"
          style={{ width: size * 0.55, height: size * 0.55 }}
          onError={() => setFailed(true)}
        />
      ) : (
        name[0]?.toUpperCase()
      )}
    </span>
  );
}

export function StatPill({ icon, children, title }: { icon?: ReactNode; children: ReactNode; title?: string }) {
  return (
    <span
      title={title}
      className="inline-flex h-8 items-center gap-1.5 rounded-full border border-border px-3 font-mono text-[12px] text-muted-foreground"
    >
      {icon}
      {children}
    </span>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return <h2 className="mb-3 mt-12 font-mono text-[11px] font-normal uppercase tracking-[0.14em] text-muted-foreground">{children}</h2>;
}

export function TagList({ tags }: { tags: string[] }) {
  if (tags.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <span key={tag} className="rounded-md border border-border bg-card px-2 py-1 font-mono text-[12px] text-muted-foreground">
          {tag}
        </span>
      ))}
    </div>
  );
}

export function CopyButton({
  text,
  label = "Copy",
  event,
  eventProps,
}: {
  text: string;
  label?: string;
  /** Install-intent event fired on a successful copy. */
  event?: AnalyticsEvent;
  eventProps?: EventProps;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async (e) => {
        // Lives inside <summary>; don't toggle the card when copying.
        e.preventDefault();
        e.stopPropagation();
        try {
          await navigator.clipboard.writeText(text);
          if (event) track(event, eventProps);
          setCopied(true);
          setTimeout(() => setCopied(false), 1800);
        } catch {
          /* clipboard unavailable */
        }
      }}
      className="inline-flex h-7 shrink-0 items-center gap-1.5 rounded-md border border-border px-2.5 text-[12px] text-muted-foreground transition-colors hover:border-[var(--cad-line-hover)] hover:text-foreground"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Copied" : label}
    </button>
  );
}

/** A collapsible card like cursor.directory's rule/config blocks. */
export function ConfigCard({
  badge,
  title,
  actions,
  note,
  defaultOpen = false,
  children,
}: {
  badge?: string;
  title: string;
  actions?: ReactNode;
  note?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  return (
    <details open={defaultOpen} className="group mb-3 rounded-xl border border-border bg-card/40 [&_summary::-webkit-details-marker]:hidden">
      <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3.5">
        <ChevronDown className="h-4 w-4 shrink-0 -rotate-90 text-muted-foreground transition-transform group-open:rotate-0" />
        {badge && (
          <span className="shrink-0 rounded border border-border bg-secondary px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
            {badge}
          </span>
        )}
        <span className="min-w-0 flex-1 truncate text-[15px] text-foreground">{title}</span>
        {actions && <span className="flex shrink-0 items-center gap-2">{actions}</span>}
      </summary>
      <div className="px-4 pb-4">
        {note && <p className="mb-2.5 font-mono text-[10.5px] uppercase tracking-wide text-muted-foreground">{note}</p>}
        {children}
      </div>
    </details>
  );
}

export function CodeBlock({ children, wrap = false }: { children: string; wrap?: boolean }) {
  return (
    <pre
      className={`rounded-lg border border-border bg-[var(--cad-code)] p-4 font-mono text-[13px] leading-6 text-foreground/90 ${
        wrap ? "whitespace-pre-wrap break-words" : "overflow-x-auto"
      }`}
    >
      <code>{children}</code>
    </pre>
  );
}
