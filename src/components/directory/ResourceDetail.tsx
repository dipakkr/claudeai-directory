"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Play } from "lucide-react";
import { IconTile } from "@/components/directory/detail";
import { cn } from "@/lib/utils";

// Detail page layout modelled on how Claude shows a skill or connector: a quiet
// header with one primary action, underline tabs, and an overview with a side
// card. Every tab stays in the HTML (only hidden), so crawlers see it all.

export interface DetailTab {
  id: string;
  label: string;
  count?: number;
  content: ReactNode;
}

export function ResourceDetail({
  backHref,
  backLabel,
  iconSrc,
  icon,
  name,
  meta,
  action,
  tabs,
}: {
  backHref: string;
  backLabel: string;
  iconSrc?: string | null;
  /** Shown in the tile when there is no logo image. */
  icon?: ReactNode;
  name: string;
  /** Short facts after the name, e.g. ["by Supabase", "32 tools"]. Empty values are dropped. */
  meta: (string | null | undefined | false)[];
  /** The header's primary button. Gets a function that opens a tab. */
  action?: (openTab: (id: string) => void) => ReactNode;
  tabs: DetailTab[];
}) {
  const [active, setActive] = useState(tabs[0]?.id ?? "overview");

  // "+" and "Install" links elsewhere point at #install: open that tab.
  useEffect(() => {
    const sync = () => {
      const id = window.location.hash.slice(1);
      if (id && tabs.some((t) => t.id === id)) setActive(id);
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, [tabs]);

  const openTab = (id: string) => {
    setActive(id);
    window.history.replaceState(null, "", id === tabs[0]?.id ? window.location.pathname : `#${id}`);
  };

  const facts = meta.filter(Boolean) as string[];

  return (
    <div className="mx-auto w-full max-w-[1000px] px-4 pb-20 pt-10 md:px-8 md:pt-14">
      <Link href={backHref} className="inline-flex items-center gap-1.5 text-[14px] text-foreground/85 transition-colors hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        {backLabel}
      </Link>

      <div className="mt-7 flex flex-wrap items-center gap-4">
        {iconSrc || !icon ? (
          <IconTile src={iconSrc} name={name} size={56} />
        ) : (
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[var(--cad-tile)] text-foreground/85">{icon}</span>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="font-sans text-[22px] font-medium leading-tight text-foreground">{name}</h1>
          {facts.length > 0 && <p className="mt-1 text-[14px] text-muted-foreground">{facts.join(" · ")}</p>}
        </div>
        {action && <div className="flex shrink-0 items-center gap-2">{action(openTab)}</div>}
      </div>

      <div role="tablist" aria-label={`${name} sections`} className="mt-7 flex gap-1 overflow-x-auto border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={active === tab.id}
            aria-controls={`panel-${tab.id}`}
            onClick={() => openTab(tab.id)}
            className={cn(
              "-mb-px shrink-0 cursor-pointer border-b-2 px-3.5 pb-3 pt-1 text-[15px] transition-colors",
              active === tab.id ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
            {tab.count != null && <span className="text-muted-foreground"> · {tab.count}</span>}
          </button>
        ))}
      </div>

      {tabs.map((tab) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`panel-${tab.id}`}
          aria-labelledby={`tab-${tab.id}`}
          hidden={active !== tab.id}
          className="pt-8"
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}

/** Overview body: main column plus an optional side card. */
export function OverviewGrid({ children, aside }: { children: ReactNode; aside?: ReactNode }) {
  return (
    <div className={cn("grid gap-10", aside && "lg:grid-cols-[minmax(0,1fr)_300px]")}>
      <div className="min-w-0 space-y-8">{children}</div>
      {aside && <aside className="self-start rounded-xl bg-[var(--cad-tile)] p-5">{aside}</aside>}
    </div>
  );
}

/** A small quiet label and its content. */
export function Block({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="mb-2.5 font-sans text-[13.5px] font-normal text-muted-foreground">{label}</h2>
      {children}
    </section>
  );
}

export function Chips({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span key={item} className="rounded-md bg-[var(--cad-chip)] px-2.5 py-1 text-[13px] text-foreground/85">
          {item}
        </span>
      ))}
    </div>
  );
}

/** Example prompts, like Claude's "Try it" chips. Only from real data. */
export function TryIt({ prompts }: { prompts: string[] }) {
  if (prompts.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {prompts.map((p) => (
        <span key={p} className="inline-flex items-center gap-2 rounded-md bg-[var(--cad-raised)] px-3 py-2 text-[14px] text-muted-foreground">
          <Play className="h-3 w-3 shrink-0" />
          &ldquo;{p}&rdquo;
        </span>
      ))}
    </div>
  );
}

/** Side card rows: label / value pairs, then links. */
export function SideFacts({
  title = "Details",
  facts,
  links = [],
  children,
}: {
  title?: string;
  facts: { label: string; value?: string | null; href?: string }[];
  links?: { label: string; href?: string | null }[];
  children?: ReactNode;
}) {
  const shown = facts.filter((f) => f.value);
  const shownLinks = links.filter((l): l is { label: string; href: string } => Boolean(l.href));
  return (
    <div className="space-y-5">
      {shown.length > 0 && (
        <div>
          <h2 className="mb-3 font-sans text-[13.5px] font-normal text-muted-foreground">{title}</h2>
          <dl className="space-y-2.5">
            {shown.map((f) => (
              <div key={f.label} className="flex items-baseline justify-between gap-3 text-[14px]">
                <dt className="text-muted-foreground">{f.label}</dt>
                <dd className="min-w-0 truncate text-right text-foreground first-letter:uppercase">
                  {f.href ? (
                    <a href={f.href} target="_blank" rel="noopener noreferrer" className="hover:underline hover:underline-offset-4">
                      {f.value}
                    </a>
                  ) : (
                    f.value
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}
      {children}
      {shownLinks.length > 0 && (
        <div>
          <h2 className="mb-2.5 font-sans text-[13.5px] font-normal text-muted-foreground">Links</h2>
          <ul className="space-y-2">
            {shownLinks.map((l) => (
              <li key={l.label}>
                <a
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[14px] text-foreground/90 hover:text-foreground hover:underline hover:underline-offset-4"
                >
                  {l.label}
                  <ExternalLink className="h-3 w-3 text-muted-foreground" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
