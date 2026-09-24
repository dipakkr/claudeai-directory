"use client";

import { useEffect, useMemo, useState, type ComponentType, type ReactNode } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowDownUp,
  Atom,
  BellOff,
  Blocks,
  BookOpen,
  BookText,
  Compass,
  FilePen,
  FileText,
  Image as ImageIcon,
  MessageSquareText,
  PanelsTopLeft,
  Presentation,
  RefreshCcw,
  Scale,
  ScanEye,
  ScanSearch,
  Scissors,
  Shapes,
  Sheet,
  ShieldAlert,
  ShieldCheck,
  Ship,
  Smile,
  Stamp,
  SwatchBook,
  Type as TypeIcon,
  Wand2,
  Wrench,
  ArrowLeft,
  BadgeCheck,
  Bot,
  Briefcase,
  Bug,
  Check,
  ChevronLeft,
  ChevronRight,
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

// Specific icons for resources without a logo, matched on words in the name
// (then tags). First match wins; otherwise the category icon, then the type icon.
const KEYWORD_ICONS: [RegExp, Icon][] = [
  [/\bpdf\b/, FileText],
  [/\b(word|docx)\b/, FilePen],
  [/\b(excel|spreadsheet|xlsx)\b/, Sheet],
  [/\b(powerpoint|presentation|pptx|slides?)\b/, Presentation],
  [/discernment|judg/, Scale],
  [/academy|course|learn|tutor/, GraduationCap],
  [/api reference|\bapi\b/, BookOpen],
  [/react|artifact/, Atom],
  [/\bgif\b|emoji|slack/, Smile],
  [/communication|announce/, Megaphone],
  [/documentation|co-author|\bdocs?\b/, BookText],
  [/skill creator|build custom/, Wand2],
  [/\bmcp\b/, Plug],
  [/playwright|web app test/, FlaskConical],
  [/algorithmic|generative/, Shapes],
  [/theme/, SwatchBook],
  [/brand|identity/, Stamp],
  [/poster|visual art|\bart\b/, ImageIcon],
  [/frontend|\bui\b|interface/, PanelsTopLeft],
  [/threat/, ShieldAlert],
  [/security|audit/, ShieldCheck],
  [/\btdd\b/, RefreshCcw],
  [/\btest/, TestTube2],
  [/debug|\bbug/, Bug],
  [/error|detective/, ScanSearch],
  [/silent|failure/, BellOff],
  [/deploy|release/, Rocket],
  [/troubleshoot|devops/, Wrench],
  [/kubernetes|\bk8s\b|container/, Ship],
  [/search/, Search],
  [/\btype\b|typing/, TypeIcon],
  [/architect/, Blocks],
  [/pull request|\bpr\b/, GitPullRequest],
  [/comment/, MessageSquareText],
  [/simplif/, Scissors],
  [/review/, ScanEye],
  [/explor/, Compass],
];

/** Index into KEYWORD_ICONS for a name/tags, or -1. Pure, so render code can look the icon up. */
function keywordIndex(name: string, tags: string[] = []) {
  const n = name.toLowerCase();
  let i = KEYWORD_ICONS.findIndex(([re]) => re.test(n));
  if (i < 0) {
    const t = tags.join(" ").toLowerCase();
    i = KEYWORD_ICONS.findIndex(([re]) => re.test(t));
  }
  return i;
}

/** The icon a resource gets when it has no logo: by name, else category, else type. */
export function CategoryGlyph({
  category,
  type,
  name = "",
  tags,
  className,
}: {
  category: string;
  type: DirectoryType;
  name?: string;
  tags?: string[];
  className?: string;
}) {
  const i = keywordIndex(name, tags);
  const Glyph = i >= 0 ? KEYWORD_ICONS[i][1] : CATEGORY_ICON[category.toLowerCase()] ?? TYPE_ICON[type];
  return <Glyph className={className} strokeWidth={1.6} aria-hidden="true" />;
}

const SORT_LABEL: Record<SortKey, string> = { trending: "Trending", top: "Most popular", new: "Newest" };
const PAGE = 30;

// --- Small pieces --------------------------------------------------------------

const TYPE_NOUN: Record<DirectoryType, string> = { skill: "Skill", mcp: "MCP server", agent: "Agent", prompt: "Prompt" };

