"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ExternalLink, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export interface ExplorerCommand {
  name: string;
  usage: string;
  summary: string;
  details: string;
  aliases: string[];
  badges: string[];
  docsUrl: string;
}

export interface ExplorerGroup {
  id: string;
  label: string;
  commands: ExplorerCommand[];
}

export interface SidebarLink {
  id: string;
  label: string;
}

/**
 * Guide-style layout for the commands reference: a sticky sidebar (filter,
 * categories, reference sections) with the page in a reading column. The
 * server-rendered parts come in as `intro` and `after`; the filterable
 * command list sits between them.
 */
export default function CommandsExplorer({
  groups,
  start,
  reference,
  intro,
  after,
}: {
  groups: ExplorerGroup[];
  /** Sidebar links above the categories (e.g. the top commands). */
  start: SidebarLink[];
  /** Sidebar links below the categories (terminal, shortcuts, FAQ...). */
  reference: SidebarLink[];
  intro: ReactNode;
  after: ReactNode;
}) {
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState<string>(start[0]?.id ?? "");
  const q = query.trim().toLowerCase().replace(/^\//, "");

  const filtered = useMemo(() => {
    if (!q) return groups;
    return groups
      .map(g => ({
        ...g,
        commands: g.commands.filter(c =>
          [c.name, ...c.aliases, c.summary, c.details].some(t => t.toLowerCase().includes(q)),
        ),
      }))
      .filter(g => g.commands.length > 0);
  }, [groups, q]);

  const total = filtered.reduce((n, g) => n + g.commands.length, 0);

  // Highlight the section being read: the last one whose top has passed just under the header.
  useEffect(() => {
    const ids = [...start, ...filtered, ...reference].map(s => s.id);
    let frame = 0;
    const update = () => {
      frame = 0;
      let current = ids[0] ?? "";
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 120) current = id;
      }
      setActiveId(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    // Capture: with overflow set on body, the page scroll may not reach window.
    document.addEventListener("scroll", onScroll, { passive: true, capture: true });
    return () => {
      document.removeEventListener("scroll", onScroll, { capture: true });
      if (frame) cancelAnimationFrame(frame);
    };
  }, [start, filtered, reference]);

  const link = (id: string, label: ReactNode, count?: number) => (
    <a
      key={id}
      href={`#${id}`}
      className={`flex items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-[13.5px] transition-colors ${
        activeId === id ? "bg-[var(--cad-control)] text-foreground" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      <span className="truncate">{label}</span>
      {count !== undefined && <span className="text-[11.5px] opacity-60">{count}</span>}
    </a>
  );

  const sectionLabel = "px-2.5 pb-1 pt-4 text-[11px] uppercase tracking-[0.06em] text-muted-foreground/80";

  return (
    <div className="lg:grid lg:grid-cols-[260px_minmax(0,1fr)]">
      <aside className="hidden border-r border-border lg:block">
        <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto px-3 pb-10 pt-6">
          <div className="relative px-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              aria-label="Filter commands"
              placeholder="Filter commands"
              className="h-8 pl-8 text-[13px]"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
          <nav aria-label="On this page">
            <p className={sectionLabel}>Start here</p>
            {start.map(s => link(s.id, s.label))}
            <p className={sectionLabel}>Slash commands</p>
            {filtered.map(g => link(g.id, g.label, g.commands.length))}
            {filtered.length === 0 && <p className="px-2.5 py-1.5 text-[13px] text-muted-foreground">No matches</p>}
            <p className={sectionLabel}>Reference</p>
            {reference.map(s => link(s.id, s.label))}
          </nav>
        </div>
      </aside>

      <div className="min-w-0 px-4 md:px-10 lg:px-14">
        <div className="mx-auto max-w-[860px]">
          {intro}

          <section id="all-commands" className="mt-16 scroll-mt-24" aria-labelledby="all-commands-title">
            <h2 id="all-commands-title" className="text-[26px] font-normal text-foreground">
              All slash commands
            </h2>
            <p className="mt-2 max-w-[70ch] text-[14px] leading-relaxed text-muted-foreground">
              Bundled skills and workflows run like any other command. Version tags show the minimum Claude Code version the
              docs list; run <code className="font-mono text-foreground">claude update</code> if a command is missing.
            </p>

            {/* Phones and tablets: no sidebar, so filter and categories stick above the list. */}
            <div className="sticky top-16 z-30 -mx-4 mt-4 border-b border-border bg-background/95 px-4 py-3 backdrop-blur md:-mx-10 md:px-10 lg:hidden">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  aria-label="Filter commands"
                  placeholder="Filter commands, e.g. context"
                  className="h-9 pl-9"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                />
              </div>
              <nav aria-label="Command categories" className="-mx-4 mt-2.5 flex min-w-0 gap-1.5 overflow-x-auto px-4">
                {filtered.map(g => (
                  <a
                    key={g.id}
                    href={`#${g.id}`}
                    className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md border border-border bg-card px-2.5 text-[13px] text-muted-foreground hover:text-foreground"
                  >
                    {g.label}
                    <span className="opacity-60">{g.commands.length}</span>
                  </a>
                ))}
              </nav>
            </div>

            {q && (
              <p className="mt-4 text-[13px] text-muted-foreground" aria-live="polite">
                {total} {total === 1 ? "command matches" : "commands match"} &ldquo;{query.trim()}&rdquo;.
              </p>
            )}

            {filtered.map(g => (
              <section key={g.id} id={g.id} className="scroll-mt-24 pt-10" aria-labelledby={`${g.id}-title`}>
                <h3 id={`${g.id}-title`} className="text-[20px] font-normal text-foreground">
                  {g.label}
                </h3>
                <ul className="mt-3 divide-y divide-border border-y border-border">
                  {g.commands.map(c => (
                    <li key={c.name} id={`cmd-${c.name.slice(1)}`} className="grid scroll-mt-24 gap-2 py-4 md:grid-cols-[200px_1fr] md:gap-6">
                      <div className="min-w-0">
                        <code className="break-words font-mono text-[14px] text-foreground">{c.usage}</code>
                        {c.aliases.length > 0 && (
                          <div className="mt-1 text-[12px] text-muted-foreground">
                            Also: <span className="font-mono">{c.aliases.join(", ")}</span>
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[15px] text-foreground">{c.summary}</p>
                        <p className="mt-1 text-[14px] leading-relaxed text-muted-foreground">{c.details}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                          {c.badges.map(b => (
                            <span key={b} className="rounded border border-border px-1.5 py-px text-[11px] text-muted-foreground">
                              {b}
                            </span>
                          ))}
                          <a
                            href={c.docsUrl}
                            target="_blank"
                            rel="noopener"
                            className="inline-flex items-center gap-1 text-[12px] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                          >
                            Docs <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            ))}

            {filtered.length === 0 && (
              <p className="py-12 text-center text-muted-foreground">No commands match. Try a shorter word.</p>
            )}
          </section>

          {after}
        </div>
      </div>
    </div>
  );
}
