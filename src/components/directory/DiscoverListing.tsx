"use client";

import { useEffect, useMemo, useState, type ComponentType, type ReactNode } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowDownUp,
  ArrowLeft,
  ArrowRight,
  Bot,
  Briefcase,
  Bug,
  Check,
  ChevronDown,
  Clapperboard,
  Code2,
  Container,
  Cpu,
  Database,
  FlaskConical,
  GitPullRequest,
  GraduationCap,
  HeartPulse,
  Landmark,
  ListChecks,
  Megaphone,
  MessageSquare,
  Palette,
  Plane,
  Plug,
  Plus,
  Rocket,
  Search,
  Shield,
  SlidersHorizontal,
  Sparkles,
  TestTube2,
  Upload,
  Workflow,
  type LucideProps,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { track } from "@/lib/analytics";
import type { DirectoryItem, DirectoryType, SortKey } from "@/lib/directory";
import { cn } from "@/lib/utils";

// Discover layout for /skills, /mcp and /agents, modelled on how Claude
// presents Skills and Connectors: a toolbar, card sections, a category grid,
// and a row list for search, a category, or "Show all".

type Icon = ComponentType<LucideProps>;

const TYPE_TABS: { type: DirectoryType; label: string; href: string; noun: string }[] = [
  { type: "skill", label: "Skills", href: "/skills", noun: "skills" },
  { type: "mcp", label: "MCP servers", href: "/mcp", noun: "MCP servers" },
  { type: "agent", label: "Agents", href: "/agents", noun: "agents" },
];

const TYPE_ICON: Record<DirectoryType, Icon> = { skill: Sparkles, mcp: Plug, agent: Bot, prompt: MessageSquare };

const CATEGORY_ICON: Record<string, Icon> = {
  business: Briefcase,
  finance: Landmark,
  development: Code2,
  code: Code2,
  coding: Code2,
  productivity: ListChecks,
  healthcare: HeartPulse,
  data: Database,
  marketing: Megaphone,
  design: Palette,
  communication: MessageSquare,
  travel: Plane,
  automation: Workflow,
  research: FlaskConical,
  search: Search,
  system: Cpu,
  education: GraduationCap,
  media: Clapperboard,
  testing: TestTube2,
  debugging: Bug,
  devops: Container,
  "code-review": GitPullRequest,
  security: Shield,
};

const LABEL_WORDS: Record<string, string> = { ai: "AI", api: "API", devops: "DevOps", mcp: "MCP", seo: "SEO", ui: "UI", ux: "UX" };
export const categoryLabel = (value: string) =>
  value
    .replace(/[-_]+/g, " ")
    .split(" ")
    .map((w, i) => LABEL_WORDS[w.toLowerCase()] ?? (i === 0 ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(" ");

/** The icon a resource gets when it has no logo: by category, else by type. */
export function CategoryGlyph({ category, type, className }: { category: string; type: DirectoryType; className?: string }) {
  const Glyph = CATEGORY_ICON[category.toLowerCase()] ?? TYPE_ICON[type];
  return <Glyph className={className} strokeWidth={1.6} aria-hidden="true" />;
}

const SORT_LABEL: Record<SortKey, string> = { trending: "Trending", top: "Most popular", new: "Newest" };
const PAGE = 30;

// --- Small pieces --------------------------------------------------------------

function Tile({ item, size = "md" }: { item: DirectoryItem; size?: "sm" | "md" }) {
  const [failed, setFailed] = useState(false);
  const Glyph = CATEGORY_ICON[item.category.toLowerCase()] ?? TYPE_ICON[item.type];
  const box = size === "md" ? "h-12 w-12 rounded-lg" : "h-10 w-10 rounded-lg";
  return (
    <span className={cn("flex shrink-0 items-center justify-center bg-[var(--cad-tile)] text-foreground/85", box)}>
      {item.iconUrl && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.iconUrl} alt="" className="h-6 w-6 rounded object-contain" onError={() => setFailed(true)} />
      ) : (
        <Glyph className="h-5 w-5" strokeWidth={1.6} aria-hidden="true" />
      )}
    </span>
  );
}

function metricText(item: DirectoryItem) {
  if (!item.metric) return null;
  return item.metric.label === "reference server" ? "Official" : `${item.metric.value} ${item.metric.label}`;
}

function Byline({ item, withMetric = true }: { item: DirectoryItem; withMetric?: boolean }) {
  const metric = withMetric ? metricText(item) : null;
  const parts = [item.author ? `by ${item.author}` : null, metric].filter(Boolean);
  if (parts.length === 0) return null;
  return <span className="truncate text-[13px] text-muted-foreground">{parts.join("  ·  ")}</span>;
}

