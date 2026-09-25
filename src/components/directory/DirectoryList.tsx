"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUp, Download, Search, Star, Wrench } from "lucide-react";
import FavoriteButton, { favoriteTargetType } from "@/components/shared/FavoriteButton";
import { track } from "@/lib/analytics";
import { DIRECTORY_TYPES, type DirectoryItem, type DirectoryType, type SortKey } from "@/lib/directory";

type TypeFilter = "all" | DirectoryType;

interface DirectoryListProps {
  items: DirectoryItem[];
  /** Ordered item keys for the Trending / Top / New tabs. Without it, items render in given order. */
  orders?: Record<SortKey, string[]>;
  /** Type filter chips (All / Skills / MCP / Agents). Shown when more than one type is present. */
  showTypeFilter?: boolean;
  searchPlaceholder?: string;
  pageSize?: number;
  /** Category chips under the search box (raw category values). */
  categories?: string[];
  /** Hide the search input while preserving filters, sort tabs, and rows. */
  hideSearch?: boolean;
  initialCategory?: string;
  initialQuery?: string;
  /** Mirror search + category into the URL so filtered views are shareable (not indexed). */
  syncUrl?: boolean;
  /** Anchor id for the feed, e.g. "trending" for the homepage "Explore Trending" link. */
  feedId?: string;
  emptyMessage?: string;
}

const SORTS: { key: SortKey; label: string }[] = [
  { key: "trending", label: "Trending" },
  { key: "top", label: "Top" },
  { key: "new", label: "New" },
];

