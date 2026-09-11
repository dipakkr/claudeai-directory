"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Check, Plus, Search } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import type { MCPServer } from "@/types";

type Connector = {
  mono: string;
  name: string;
  category: string;
  use: string;
  badge?: string;
  href?: string;
  iconUrl?: string;
  official?: boolean;
};

type Shelf = {
  title: string;
  all: string;
  items: Connector[];
};

const shelves: Shelf[] = [
  {
    title: "Top connectors",
    all: "Show all",
    items: [
      { mono: "DR", name: "Google Drive", category: "Docs", use: "Ask questions across a folder of contracts or specs without opening them." },
      { mono: "GM", name: "Gmail", category: "Email", use: "Draft replies in thread context and summarise a week of a busy inbox." },
      { mono: "GC", name: "Google Calendar", category: "Calendar", use: "Find the meeting that matters and prepare the brief before it starts." },
      { mono: "NO", name: "Notion", category: "Docs", use: "Keep a spec current as decisions land elsewhere; file notes where they belong." },
      { mono: "SL", name: "Slack", category: "Communication", use: "Search history for the decision nobody wrote down, then post the recap." },
      { mono: "LN", name: "Linear", category: "Engineering", use: "Turn a bug thread into a properly-scoped issue with the right labels." },
      { mono: "FI", name: "Figma", category: "Design", use: "Read frames for copy review, or generate code from the file's real context." },
      { mono: "HS", name: "HubSpot", category: "CRM", use: "Pull deal history so replies know what was already promised." },
      { mono: "AT", name: "Atlassian", category: "Engineering", use: "Jira and Confluence context for teams whose knowledge lives there." },
    ],
  },
  {
    title: "Trending this week",
    all: "Show all",
    items: [
      { mono: "IB", name: "Inkbox", category: "Communication", badge: "Trending", use: "Email, SMS and iMessage in one place for customer workflows." },
      { mono: "WI", name: "Within", category: "Ops", badge: "Trending", use: "Explore how work actually moves through an organization." },
      { mono: "ID", name: "Idiolect", category: "Writing", badge: "Trending", use: "Make Claude write in your real voice, not generic house style." },
    ],
  },
  {
    title: "New connectors",
    all: "Show all",
    items: [
      { mono: "LZ", name: "LZ Virtual Mail", category: "Ops", badge: "New", use: "Manage physical mail from wherever you are." },
      { mono: "LP", name: "LlamaParse", category: "Docs", badge: "New", use: "Document processing for PDFs that fight back." },
      { mono: "TT", name: "TomTom Maps", category: "Maps", badge: "New", use: "Real-time geospatial context for maps, traffic, and routing." },
      { mono: "SQ", name: "StackQL", category: "Cloud", badge: "New", use: "SQL-native queries against cloud infrastructure." },
      { mono: "PD", name: "PDF Tools", category: "Docs", badge: "New", use: "Open a PDF already on your machine and work with it." },
      { mono: "DL", name: "droplinked", category: "Commerce", badge: "New", use: "Discover and verify products across attested merchants." },
    ],
  },
  {
    title: "Health & research",
    all: "Show all",
    items: [
      { mono: "PM", name: "PubMed", category: "Research", use: "Search biomedical literature and triage what is worth reading." },
      { mono: "ST", name: "Strava", category: "Health", badge: "Beta", use: "Analyze and summarize your training data." },
      { mono: "IC", name: "ICD-10 Codes", category: "Health", use: "Look up ICD-10-CM and PCS code sets during coding work." },
    ],
  },
];

const collectionIcons = ["GM", "HS", "NO", "SL", "LN", "DR", "ZD"];

function getFaviconUrl(iconUrl?: string): string | null {
  if (!iconUrl) return null;
  try {
    const hostname = new URL(iconUrl).hostname;
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;
  } catch {
    return null;
  }
}