/** Two-column card: whole card opens the page; "+" jumps to its install section. */
function ResourceCard({ item }: { item: DirectoryItem }) {
  return (
    <article className="group relative flex gap-4 rounded-xl border border-border p-4 transition-colors hover:border-[var(--cad-line-hover)] hover:bg-[var(--cad-surface)]">
      <Link href={item.href} className="absolute inset-0 rounded-xl" aria-label={item.name} />
      <Tile item={item} />
      <div className="min-w-0 flex-1 pr-8">
        <h3 className="truncate text-[15px] font-medium text-foreground">{item.name}</h3>
        <p className="mt-1 line-clamp-2 text-[13.5px] leading-5 text-muted-foreground">{item.description}</p>
        <div className="mt-1.5 flex min-w-0">
          <Byline item={item} />
        </div>
      </div>
      <Link
        href={`${item.href}#install`}
        aria-label={`Install ${item.name}`}
        title="Install"
        className="absolute right-4 top-4 z-10 flex h-7 w-7 items-center justify-center rounded-md bg-[var(--cad-control)] text-foreground transition-colors hover:bg-[var(--cad-control-active)]"
      >
        <Plus className="h-4 w-4" />
      </Link>
    </article>
  );
}

function ResourceRow({ item }: { item: DirectoryItem }) {
  const extra = item.tags.filter((t) => t.toLowerCase() !== item.category.toLowerCase()).length;
  const metric = metricText(item);
  return (
    <li className="group relative flex items-center gap-4 border-b border-border py-3.5">
      <Link href={item.href} className="absolute inset-0" aria-label={item.name} />
      <Tile item={item} size="sm" />
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2">
          <span className="truncate text-[15px] font-medium text-foreground group-hover:underline group-hover:underline-offset-4">{item.name}</span>
          {item.category && (
            <span className="shrink-0 rounded bg-[var(--cad-chip)] px-1.5 py-0.5 text-[11.5px] text-muted-foreground">
              {categoryLabel(item.category)}
            </span>
          )}
          {extra > 0 && <span className="shrink-0 rounded bg-[var(--cad-chip)] px-1.5 py-0.5 text-[11.5px] text-muted-foreground">+{extra}</span>}
        </div>
        <p className="mt-0.5 truncate text-[13.5px] text-muted-foreground">
          {item.author && <span>by {item.author}  ·  </span>}
          {item.description}
        </p>
      </div>
      {metric && <span className="hidden shrink-0 text-[13px] text-muted-foreground sm:block">{metric}</span>}
      <Link
        href={`${item.href}#install`}
        className="relative z-10 inline-flex h-8 shrink-0 items-center rounded-lg bg-[var(--cad-control)] px-3.5 text-[13px] font-medium text-foreground transition-colors hover:bg-[var(--cad-control-active)]"
      >
        Install
      </Link>
    </li>
  );
}