export function Tile({ item, size = 48 }: { item: DirectoryItem; size?: number }) {
  const [failed, setFailed] = useState(false);
  const i = keywordIndex(item.name, item.tags);
  const Glyph = i >= 0 ? KEYWORD_ICONS[i][1] : CATEGORY_ICON[item.category.toLowerCase()] ?? TYPE_ICON[item.type];
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-lg border border-border bg-[var(--cad-tile)] text-foreground/80"
      style={{ width: size, height: size }}
    >
      {item.iconUrl && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.iconUrl} alt="" className="rounded object-contain" style={{ width: size * 0.56, height: size * 0.56 }} onError={() => setFailed(true)} />
      ) : (
        <Glyph style={{ width: Math.round(size * 0.42), height: Math.round(size * 0.42) }} strokeWidth={1.5} aria-hidden="true" />
      )}
    </span>
  );
}

function metricText(item: DirectoryItem) {
  if (!item.metric) return null;
  return item.metric.label === "reference server" ? null : `${item.metric.value} ${item.metric.label}`;
}

/** Card like claude.ai/directory: logo tile, name + check, two lines, "Type · by X". */
export function ResourceCard({ item }: { item: DirectoryItem }) {
  const meta = [TYPE_NOUN[item.type], item.author ? `by ${item.author}` : null, metricText(item)].filter(Boolean);
  return (
    <article className="group relative flex gap-3.5 rounded-[11px] border border-border p-3.5 transition-colors hover:bg-[var(--cad-surface)]">
      <Tile item={item} />
      <div className="min-w-0 flex-1">
        <h3 className="flex min-w-0 items-center gap-1.5 text-[14px] font-medium text-foreground">
          <Link href={item.href} className="truncate after:absolute after:inset-0 after:rounded-[11px] after:content-['']">
            {item.name}
          </Link>
          {item.verified && <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-label="Official" />}
        </h3>
        <p className="mt-[3px] line-clamp-2 text-[13px] leading-[1.35] text-[var(--cad-desc)]">{item.description}</p>
        <p className="mt-1 truncate text-[13px] text-muted-foreground">{meta.join("  ·  ")}</p>
      </div>
    </article>
  );
}

function CardGrid({ items }: { items: DirectoryItem[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <ResourceCard key={item.key} item={item} />
      ))}
    </div>
  );
}

