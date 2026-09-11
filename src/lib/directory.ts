import type { Agent, MCPServer, Prompt, Skill } from "@/types";

// One row in the ranked directory list. Every catalog type maps onto this, so
// adding a new type (plugins, setups…) means a new mapper, not a new list.
export type DirectoryType = "skill" | "mcp" | "agent" | "prompt";

export interface DirectoryItem {
  key: string;
  type: DirectoryType;
  name: string;
  description: string;
  href: string;
  iconUrl: string | null;
  category: string;
  tags: string[];
  /** Right-hand column. `value` is compact and mono-set; `label` explains it. */
  metric: { value: string; label: string; icon?: "download" | "tools" | "upvote" | "star" } | null;
  /** Popularity within its own type; higher is better. Only compared within a type. */
  score: number;
  /** ISO date, used for the New ordering. */
  createdAt: string;
}

export type SortKey = "trending" | "top" | "new";
/** Ordered item keys per sort, e.g. from GET /rankings. */
export type Orders = Partial<Record<SortKey, string[]>>;

export const DIRECTORY_TYPES: { type: DirectoryType; label: string; chip: string }[] = [
  { type: "skill", label: "Skills", chip: "Skill" },
  { type: "mcp", label: "MCP", chip: "MCP" },
  { type: "agent", label: "Agents", chip: "Agent" },
  { type: "prompt", label: "Prompts", chip: "Prompt" },
];

export const itemKey = (type: DirectoryType, id: string) => `${type}:${id}`;

export function compactNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, "")}k`;
  return String(n);
}

export function faviconFor(url?: string | null, size = 64): string | null {
  if (!url) return null;
  try {
    return `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=${size}`;
  } catch {
    return null;
  }
}

function hasRemoteInstall(s: MCPServer): boolean {
  if (s.install) return s.install.status === "verified";
  const transport = (s.connection?.transport || "").toLowerCase();
  return /^https:\/\//.test(s.connection?.url?.trim() || "") && ["streamable-http", "http", "sse"].includes(transport);
}

export function mcpToItem(s: MCPServer): DirectoryItem {
  const tools = s.capabilities?.tools?.length ?? 0;
  return {
    key: itemKey("mcp", s.slug || s.id),
    type: "mcp",
    name: s.name,
    description: s.one_liner || s.description || "",
    href: `/mcp/${s.slug || s.id}`,
    iconUrl: faviconFor(s.branding?.icon_url),
    category: s.category || "",
    tags: s.tags ?? [],
    metric:
      tools > 0
        ? { value: `${tools}`, label: tools === 1 ? "tool" : "tools", icon: "tools" }
        : s.official
          ? { value: "official", label: "reference server" }
          : null,
    // Fallback order until install events exist: servers users can add with a
    // verified command first (install over discovery), then by how much they do.
    score: (hasRemoteInstall(s) ? 10000 : 0) + tools,
    createdAt: s.created_at,
  };
}

export function skillToItem(s: Skill): DirectoryItem {
  return {
    key: itemKey("skill", s.id),
    type: "skill",
    name: s.title || s.name,
    description: s.description || "",
    href: `/skills/${s.id}`,
    iconUrl: null,
    category: s.category || "",
    tags: s.tags ?? [],
    metric: s.downloads > 0 ? { value: compactNumber(s.downloads), label: "installs", icon: "download" } : null,
    score: s.downloads + (s.featured ? 100000 : 0),
    createdAt: s.created_at,
  };
}

export function promptToItem(p: Prompt): DirectoryItem {
  return {
    key: itemKey("prompt", p.id),
    type: "prompt",
    name: p.title,
    description: p.description || "",
    href: `/prompts/${p.id}`,
    iconUrl: null,
    category: p.category || "",
    tags: p.tags ?? [],
    metric: p.upvotes > 0 ? { value: compactNumber(p.upvotes), label: "upvotes", icon: "upvote" } : null,
    score: p.upvotes + (p.verified ? 0.5 : 0),
    createdAt: p.created_at,
  };
}

export function agentToItem(a: Agent): DirectoryItem {
  const stars = a.stars ?? 0;
  return {
    key: itemKey("agent", a.id),
    type: "agent",
    name: a.title || a.name,
    description: a.description || "",
    href: `/agents/${a.id}`,
    iconUrl: null,
    category: a.category || "",
    tags: a.tags ?? [],
    metric: stars > 0 ? { value: compactNumber(stars), label: "GitHub stars", icon: "star" } : null,
    score: stars,
    createdAt: a.created_at,
  };
}

/**
 * Orders a mixed list without comparing incomparable units (tools vs installs
 * vs upvotes): each item is ranked by its percentile within its own type, so
 * the merged list interleaves types in proportion to their catalog size.
 */
export function rankMixed(items: DirectoryItem[]): DirectoryItem[] {
  const typeOrder: Record<DirectoryType, number> = { skill: 0, mcp: 1, agent: 2, prompt: 3 };
  const byType = new Map<DirectoryType, DirectoryItem[]>();
  for (const item of items) {
    const list = byType.get(item.type) ?? [];
    list.push(item);
    byType.set(item.type, list);
  }
  const ranked: { item: DirectoryItem; pct: number }[] = [];
  for (const list of byType.values()) {
    // Stable sort keeps the API's own order for ties (e.g. prompts with 0 upvotes).
    const sorted = [...list].sort((a, b) => b.score - a.score);
    sorted.forEach((item, i) => ranked.push({ item, pct: i / sorted.length }));
  }
  return ranked
    .sort((a, b) => a.pct - b.pct || typeOrder[a.item.type] - typeOrder[b.item.type])
    .map((r) => r.item);
}

export function rankWithinType(items: DirectoryItem[]): DirectoryItem[] {
  return [...items].sort((a, b) => b.score - a.score);
}

/**
 * Orderings for the Trending / Top / New tabs. Rankings from the API win when
 * present; otherwise Top (and Trending, until install events exist) use the
 * per-type order, and New uses created_at.
 */
export function buildOrders(items: DirectoryItem[], ranked: Orders = {}, mixed = true): Record<SortKey, string[]> {
  const present = new Set(items.map((i) => i.key));
  const fallbackTop = (mixed ? rankMixed(items) : rankWithinType(items)).map((i) => i.key);
  const complete = (keys?: string[]) => {
    if (!keys?.length) return null;
    const seen = new Set(keys.filter((k) => present.has(k)));
    // Items the ranking did not mention keep their fallback position at the end.
    return [...seen, ...fallbackTop.filter((k) => !seen.has(k))];
  };
  const byNew = [...items]
    .sort((a, b) => (Date.parse(b.createdAt) || 0) - (Date.parse(a.createdAt) || 0))
    .map((i) => i.key);
  return {
    trending: complete(ranked.trending) ?? fallbackTop,
    top: complete(ranked.top) ?? fallbackTop,
    new: complete(ranked.new) ?? byNew,
  };
}
