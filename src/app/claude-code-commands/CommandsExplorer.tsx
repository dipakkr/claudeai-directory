"use client";

import { useMemo, useState } from "react";
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

export default function CommandsExplorer({ groups }: { groups: ExplorerGroup[] }) {
  const [query, setQuery] = useState("");
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

  return (
    <div>
      <div className="sticky top-16 z-30 -mx-4 border-b border-border bg-background/95 px-4 py-3 backdrop-blur md:-mx-8 md:px-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative w-full lg:max-w-[260px]">
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
          <nav aria-label="Command categories" className="-mx-4 flex min-w-0 gap-1.5 overflow-x-auto px-4 lg:mx-0 lg:px-0">
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
      </div>

      {q && (
        <p className="mt-4 text-[13px] text-muted-foreground" aria-live="polite">
          {total} {total === 1 ? "command matches" : "commands match"} &ldquo;{query.trim()}&rdquo;.
        </p>
      )}

      {filtered.map(g => (
        <section key={g.id} id={g.id} className="scroll-mt-40 pt-10" aria-labelledby={`${g.id}-title`}>
          <h3 id={`${g.id}-title`} className="text-[20px] font-normal text-foreground">
            {g.label}
          </h3>
          <ul className="mt-3 divide-y divide-border border-y border-border">
            {g.commands.map(c => (
              <li key={c.name} id={`cmd-${c.name.slice(1)}`} className="grid scroll-mt-40 gap-2 py-4 md:grid-cols-[240px_1fr] md:gap-6">
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
    </div>
  );
}