function Section({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="mt-14">
      <div className="mb-4 flex items-end justify-between gap-4">
        <h2 className="font-sans text-[22px] font-normal leading-tight text-foreground">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

// Collection band gradients (tinted like the directory's curated carousel).
const BANDS = [
  "from-[#1d2b25] to-[#34594a]",
  "from-[#1c2433] to-[#2f4a6b]",
  "from-[#2b2119] to-[#5a3d2a]",
  "from-[#241d2e] to-[#46365e]",
];

interface Collection {
  category: string;
  items: DirectoryItem[];
  count: number;
}

/** "Collections" carousel: the biggest categories, with their best-known logos. Real data only. */
function CollectionCarousel({ collections, noun, onExplore }: { collections: Collection[]; noun: string; onExplore: (category: string) => void }) {
  const [index, setIndex] = useState(0);
  if (collections.length === 0) return null;
  const current = collections[index % collections.length];
  const go = (d: number) => setIndex((i) => (i + d + collections.length) % collections.length);
  return (
    <div className="mt-10">
      <div className={cn("relative overflow-hidden rounded-[11px] border border-border bg-gradient-to-b px-6 pb-10 pt-10 text-center", BANDS[index % BANDS.length])}>
        <p className="text-[12px] uppercase tracking-[0.08em] text-foreground/60">Collection · {current.count} {noun}</p>
        <h2 className="mt-2 font-sans text-[22px] font-normal text-foreground">
          {noun.charAt(0).toUpperCase() + noun.slice(1)} for {categoryLabel(current.category).toLowerCase()}
        </h2>
        <p className="mt-1.5 text-[14px] text-foreground/75">The most-used {noun} in {categoryLabel(current.category).toLowerCase()}.</p>
        <div className="mx-auto mt-7 flex max-w-[640px] flex-wrap items-end justify-center gap-3.5">
          {current.items.map((item, i) => (
            <Link
              key={item.key}
              href={item.href}
              title={item.name}
              className={cn(
                "rounded-xl shadow-lg shadow-black/30 transition-transform hover:-translate-y-0.5",
                i % 2 === 1 && "translate-y-3",
              )}
            >
              <Tile item={item} size={i % 3 === 1 ? 72 : 56} />
            </Link>
          ))}
        </div>
        <button
          type="button"
          onClick={() => onExplore(current.category)}
          className="mt-9 inline-flex h-10 cursor-pointer items-center rounded-lg bg-background/80 px-4 text-[14px] font-medium text-foreground ring-1 ring-white/10 transition-colors hover:bg-background"
        >
          Explore
        </button>
        {collections.length > 1 && (
          <>
            <button type="button" aria-label="Previous collection" onClick={() => go(-1)} className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-background/70 text-foreground hover:bg-background">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button type="button" aria-label="Next collection" onClick={() => go(1)} className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-background/70 text-foreground hover:bg-background">
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}
      </div>
      {collections.length > 1 && (
        <div className="mt-4 flex justify-center gap-1.5">
          {collections.map((c, i) => (
            <button
              key={c.category}
              type="button"
              aria-label={`Show ${categoryLabel(c.category)}`}
              onClick={() => setIndex(i)}
              className={cn("h-1.5 cursor-pointer rounded-full transition-all", i === index % collections.length ? "w-7 bg-foreground" : "w-1.5 bg-foreground/30")}
            />
          ))}
        </div>
      )}
    </div>
  );
}

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

  // Home sections: Top, Trending, New, then the biggest categories. Deduped so a
  // small catalog never repeats an item.
  const home = useMemo(() => {
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
    const topKeys = orders?.top ?? fallback;
    const sections: { title: string; items: DirectoryItem[]; sort?: SortKey; category?: string }[] = [
      { title: `Top ${noun}`, items: take(topKeys, 9), sort: "top" },
      { title: "Trending", items: take(orders?.trending ?? fallback, 6), sort: "trending" },
    ];
    if (type !== "mcp") sections.push({ title: "New", items: take(orders?.new, 6), sort: "new" });
    for (const [cat] of categories.slice(0, 4)) {
      const inCat = topKeys.filter((k) => byKey.get(k)?.category === cat);
      sections.push({ title: categoryLabel(cat), items: take(inCat, 6), category: cat });
    }
    return sections.filter((s) => s.items.length >= 3 || (s.sort === "top" && s.items.length > 0));
  }, [items, orders, type, noun, categories]);

  // Carousel: the biggest categories with at least 4 items, logos first.
  const collections = useMemo<Collection[]>(() => {
    const topKeys = orders?.top ?? items.map((i) => i.key);
    const byKey = new Map(items.map((i) => [i.key, i]));
    return categories
      .filter(([, count]) => count >= 4)
      .slice(0, 4)
      .map(([cat, count]) => {
        const inCat = topKeys.map((k) => byKey.get(k)).filter((i): i is DirectoryItem => Boolean(i) && i!.category === cat);
        const withLogos = [...inCat.filter((i) => i.iconUrl), ...inCat.filter((i) => !i.iconUrl)];
        return { category: cat, count, items: withLogos.slice(0, 7) };
      });
  }, [items, orders, categories]);

  const listMode = showAll || Boolean(query.trim()) || Boolean(category);
  const openList = (nextSort: SortKey) => {
    setSort(nextSort);
    setShowAll(true);
    setVisible(PAGE);
    window.scrollTo({ top: 0 });
  };
  const openCategory = (cat: string) => {
    setCategory(cat);
    setVisible(PAGE);
    window.scrollTo({ top: 0 });
  };
  const backToDiscover = () => {
    setQuery("");
    setCategory("");
    setShowAll(false);
    setSort("trending");
  };
  const showAllButton = (onClick: () => void) => (
    <button type="button" onClick={onClick} className="cursor-pointer text-[14px] text-foreground transition-opacity hover:opacity-75">
      Show all
    </button>
  );

  const heading = category ? categoryLabel(category) : title;
  const shown = filtered.slice(0, visible);
  const filterLabel = category ? categoryLabel(category) : "All";

  return (
    <div className="mx-auto w-full max-w-[1136px] px-4 pb-20 pt-10 md:px-8 md:pt-12">
      {listMode ? (
        <button
          type="button"
          onClick={backToDiscover}
          className="mb-3 inline-flex cursor-pointer items-center gap-1.5 text-[14px] text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {tab?.label ?? title}
        </button>
      ) : null}
      <h1 className="text-[34px] font-light leading-tight text-foreground md:text-[38px]">{heading}</h1>
      {!listMode && <p className="mt-1.5 max-w-[62ch] text-[15px] leading-relaxed text-[var(--cad-desc)]">{description}</p>}

      {/* Search, filter, submit */}
      <div className="mt-7 flex flex-wrap items-center gap-3">
        <label className="relative min-w-0 flex-1 basis-[280px]">
          <span className="sr-only">{searchPlaceholder}</span>
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setVisible(PAGE);
            }}
            placeholder={searchPlaceholder}
            className="h-[42px] w-full rounded-lg border border-border bg-transparent pl-11 pr-3 text-[15px] text-foreground placeholder:text-muted-foreground focus:border-[#3b82f6] focus:outline-none"
          />
        </label>

        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex h-[42px] cursor-pointer items-center gap-1.5 rounded-lg bg-[var(--cad-control)] px-4 text-[15px] text-muted-foreground transition-colors hover:text-foreground data-[state=open]:text-foreground">
            <SlidersHorizontal className="h-4 w-4 sm:hidden" />
            <span className="hidden sm:inline">Filter: {filterLabel}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="max-h-[65vh] w-60 overflow-y-auto">
            <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Type</DropdownMenuLabel>
            {TYPE_TABS.map((t) => (
              <DropdownMenuItem key={t.type} asChild>
                <Link href={t.href}>
                  <span className="flex-1">{t.label}</span>
                  {t.type === type && <Check className="h-4 w-4" />}
                </Link>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Sort</DropdownMenuLabel>
            {sorts.map((key) => (
              <DropdownMenuItem key={key} onClick={() => openList(key)}>
                <span className="flex-1">{SORT_LABEL[key]}</span>
                {listMode && sort === key && <ArrowDownUp className="h-3.5 w-3.5" />}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Category</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => setCategory("")}>
              <span className="flex-1">All categories</span>
              {!category && <Check className="h-4 w-4" />}
            </DropdownMenuItem>
            {categories.map(([value, count]) => (
              <DropdownMenuItem key={value} onClick={() => openCategory(value)}>
                <span className="flex-1">{categoryLabel(value)}</span>
                <span className="text-xs text-muted-foreground">{count}</span>
                {category === value && <Check className="h-4 w-4" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex h-[42px] shrink-0 cursor-pointer items-center gap-2 rounded-lg border border-border bg-[var(--cad-surface)] px-4 text-[15px] text-foreground transition-colors hover:bg-[var(--cad-control)]">
            <Plus className="h-4 w-4" />
            Submit
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60">
            <DropdownMenuItem asChild>
              <Link href={type === "prompt" ? "/submit" : `/submit?type=${type}`} className="gap-2.5">
                <Upload className="h-4 w-4" />
                Submit {type === "mcp" ? "an MCP server" : type === "agent" ? "an Agent" : "a Skill"}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/launches/submit" className="gap-2.5">
                <Rocket className="h-4 w-4" />
                Launch an app
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {listMode ? (
        <>
          <p className="mt-8 text-[13px] text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? noun.replace(/s$/, "") : noun}
            {!query && !category && ` · ${SORT_LABEL[sort]}`}
          </p>
          {filtered.length === 0 ? (
            <div className="mt-4 rounded-[11px] border border-dashed border-border px-6 py-12 text-center text-[14px] text-muted-foreground">
              {emptyMessage}{" "}
              <button type="button" onClick={backToDiscover} className="cursor-pointer text-foreground underline underline-offset-4">
                Clear filters
              </button>
            </div>
          ) : (
            <div className="mt-4">
              <CardGrid items={shown} />
            </div>
          )}
          {filtered.length > shown.length && (
            <div className="mt-8 text-center">
              <button
                type="button"
                onClick={() => setVisible((v) => v + PAGE)}
                className="inline-flex h-10 cursor-pointer items-center rounded-lg bg-[var(--cad-control)] px-5 text-[14px] text-foreground hover:bg-[var(--cad-control-active)]"
              >
                Show more
              </button>
            </div>
          )}
        </>
      ) : (
        <>
          <CollectionCarousel collections={collections} noun={noun} onExplore={openCategory} />
          {home.map((section) => (
            <Section
              key={section.title}
              title={section.title}
              action={showAllButton(() => (section.category ? openCategory(section.category) : openList(section.sort ?? "trending")))}
            >
              <CardGrid items={section.items} />
            </Section>
          ))}
        </>
      )}
    </div>
  );
}