const LABEL_WORDS: Record<string, string> = { ai: "AI", api: "API", devops: "DevOps", mcp: "MCP", seo: "SEO", ui: "UI", ux: "UX" };
/** "code-review" -> "Code review", "devops" -> "DevOps"; already-formatted labels pass through. */
const categoryLabel = (value: string) => {
  const words = value.replace(/[-_]+/g, " ").split(" ");
  return words
    .map((w, i) => LABEL_WORDS[w.toLowerCase()] ?? (i === 0 ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(" ");
};

const metricIcons = { download: Download, tools: Wrench, upvote: ArrowUp, star: Star };

export default function DirectoryList({
  items,
  orders,
  showTypeFilter = false,
  searchPlaceholder = "Search Skills, MCPs and Agents...",
  pageSize = 30,
  categories = [],
  hideSearch = false,
  initialCategory = "",
  initialQuery = "",
  syncUrl = false,
  feedId,
  emptyMessage = "Nothing here yet.",
}: DirectoryListProps) {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory === "All" ? "" : initialCategory);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [sort, setSort] = useState<SortKey>("trending");
  const [visible, setVisible] = useState(pageSize);
  const searchRef = useRef<HTMLInputElement>(null);

  // "/" jumps to search, like most directories and docs sites.
  useEffect(() => {
    if (hideSearch) return;
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (e.key !== "/" || target.closest("input, textarea, [contenteditable=true]")) return;
      e.preventDefault();
      searchRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [hideSearch]);

  useEffect(() => {
    if (!syncUrl) return;
    const params = new URLSearchParams(window.location.search);
    for (const [key, value] of [["search", query.trim()], ["category", category]]) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    const qs = params.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${qs ? `?${qs}` : ""}`);
  }, [syncUrl, query, category]);

  // One search_performed per settled query, not per keystroke.
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) return;
    const id = window.setTimeout(() => track("search_performed", { query: q }), 900);
    return () => window.clearTimeout(id);
  }, [query]);

  const ordered = useMemo(() => {
    if (!orders) return items;
    const byKey = new Map(items.map((i) => [i.key, i]));
    return orders[sort].map((k) => byKey.get(k)).filter((i): i is DirectoryItem => Boolean(i));
  }, [items, orders, sort]);

  const counts = useMemo(() => {
    const c: Record<TypeFilter, number> = { all: items.length, skill: 0, mcp: 0, agent: 0, plugin: 0, prompt: 0 };
    for (const item of items) c[item.type] += 1;
    return c;
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const cat = category.toLowerCase();
    const exactCategory = categories.some((c) => c.toLowerCase() === cat);
    return ordered.filter((item) => {
      if (typeFilter !== "all" && item.type !== typeFilter) return false;
      // Chips match exactly; other values (old links like ?category=Coding) match
      // by substring so they still find "Coding & Development".
      const itemCat = item.category.toLowerCase();
      if (cat && (exactCategory ? itemCat !== cat : !itemCat.includes(cat))) return false;
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        itemCat.includes(q) ||
        item.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [ordered, query, typeFilter, category, categories]);

  const shown = filtered.slice(0, visible);
  const typeChips = DIRECTORY_TYPES.filter((t) => counts[t.type] > 0);
  const showTypes = showTypeFilter && typeChips.length > 1;
  const reset = () => setVisible(pageSize);

  return (
    <div>
      {!hideSearch && (
        <div className="mx-auto max-w-[600px]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              ref={searchRef}
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                reset();
              }}
              placeholder={searchPlaceholder}
              aria-label="Search the directory"
              className="h-14 w-full rounded-lg border border-border bg-card pl-12 pr-12 text-[15px] text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-[var(--cad-line-hover)]"
            />
            <kbd className="pointer-events-none absolute right-5 top-1/2 hidden -translate-y-1/2 rounded border border-border px-1.5 font-mono text-[11px] text-muted-foreground sm:block">
              /
            </kbd>
          </label>
        </div>
      )}

      {categories.length > 0 && (
        <div className="mx-auto mt-6 flex max-w-[720px] flex-wrap justify-center gap-2">
          {["", ...categories].map((value) => (
            <Chip
              key={value || "all"}
              active={category.toLowerCase() === value.toLowerCase()}
              onClick={() => {
                setCategory(value);
                reset();
              }}
            >
              {value ? categoryLabel(value) : "All"}
            </Chip>
          ))}
        </div>
      )}

      <div id={feedId} className={hideSearch && categories.length === 0 ? "scroll-mt-24" : "mt-12 scroll-mt-24"}>
        {(orders || showTypes) && (
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3 border-b border-border">
            {orders ? (
              <div role="tablist" aria-label="Sort" className="flex gap-6">
                {SORTS.map((s) => (
                  <button
                    key={s.key}
                    type="button"
                    role="tab"
                    aria-selected={sort === s.key}
                    onClick={() => {
                      setSort(s.key);
                      reset();
                    }}
                    className={`-mb-px border-b pb-3 text-sm transition-colors ${
                      sort === s.key ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            ) : (
              <span />
            )}
            {showTypes && (
              <div aria-label="Filter by type" className="flex flex-wrap gap-1.5 pb-2.5">
                {[{ type: "all" as TypeFilter, label: "All" }, ...typeChips.map((t) => ({ type: t.type as TypeFilter, label: t.label }))].map(
                  (t) => (
                    <Chip
                      key={t.type}
                      small
                      active={typeFilter === t.type}
                      onClick={() => {
                        setTypeFilter(t.type);
                        reset();
                      }}
                    >
                      {t.label}
                      <span className="ml-1.5 font-mono text-[10.5px] opacity-70">{counts[t.type]}</span>
                    </Chip>
                  ),
                )}
              </div>
            )}
          </div>
        )}

        {shown.length > 0 ? (
          <ol className={orders || showTypes ? "" : "border-t border-border"}>
            {shown.map((item, index) => (
              <DirectoryRow key={item.key} item={item} rank={index + 1} showType={showTypes && typeFilter === "all"} />
            ))}
          </ol>
        ) : (
          <div className="py-16 text-center text-sm text-muted-foreground">
            {query ? <>Nothing matches &ldquo;{query}&rdquo;.</> : emptyMessage}
          </div>
        )}

        {filtered.length > visible && (
          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={() => setVisible((v) => v + pageSize)}
              className="h-9 rounded-lg border border-border px-5 text-sm text-muted-foreground transition-colors hover:border-[var(--cad-line-hover)] hover:text-foreground"
            >
              Show more
              <span className="ml-2 font-mono text-[11px]">{filtered.length - visible}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  small = false,
  children,
}: {
  active: boolean;
  onClick: () => void;
  small?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`inline-flex items-center rounded-lg border transition-colors ${small ? "h-7 px-3 text-[12.5px]" : "h-8 px-3.5 text-[13px]"} ${
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border text-muted-foreground hover:border-[var(--cad-line-hover)] hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function DirectoryRow({ item, rank, showType }: { item: DirectoryItem; rank: number; showType: boolean }) {
  const chip = DIRECTORY_TYPES.find((t) => t.type === item.type)?.chip;
  const MetricIcon = item.metric?.icon ? metricIcons[item.metric.icon] : null;
  const targetId = item.key.split(":").slice(1).join(":") || item.key;

  return (
    <li className="grid grid-cols-[2rem_2.25rem_minmax(0,1fr)_auto_auto] items-center gap-3 border-b border-border/70 py-3.5 sm:grid-cols-[3rem_2.25rem_minmax(0,1fr)_auto_auto]">
      <span className={`font-mono text-[13px] ${rank <= 3 ? "text-primary" : "text-muted-foreground"}`}>{rank}</span>
      <Link
        href={item.href}
        className="group contents"
      >
        <ItemIcon item={item} />
        <span className="min-w-0">
          <span className="flex items-center gap-2">
            <span className="truncate text-[15px] text-foreground transition-colors group-hover:text-primary">{item.name}</span>
            {showType && chip && (
              <span className="hidden shrink-0 rounded border border-border px-1.5 py-px font-mono text-[10px] uppercase tracking-wide text-muted-foreground sm:inline-block">
                {chip}
              </span>
            )}
          </span>
          <span className="mt-0.5 block truncate text-[13px] text-muted-foreground">{item.description}</span>
        </span>
        <span
          className="flex items-center gap-1.5 pl-2 font-mono text-[13px] text-muted-foreground"
          title={item.metric ? `${item.metric.value} ${item.metric.label}` : undefined}
        >
          {item.metric && (
            <>
              {MetricIcon && <MetricIcon className="h-3.5 w-3.5 opacity-70" aria-hidden="true" />}
              {item.metric.value}
              <span className="sr-only">{item.metric.label}</span>
            </>
          )}
        </span>
      </Link>
      <FavoriteButton targetType={favoriteTargetType(item.type)} targetId={targetId} compact className="shrink-0" />
    </li>
  );
}

function ItemIcon({ item }: { item: DirectoryItem }) {
  const [failed, setFailed] = useState(false);
  return (
    <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-md border border-border bg-card font-mono text-[13px] text-muted-foreground">
      {item.iconUrl && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.iconUrl}
          alt=""
          width={20}
          height={20}
          loading="lazy"
          className="h-5 w-5 object-contain"
          onError={() => setFailed(true)}
        />
      ) : (
        item.name[0]?.toUpperCase()
      )}
    </span>
  );
}
