"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight, BadgeCheck } from "lucide-react";
import { IconTile } from "@/components/directory/detail";
import { ResourceCard } from "@/components/directory/DiscoverListing";
import type { DirectoryItem } from "@/lib/directory";

// Detail page modelled on claude.ai/directory: breadcrumb, a header band with
// the logo, name and one primary action, then the description and sections on
// the left and small labelled facts on the right, with related items below.

export interface Fact {
  label: string;
  value?: string | null;
  href?: string;
  mono?: boolean;
  chips?: string[];
}

export function ResourceDetail({
  backHref,
  backLabel,
  iconSrc,
  icon,
  name,
  verified,
  tagline,
  action,
  facts,
  links = [],
  children,
  related = [],
  relatedTitle,
}: {
  backHref: string;
  backLabel: string;
  iconSrc?: string | null;
  /** Shown in the tile when there is no logo image. */
  icon?: ReactNode;
  name: string;
  verified?: boolean;
  tagline?: string | null;
  /** Primary action(s) on the right of the header band. */
  action?: ReactNode;
  facts: Fact[];
  links?: { label: string; href?: string | null }[];
  /** Main column: description and sections. */
  children: ReactNode;
  related?: DirectoryItem[];
  relatedTitle?: string;
}) {
  const shownFacts = facts.filter((f) => f.value || (f.chips && f.chips.length > 0));
  const shownLinks = links.filter((l): l is { label: string; href: string } => Boolean(l.href));

  return (
    <div>
      <div className="mx-auto w-full max-w-[1136px] px-4 pt-6 md:px-8">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[13px]">
          <Link href={backHref} className="text-muted-foreground transition-colors hover:text-foreground">
            {backLabel}
          </Link>
          <span className="text-muted-foreground/60">/</span>
          <span className="truncate text-foreground">{name}</span>
        </nav>
      </div>

      <div className="mt-6 bg-[var(--cad-band)]">
        <div className="mx-auto flex w-full max-w-[1136px] flex-wrap items-center gap-4 px-4 py-8 md:px-8 md:py-10">
          {iconSrc || !icon ? (
            <span className="rounded-xl border border-border bg-[var(--cad-tile)] p-1">
              <IconTile src={iconSrc} name={name} size={52} />
            </span>
          ) : (
            <span className="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-xl border border-border bg-[var(--cad-tile)] text-foreground/85 [&>svg]:h-6 [&>svg]:w-6">
              {icon}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <h1 className="text-[24px] font-light leading-tight text-foreground md:text-[28px]">
              {name}
              {verified && <BadgeCheck className="ml-2 inline h-[18px] w-[18px] -translate-y-0.5 text-muted-foreground" strokeWidth={1.5} aria-label="Official" />}
            </h1>
            {tagline && <p className="mt-1 max-w-[70ch] text-[13.5px] leading-relaxed text-[var(--cad-desc)]">{tagline}</p>}
          </div>
          {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-[1136px] gap-10 px-4 pb-14 pt-9 md:px-8 lg:grid-cols-[minmax(0,1fr)_260px] lg:gap-16">
        <div className="min-w-0 space-y-9">{children}</div>

        {(shownFacts.length > 0 || shownLinks.length > 0) && (
          <aside className="space-y-5 self-start">
            {shownFacts.map((f) => (
              <div key={f.label}>
                <p className="text-[11px] uppercase tracking-[0.05em] text-muted-foreground">{f.label}</p>
                {f.chips ? (
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {f.chips.map((c) => (
                      <span key={c} className="rounded-md border border-border bg-[var(--cad-raised)] px-1.5 py-0.5 text-[12.5px] text-foreground">
                        {c}
                      </span>
                    ))}
                  </div>
                ) : f.href ? (
                  <a href={f.href} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-[13.5px] text-[var(--cad-link)] underline underline-offset-[3px]">
                    {f.value}
                  </a>
                ) : (
                  <p className={f.mono ? "mt-1 break-all font-mono text-[12.5px] text-foreground" : "mt-1 text-[13.5px] text-foreground first-letter:uppercase"}>{f.value}</p>
                )}
              </div>
            ))}
            {shownLinks.length > 0 && (
              <div>
                <p className="text-[11px] uppercase tracking-[0.05em] text-muted-foreground">More info</p>
                <ul className="mt-1 space-y-1">
                  {shownLinks.map((l) => (
                    <li key={l.label}>
                      <a
                        href={l.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[13.5px] text-[var(--cad-link)] underline underline-offset-[3px]"
                      >
                        {l.label}
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        )}
      </div>

      {related.length > 0 && (
        <div className="mx-auto w-full max-w-[1136px] px-4 pb-20 md:px-8">
          <div className="border-t border-border pt-10">
            <h2 className="mb-4 font-sans text-[17px] font-normal text-foreground">{relatedTitle ?? "Related"}</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {related.slice(0, 6).map((item) => (
                <ResourceCard key={item.key} item={item} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** A main-column section with a 22px heading, like the directory's "Tools". */
export function DetailSection({ id, title, children }: { id?: string; title?: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24">
      {title && <h2 className="mb-3 font-sans text-[17px] font-normal text-foreground">{title}</h2>}
      {children}
    </section>
  );
}

/** Tool names as quiet chips in two columns. */
export function ToolChips({ tools }: { tools: string[] }) {
  return (
    <ul className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
      {tools.map((t) => (
        <li key={t}>
          <span className="inline-block max-w-full truncate rounded-md bg-[var(--cad-raised)] px-2.5 py-0.5 text-[12.5px] text-foreground/90">{t}</span>
        </li>
      ))}
    </ul>
  );
}

export function scrollToInstall() {
  document.getElementById("install")?.scrollIntoView({ behavior: "smooth", block: "start" });
}
