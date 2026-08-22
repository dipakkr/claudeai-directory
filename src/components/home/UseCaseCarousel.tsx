"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";

// One "Claude for X" bundle — a use-case grouping of real MCP servers, built
// server-side in page.tsx from the live index so the counts and logos are real.
export interface UseCaseServer {
  name: string;
  slug: string;
  icon: string | null;
}

export interface UseCaseBundle {
  key: string;
  label: string;
  tagline: string;
  href: string;
  count: number;
  servers: UseCaseServer[];
}

function faviconFor(iconUrl: string | null): string | null {
  if (!iconUrl) return null;
  try {
    return `https://www.google.com/s2/favicons?domain=${new URL(iconUrl).hostname}&sz=64`;
  } catch {
    return null;
  }
}

function ServerChipIcon({ icon, name }: { icon: string | null; name: string }) {
  const [failed, setFailed] = useState(false);
  const src = faviconFor(icon);
  if (src && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt=""
        width={22}
        height={22}
        className="h-[22px] w-[22px] shrink-0 rounded-[6px] bg-[var(--cad-chip)] object-contain p-0.5"
        onError={() => setFailed(true)}
      />
    );
  }
  return (
    <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-[6px] bg-[var(--cad-chip)] text-[10px] font-semibold text-[var(--cad-accent-hover)]">
      {name[0]?.toUpperCase()}
    </span>
  );
}

export default function UseCaseCarousel({ bundles }: { bundles: UseCaseBundle[] }) {
  const scroller = useRef<HTMLDivElement>(null);

  if (!bundles.length) return null;

  const scrollBy = (dir: 1 | -1) => {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({ left: dir * (el.clientWidth * 0.8), behavior: "smooth" });
  };

  return (
    <section className="cad-section">
      <div className="container">
        {/* Header */}
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--cad-faint)]">
              Explore by use case
            </div>
            <h2 className="mt-3 text-[clamp(24px,3vw,34px)] font-medium leading-tight">
              Claude, bundled for your work
            </h2>
            <p className="mt-3 max-w-[52ch] text-pretty text-[15px] leading-[1.6] text-muted-foreground">
              Curated groups of MCP servers for a job to be done — explore a whole
              stack together instead of hunting one server at a time.
            </p>
          </div>
          <div className="hidden shrink-0 items-center gap-2 md:flex">
            <button
              type="button"
              aria-label="Previous"
              onClick={() => scrollBy(-1)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Next"
              onClick={() => scrollBy(1)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Carousel */}
        <div
          ref={scroller}
          className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {bundles.map((b) => (
            <div
              key={b.key}
              className="flex w-[300px] shrink-0 snap-start flex-col rounded-[14px] border border-border bg-card p-5 transition-colors hover:border-[var(--cad-accent-hover)] sm:w-[330px]"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-[18px] font-semibold leading-tight">{b.label}</h3>
                  <p className="mt-1 text-[13px] text-muted-foreground">{b.tagline}</p>
                </div>
                <span className="shrink-0 rounded-full bg-[var(--cad-chip)] px-2.5 py-1 text-[11px] font-medium text-[var(--cad-accent-hover)]">
                  {b.count}
                </span>
              </div>

              <div className="mt-4 flex-1 space-y-1">
                {b.servers.map((s) => (
                  <Link
                    key={s.slug}
                    href={`/mcp/${s.slug}`}
                    className="group flex items-center gap-2.5 rounded-[9px] px-2 py-1.5 hover:bg-[var(--cad-raised)]"
                  >
                    <ServerChipIcon icon={s.icon} name={s.name} />
                    <span className="line-clamp-1 text-[13px] font-medium text-foreground group-hover:text-primary">
                      {s.name}
                    </span>
                  </Link>
                ))}
              </div>

              <Link
                href={b.href}
                className="mt-4 flex items-center justify-center gap-1.5 rounded-[9px] border border-border py-2.5 text-[13px] font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
              >
                Explore together
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ))}

          {/* Trailing "all" card */}
          <Link
            href="/mcp"
            className="flex w-[220px] shrink-0 snap-start flex-col items-center justify-center gap-3 rounded-[14px] border border-dashed border-border bg-[var(--cad-raised)] p-5 text-center transition-colors hover:border-primary"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--cad-accent-soft)] text-[var(--cad-accent-hover)]">
              <ArrowUpRight className="h-5 w-5" />
            </span>
            <span className="text-[14px] font-semibold text-foreground">Browse all MCP servers</span>
            <span className="text-[12px] text-muted-foreground">Every category in the index</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