function initials(value: string) {
  return value
    .split(/\s|-/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || value.slice(0, 2).toUpperCase();
}

function connectorsFromServers(servers: MCPServer[]): Connector[] {
  return servers.map((server) => ({
    mono: initials(server.name),
    name: server.name,
    category: server.category || "MCP",
    use: server.one_liner || server.description,
    href: `/mcp/${server.slug || server.id}`,
    iconUrl: server.branding?.icon_url,
    official: server.official,
    badge: server.trending ? "Trending" : server.capabilities?.has_mcp_app ? "App" : undefined,
  }));
}

function shelvesFromConnectors(connectors: Connector[]): Shelf[] {
  const official = connectors.filter((item) => item.official);
  const trending = connectors.filter((item) => item.badge === "Trending");
  const docsOrData = connectors.filter((item) => /data|research|productivity|business|development/i.test(item.category));

  return [
    { title: "Top connectors", all: "Show all", items: connectors.slice(0, 9) },
    { title: "Trending this week", all: "Show all", items: (trending.length ? trending : official).slice(0, 6) },
    { title: "New connectors", all: "Show all", items: connectors.slice(9, 15) },
    { title: "Research & data", all: "Show all", items: (docsOrData.length ? docsOrData : connectors).slice(0, 6) },
  ].filter((shelf) => shelf.items.length > 0);
}

function ConnectorCard({
  item,
  saved,
  onToggle,
}: {
  item: Connector;
  saved: boolean;
  onToggle: () => void;
}) {
  const favicon = getFaviconUrl(item.iconUrl);

  return (
    <article className="group flex min-h-[92px] items-center gap-4 rounded-[9px] border border-border bg-card p-4 transition-colors hover:border-[var(--cad-line-hover)]">
      {favicon ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={favicon} alt="" className="h-11 w-11 shrink-0 rounded-[9px] bg-[var(--cad-chip)] object-contain p-1" />
      ) : (
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[9px] bg-[var(--cad-chip)] text-sm font-semibold text-primary">
          {item.mono}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2">
          {item.href ? (
            <Link href={item.href} className="truncate text-[15px] font-semibold hover:text-primary">
              {item.name}
            </Link>
          ) : (
            <h3 className="truncate text-[15px] font-semibold">{item.name}</h3>
          )}
          <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[var(--cad-chip)] text-[10px] text-[var(--cad-faint)]">
            <Check className="h-2.5 w-2.5" />
          </span>
          {item.badge && (
            <span className="rounded-md bg-[var(--cad-accent-soft)] px-1.5 py-0.5 text-[10.5px] uppercase tracking-[0.06em] text-[var(--cad-accent-hover)]">
              {item.badge}
            </span>
          )}
        </div>
        <p className="mt-1 line-clamp-2 text-pretty text-[13.5px] leading-[1.45] text-muted-foreground">
          {item.use}
        </p>
      </div>
      <button
        type="button"
        onClick={onToggle}
        aria-label={`${saved ? "Remove" : "Save"} ${item.name}`}
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] border text-sm transition-colors ${
          saved
            ? "border-primary bg-[var(--cad-accent-soft)] text-primary"
            : "border-border bg-[var(--cad-raised)] text-muted-foreground group-hover:border-primary group-hover:text-primary"
        }`}
      >
        {saved ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
      </button>
    </article>
  );
}

function ConnectorShelf({
  shelf,
  saved,
  toggleSave,
}: {
  shelf: Shelf;
  saved: string[];
  toggleSave: (name: string) => void;
}) {
  return (
    <section className="flex flex-col gap-5">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-[clamp(24px,2.4vw,32px)] font-medium leading-tight">{shelf.title}</h2>
        <Link href="/submit" className="whitespace-nowrap text-sm font-medium text-primary hover:text-[var(--cad-accent-hover)]">
          {shelf.all} →
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {shelf.items.map((item) => (
          <ConnectorCard
            key={item.name}
            item={item}
            saved={saved.includes(item.name)}
            onToggle={() => toggleSave(item.name)}
          />
        ))}
      </div>
    </section>
  );
}

export default function ConnectorsClient({ initialServers = [] }: { initialServers?: MCPServer[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [saved, setSaved] = useState<string[]>([]);

  const liveConnectors = useMemo(() => connectorsFromServers(initialServers), [initialServers]);
  const activeShelves = useMemo(() => (
    liveConnectors.length > 0 ? shelvesFromConnectors(liveConnectors) : shelves
  ), [liveConnectors]);
  const activeCategories = useMemo(() => (
    ["All", ...Array.from(new Set(activeShelves.flatMap((shelf) => shelf.items.map((item) => item.category))))]
  ), [activeShelves]);
  const allItems = useMemo(() => activeShelves.flatMap((shelf) => shelf.items), [activeShelves]);
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return allItems.filter((item) => {
      const matchesCategory = category === "All" || item.category === category;
      const matchesQuery = !normalized || `${item.name} ${item.use} ${item.category}`.toLowerCase().includes(normalized);
      return matchesCategory && matchesQuery;
    });
  }, [allItems, category, query]);

  const visibleShelves = query.trim() || category !== "All"
    ? [{ title: "Matching connectors", all: "Submit connector", items: filtered }]
    : activeShelves;

  const toggleSave = (name: string) => {
    setSaved((current) => (
      current.includes(name)
        ? current.filter((item) => item !== name)
        : [...current, name]
    ));
  };

  return (
    <div className="cad-shell flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="mx-auto flex max-w-[1180px] flex-col gap-7 px-6 pb-12 pt-16 sm:px-8 md:pt-[88px]">
          <div className="flex items-center gap-5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-mark.svg" alt="" className="h-14 w-14 md:h-[64px] md:w-[64px]" />
            <div className="min-w-0">
              <h1 className="text-[clamp(32px,4vw,42px)] font-medium leading-[1.08]">Connectors</h1>
              <p className="mt-2 max-w-[62ch] text-pretty text-base font-medium leading-[1.5] text-muted-foreground md:text-lg">
                Not a list of apps: a guide to what people actually build with them.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto_auto]">
            <label className="flex min-h-[62px] items-center gap-3 rounded-[9px] border border-border bg-card px-5">
              <Search className="h-5 w-5 shrink-0 text-[var(--cad-faint)]" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search connectors"
                className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
              />
            </label>
            <label className="flex min-h-[62px] items-center gap-2 rounded-[9px] border border-border bg-card px-5 text-sm font-medium text-muted-foreground">
              <span>Filter:</span>
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="bg-transparent font-semibold text-foreground outline-none"
                aria-label="Filter connectors"
              >
                {activeCategories.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </label>
            <Link
              href="/submit"
              className="inline-flex min-h-[62px] items-center justify-center rounded-[9px] bg-foreground px-7 text-base font-semibold text-background hover:bg-foreground/85"
            >
              Add a workflow
            </Link>
          </div>
        </section>

        <section className="mx-auto max-w-[1180px] px-6 pb-14 sm:px-8">
          <div className="overflow-hidden rounded-[10px] border border-border bg-card">
            <div className="flex min-h-[290px] flex-col items-center justify-center gap-6 bg-[linear-gradient(180deg,var(--cad-raised)_0%,var(--cad-raised)_34%,var(--cad-accent-soft)_140%)] px-6 py-12 text-center">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--cad-faint)]">
                  Curated by members
                </div>
                <h2 className="mt-5 text-[clamp(26px,3vw,36px)] font-medium leading-tight">
                  Claude for support teams
                </h2>
                <p className="mx-auto mt-4 max-w-[47ch] text-pretty text-base font-medium leading-[1.45] text-muted-foreground">
                  The connectors support leads keep together: inbox, CRM, docs and the ticket queue.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                {(liveConnectors.length > 0
                  ? liveConnectors.slice(0, 7)
                  : collectionIcons.map((mono) => ({ mono, name: mono, iconUrl: undefined }))
                ).map((item) => {
                  const favicon = getFaviconUrl(item.iconUrl);
                  return (
                  <span
                    key={item.name}
                    className="flex h-14 w-14 items-center justify-center rounded-[9px] border border-border bg-card text-sm font-semibold text-muted-foreground shadow-sm"
                    title={item.name}
                  >
                    {favicon ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={favicon} alt="" className="h-full w-full rounded-[9px] object-contain p-2" />
                    ) : (
                      item.mono
                    )}
                  </span>
                  );
                })}
              </div>
              <Link
                href="#top-connectors"
                className="inline-flex min-h-12 items-center justify-center rounded-[9px] bg-foreground px-7 text-sm font-semibold text-background hover:bg-foreground/85"
              >
                Explore this collection
              </Link>
            </div>
          </div>
        </section>

        <div id="top-connectors" className="mx-auto flex max-w-[1180px] flex-col gap-14 px-6 pb-[88px] sm:px-8">
          {visibleShelves.map((shelf) => (
            <ConnectorShelf
              key={shelf.title}
              shelf={shelf}
              saved={saved}
              toggleSave={toggleSave}
            />
          ))}
          {visibleShelves[0]?.items.length === 0 && (
            <div className="rounded-[10px] border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
              No connectors match that search.
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