function Section({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="mt-10">
      <div className="mb-3.5 flex items-center justify-between gap-4">
        <h2 className="font-sans text-[15px] font-medium text-foreground">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

const iconButton =
  "inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-[var(--cad-control)] hover:text-foreground data-[state=open]:bg-[var(--cad-control)]";

// --- Page ----------------------------------------------------------------------

interface DiscoverListingProps {
  type: DirectoryType;
  title: string;
  description: string;
  items: DirectoryItem[];
  orders?: Record<SortKey, string[]>;
  searchPlaceholder: string;
  initialCategory?: string;
  initialQuery?: string;
  emptyMessage?: string;
}

export default function DiscoverListing({
  type,
  title,
  description,
  items,
  orders,
  searchPlaceholder,
  initialCategory = "",
  initialQuery = "",
  emptyMessage = "Nothing matches that yet.",
}: DiscoverListingProps) {
  const params = useSearchParams();
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory === "All" ? "" : initialCategory);
  const [showAll, setShowAll] = useState(params.get("view") === "all");
  const initialSort = params.get("sort") as SortKey | null;
  const [sort, setSort] = useState<SortKey>(initialSort && initialSort in SORT_LABEL ? initialSort : "trending");
  const [visible, setVisible] = useState(PAGE);
  const [allCategories, setAllCategories] = useState(false);

  // MCP created_at values are bulk-import dates, so "Newest" means nothing there.
  const sorts: SortKey[] = type === "mcp" ? ["trending", "top"] : ["trending", "top", "new"];
  const tab = TYPE_TABS.find((t) => t.type === type);
  const noun = tab?.noun ?? "resources";

  // Shareable, non-indexed filtered views.
  useEffect(() => {
    const next = new URLSearchParams(window.location.search);
    const set = (key: string, value: string) => (value ? next.set(key, value) : next.delete(key));
    set("search", query.trim());
    set("category", category);
    set("view", showAll ? "all" : "");
    set("sort", sort === "trending" ? "" : sort);
    const qs = next.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${qs ? `?${qs}` : ""}`);
  }, [query, category, showAll, sort]);

  // One search_performed per settled query, not per keystroke.
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) return;
    const id = window.setTimeout(() => track("search_performed", { query: q, resource_type: type === "prompt" ? undefined : type }), 900);
    return () => window.clearTimeout(id);
  }, [query, type]);

  const ordered = useMemo(() => {
    if (!orders) return items;
    const byKey = new Map(items.map((i) => [i.key, i]));
    return orders[sort].map((k) => byKey.get(k)).filter((i): i is DirectoryItem => Boolean(i));
  }, [items, orders, sort]);

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of items) if (item.category) counts.set(item.category, (counts.get(item.category) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const cat = category.toLowerCase();
    return ordered.filter((item) => {
      if (cat && !item.category.toLowerCase().includes(cat)) return false;
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        (item.author ?? "").toLowerCase().includes(q) ||
        item.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [ordered, query, category]);

  // Home sections, deduped so a small catalog never shows the same item twice.
  const sections = useMemo(() => {
    const byKey = new Map(items.map((i) => [i.key, i]));
    const used = new Set<string>();
    const take = (keys: string[] | undefined, n: number) => {
      const out: DirectoryItem[] = [];
      for (const k of keys ?? []) {
        if (out.length >= n) break;
        const item = byKey.get(k);
        if (item && !used.has(k)) {
          used.add(k);
          out.push(item);
        }
      }
      return out;
    };
    const fallback = items.map((i) => i.key);
    return {
      trending: take(orders?.trending ?? fallback, 6),
      top: take(orders?.top ?? fallback, 6),
      new: type === "mcp" ? [] : take(orders?.new, 6),
    };
  }, [items, orders, type]);

  const listMode = showAll || Boolean(query.trim()) || Boolean(category);
  const openList = (nextSort: SortKey) => {
    setSort(nextSort);
    setShowAll(true);
    setVisible(PAGE);
    window.scrollTo({ top: 0 });
  };
  const backToDiscover = () => {
    setQuery("");
    setCategory("");
    setShowAll(false);
    setSort("trending");
  };
  const showAllLink = (nextSort: SortKey) => (
    <button
      type="button"
      onClick={() => openList(nextSort)}
      className="inline-flex cursor-pointer items-center gap-1 text-[13px] text-foreground/85 transition-colors hover:text-foreground"
    >
      Show all <ArrowRight className="h-3.5 w-3.5" />
    </button>
  );

  const heading = category ? categoryLabel(category) : title;
  const shown = filtered.slice(0, visible);
  const visibleCategories = allCategories ? categories : categories.slice(0, 9);

  return (
    <div className="mx-auto w-full max-w-[1000px] px-4 pb-20 pt-10 md:px-8 md:pt-14">
      {listMode && (
        <button
          type="button"
          onClick={backToDiscover}
          className="mb-4 inline-flex cursor-pointer items-center gap-1.5 text-[14px] text-foreground/85 transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {tab?.label ?? title}
        </button>
      )}
      <h1 className="text-[34px] font-normal leading-tight text-foreground md:text-[40px]">{heading}</h1>
      {!listMode && <p className="mt-2 max-w-[70ch] text-[14.5px] leading-relaxed text-muted-foreground">{description}</p>}

      {/* Toolbar */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <nav aria-label="Resource types" className="flex items-center gap-0.5">
          {TYPE_TABS.map((t) => (
            <Link
              key={t.type}
              href={t.href}
              aria-current={t.type === type ? "page" : undefined}
              className={cn(
                "rounded-lg px-3 py-1.5 text-[14px] transition-colors",
                t.type === type ? "bg-[var(--cad-control)] text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex w-full items-center gap-1.5 sm:w-auto">
          <label className="relative min-w-0 flex-1 sm:w-[300px] sm:flex-none">
            <span className="sr-only">{searchPlaceholder}</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setVisible(PAGE);
              }}
              placeholder={searchPlaceholder}
              className="h-9 w-full rounded-lg border border-input bg-secondary pl-9 pr-3 text-[14px] text-foreground placeholder:text-muted-foreground focus:border-[var(--cad-line-hover)] focus:outline-none"
            />
          </label>

          <DropdownMenu>
            <DropdownMenuTrigger className={cn(iconButton, category && "text-foreground")} aria-label="Filter by category" title="Filter by category">
              <SlidersHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="max-h-[60vh] w-56 overflow-y-auto">
              <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Category</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setCategory("")}>
                <span className="flex-1">All categories</span>
                {!category && <Check className="h-4 w-4" />}
              </DropdownMenuItem>
              {categories.map(([value, count]) => (
                <DropdownMenuItem key={value} onClick={() => { setCategory(value); setVisible(PAGE); }}>
                  <span className="flex-1">{categoryLabel(value)}</span>
                  <span className="text-xs text-muted-foreground">{count}</span>
                  {category === value && <Check className="h-4 w-4" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger className={iconButton} aria-label="Sort" title="Sort">
              <ArrowDownUp className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              {sorts.map((key) => (
                <DropdownMenuItem key={key} onClick={() => openList(key)}>
                  <span className="flex-1">{SORT_LABEL[key]}</span>
                  {listMode && sort === key && <Check className="h-4 w-4" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-lg bg-foreground px-3 text-[14px] font-medium text-background transition-colors hover:bg-foreground/90">
              <Plus className="h-4 w-4" />
              Submit
              <ChevronDown className="h-3.5 w-3.5 opacity-70" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60">
              <DropdownMenuItem asChild>
                <Link href="/submit" className="gap-2.5">
                  <Upload className="h-4 w-4" />
                  Submit a Skill, MCP or Agent
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/launches/submit" className="gap-2.5">
                  <Rocket className="h-4 w-4" />
                  Launch an app
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/launches" className="gap-2.5 text-muted-foreground">
                  <ArrowRight className="h-4 w-4" />
                  See recent launches
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {listMode ? (
        <>
          <p className="mt-6 text-[13px] text-muted-foreground">
            {filtered.length === 0 ? "" : `${filtered.length} ${filtered.length === 1 ? noun.replace(/s$/, "") : noun}`}
            {!query && !category && ` · ${SORT_LABEL[sort]}`}
          </p>
          {filtered.length === 0 ? (
            <div className="mt-8 rounded-xl border border-dashed border-border px-6 py-12 text-center text-[14px] text-muted-foreground">
              {emptyMessage}{" "}
              <button type="button" onClick={backToDiscover} className="cursor-pointer text-foreground underline underline-offset-4">
                Clear filters
              </button>
            </div>
          ) : (
            <ul className="mt-2 border-t border-border">
              {shown.map((item) => (
                <ResourceRow key={item.key} item={item} />
              ))}
            </ul>
          )}
          {filtered.length > shown.length && (
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setVisible((v) => v + PAGE)}
                className="inline-flex h-9 cursor-pointer items-center rounded-lg bg-[var(--cad-control)] px-4 text-[13px] font-medium text-foreground hover:bg-[var(--cad-control-active)]"
              >
                Show more
              </button>
            </div>
          )}
        </>
      ) : (
        <>
          {sections.trending.length > 0 && (
            <Section title="Trending" action={showAllLink("trending")}>
              <div className="grid gap-3 md:grid-cols-2">
                {sections.trending.map((item) => (
                  <ResourceCard key={item.key} item={item} />
                ))}
              </div>
            </Section>
          )}
          {sections.top.length > 0 && (
            <Section title={`Most popular ${noun}`} action={showAllLink("top")}>
              <div className="grid gap-3 md:grid-cols-2">
                {sections.top.map((item) => (
                  <ResourceCard key={item.key} item={item} />
                ))}
              </div>
            </Section>
          )}
          {sections.new.length > 0 && (
            <Section title={`New ${noun}`} action={showAllLink("new")}>
              <div className="grid gap-3 md:grid-cols-2">
                {sections.new.map((item) => (
                  <ResourceCard key={item.key} item={item} />
                ))}
              </div>
            </Section>
          )}
          {categories.length > 1 && (
            <Section
              title="Categories"
              action={
                categories.length > 9 ? (
                  <button
                    type="button"
                    onClick={() => setAllCategories((v) => !v)}
                    className="inline-flex cursor-pointer items-center gap-1 text-[13px] text-foreground/85 hover:text-foreground"
                  >
                    {allCategories ? "Show fewer" : `Show all ${categories.length}`}
                    <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", allCategories && "rotate-180")} />
                  </button>
                ) : undefined
              }
            >
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {visibleCategories.map(([value, count]) => {
                  const Glyph = CATEGORY_ICON[value.toLowerCase()] ?? TYPE_ICON[type];
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => {
                        setCategory(value);
                        setVisible(PAGE);
                        window.scrollTo({ top: 0 });
                      }}
                      className="flex cursor-pointer items-center gap-3.5 rounded-xl border border-border p-3 text-left transition-colors hover:border-[var(--cad-line-hover)] hover:bg-[var(--cad-surface)]"
                    >
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[var(--cad-raised)] text-foreground/85">
                        <Glyph className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
                      </span>
                      <span className="flex-1 truncate text-[15px] text-foreground">{categoryLabel(value)}</span>
                      <span className="pr-1 text-[13px] text-muted-foreground">{count}</span>
                    </button>
                  );
                })}
              </div>
            </Section>
          )}
        </>
      )}
    </div>
  );
}
