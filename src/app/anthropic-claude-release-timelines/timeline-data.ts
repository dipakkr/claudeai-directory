// Curated, source-checked Claude release timeline. Every entry links to the
// official Anthropic or Claude page that announced it. Dates are US Pacific
// publication dates. Keep this file free of "use client" so both server
// components and the OG image can import it.

export const LAST_UPDATED = "2026-10-03";
export const PAGE_PATH = "/anthropic-claude-release-timelines";
export const CORRECTIONS_EMAIL = "claudeai.directory@gmail.com";

export type Kind = "model" | "product" | "milestone";
export type Family = "opus" | "sonnet" | "haiku" | "fable" | "mythos" | "claude" | "instant";
/** Filter groups shown on the page. Mythos rolls up into "fable", Claude 1/2 and Instant into "early". */
export type Group = "opus" | "sonnet" | "haiku" | "fable" | "early" | "products";

export interface TimelineEntry {
  /** Anchor id, e.g. "claude-opus-4". Stable: people link to these. */
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  kind: Kind;
  family?: Family;
  description: string;
  sourceUrl: string;
  sourceLabel: string;
  modelId?: string;
  context?: string;
  /** In Anthropic's current lineup on the models overview page. */
  current?: boolean;
  /** Not generally available (trusted access programs only). */
  restricted?: boolean;
  /** Internal link on this site, e.g. /mcp. */
  related?: { href: string; label: string };
}

const NEWS = "https://www.anthropic.com/news";

export const ENTRIES: TimelineEntry[] = [
  // 2023
  {
    id: "claude-1",
    title: "Claude",
    date: "2023-03-14",
    kind: "model",
    family: "claude",
    description:
      "Anthropic's first public model, offered to businesses through an API and partners like Notion, Quora and DuckDuckGo after months of closed testing.",
    sourceUrl: `${NEWS}/introducing-claude`,
    sourceLabel: "Introducing Claude",
  },
  {
    id: "claude-instant",
    title: "Claude Instant",
    date: "2023-03-14",
    kind: "model",
    family: "instant",
    description: "A lighter, faster and cheaper sibling to Claude, launched the same day. The ancestor of today's Haiku tier.",
    sourceUrl: `${NEWS}/introducing-claude`,
    sourceLabel: "Introducing Claude",
  },
  {
    id: "100k-context",
    title: "100K token context window",
    date: "2023-05-11",
    kind: "product",
    description: "Claude's context window grows from 9K to 100K tokens, enough to read a whole novel or a long technical document in one prompt.",
    sourceUrl: `${NEWS}/100k-context-windows`,
    sourceLabel: "Introducing 100K Context Windows",
    context: "100K",
  },
  {
    id: "claude-2",
    title: "Claude 2",
    date: "2023-07-11",
    kind: "model",
    family: "claude",
    description: "Better coding, math and reasoning, plus longer outputs. Launched alongside claude.ai, the first public chat site for Claude (US and UK).",
    sourceUrl: `${NEWS}/claude-2`,
    sourceLabel: "Claude 2",
    context: "100K",
  },
  {
    id: "claude-instant-1-2",
    title: "Claude Instant 1.2",
    date: "2023-08-09",
    kind: "model",
    family: "instant",
    description: "An update to the fast tier with stronger math, coding and reasoning, built on the strengths of Claude 2.",
    sourceUrl: `${NEWS}/releasing-claude-instant-1-2`,
    sourceLabel: "Releasing Claude Instant 1.2",
    modelId: "claude-instant-1.2",
  },
  {
    id: "claude-2-1",
    title: "Claude 2.1",
    date: "2023-11-21",
    kind: "model",
    family: "claude",
    description: "Doubled the context window to 200K tokens, cut hallucination rates and added tool use in beta.",
    sourceUrl: `${NEWS}/claude-2-1`,
    sourceLabel: "Introducing Claude 2.1",
    modelId: "claude-2.1",
    context: "200K",
  },
  // 2024
  {
    id: "claude-3-opus",
    title: "Claude 3 Opus",
    date: "2024-03-04",
    kind: "model",
    family: "opus",
    description: "The first Opus. Top of the new three-tier Claude 3 family (Haiku, Sonnet, Opus) and the first Claude models with vision.",
    sourceUrl: `${NEWS}/claude-3-family`,
    sourceLabel: "Introducing the next generation of Claude",
    modelId: "claude-3-opus-20240229",
    context: "200K",
  },
  {
    id: "claude-3-sonnet",
    title: "Claude 3 Sonnet",
    date: "2024-03-04",
    kind: "model",
    family: "sonnet",
    description: "The first Sonnet: the balanced middle tier of the Claude 3 family, and the model behind free claude.ai at launch.",
    sourceUrl: `${NEWS}/claude-3-family`,
    sourceLabel: "Introducing the next generation of Claude",
    modelId: "claude-3-sonnet-20240229",
    context: "200K",
  },
  {
    id: "claude-3-haiku",
    title: "Claude 3 Haiku",
    date: "2024-03-13",
    kind: "model",
    family: "haiku",
    description: "The first Haiku: the fastest and cheapest Claude 3 model, announced with the family and shipped nine days later.",
    sourceUrl: `${NEWS}/claude-3-haiku`,
    sourceLabel: "Claude 3 Haiku",
    modelId: "claude-3-haiku-20240307",
    context: "200K",
  },
  {
    id: "claude-3-5-sonnet",
    title: "Claude 3.5 Sonnet",
    date: "2024-06-20",
    kind: "model",
    family: "sonnet",
    description: "A mid-tier model that beat Claude 3 Opus at a fifth of the price. Shipped with Artifacts on claude.ai.",
    sourceUrl: `${NEWS}/claude-3-5-sonnet`,
    sourceLabel: "Claude 3.5 Sonnet",
    modelId: "claude-3-5-sonnet-20240620",
    context: "200K",
  },
  {
    id: "artifacts",
    title: "Artifacts on claude.ai",
    date: "2024-06-20",
    kind: "product",
    description: "A side panel where Claude's code, documents and small apps render live next to the chat.",
    sourceUrl: `${NEWS}/claude-3-5-sonnet`,
    sourceLabel: "Claude 3.5 Sonnet",
  },
  {
    id: "claude-3-5-sonnet-new",
    title: "Claude 3.5 Sonnet (upgraded)",
    date: "2024-10-22",
    kind: "model",
    family: "sonnet",
    description: "A big upgrade under the same name, especially for coding. Often called \"3.5 Sonnet (new)\" or \"3.6\" by the community.",
    sourceUrl: `${NEWS}/3-5-models-and-computer-use`,
    sourceLabel: "Introducing computer use, a new Claude 3.5 Sonnet, and Claude 3.5 Haiku",
    modelId: "claude-3-5-sonnet-20241022",
    context: "200K",
  },
  {
    id: "claude-3-5-haiku",
    title: "Claude 3.5 Haiku",
    date: "2024-10-22",
    kind: "model",
    family: "haiku",
    description: "Announced with the upgraded 3.5 Sonnet. Surpassed Claude 3 Opus on many benchmarks at Haiku speed.",
    sourceUrl: `${NEWS}/3-5-models-and-computer-use`,
    sourceLabel: "Introducing computer use, a new Claude 3.5 Sonnet, and Claude 3.5 Haiku",
    modelId: "claude-3-5-haiku-20241022",
    context: "200K",
  },
  {
    id: "computer-use",
    title: "Computer use (beta)",
    date: "2024-10-22",
    kind: "product",
    description: "Claude can look at a screen, move a cursor, click and type. The first frontier model offered with this in public beta.",
    sourceUrl: `${NEWS}/3-5-models-and-computer-use`,
    sourceLabel: "Introducing computer use",
  },
  {
    id: "model-context-protocol",
    title: "Model Context Protocol (MCP)",
    date: "2024-11-25",
    kind: "product",
    description: "An open standard for connecting AI apps to tools and data. It became the common way to plug services into Claude and other assistants.",
    sourceUrl: `${NEWS}/model-context-protocol`,
    sourceLabel: "Introducing the Model Context Protocol",
    related: { href: "/mcp", label: "Browse MCP servers" },
  },
  // 2025
  {
    id: "claude-3-7-sonnet",
    title: "Claude 3.7 Sonnet",
    date: "2025-02-24",
    kind: "model",
    family: "sonnet",
    description: "The first hybrid reasoning model: one model that can answer quickly or think step by step with visible extended thinking.",
    sourceUrl: `${NEWS}/claude-3-7-sonnet`,
    sourceLabel: "Claude 3.7 Sonnet and Claude Code",
    modelId: "claude-3-7-sonnet-20250219",
    context: "200K",
  },
  {
    id: "claude-code-preview",
    title: "Claude Code (research preview)",
    date: "2025-02-24",
    kind: "product",
    description: "An agentic coding tool that runs in your terminal, released as a limited research preview with Claude 3.7 Sonnet.",
    sourceUrl: `${NEWS}/claude-3-7-sonnet`,
    sourceLabel: "Claude 3.7 Sonnet and Claude Code",
    related: { href: "/agents", label: "Browse Claude Code agents" },
  },
  {
    id: "claude-opus-4",
    title: "Claude Opus 4",
    date: "2025-05-22",
    kind: "model",
    family: "opus",
    description: "Claude 4 drops the version-first naming. Opus 4 was pitched as the best coding model at launch, able to work for hours on long tasks.",
    sourceUrl: `${NEWS}/claude-4`,
    sourceLabel: "Introducing Claude 4",
    modelId: "claude-opus-4-20250514",
    context: "200K",
  },
  {
    id: "claude-sonnet-4",
    title: "Claude Sonnet 4",
    date: "2025-05-22",
    kind: "model",
    family: "sonnet",
    description: "Launched with Opus 4 as a large upgrade over 3.7 Sonnet, and made available to free users.",
    sourceUrl: `${NEWS}/claude-4`,
    sourceLabel: "Introducing Claude 4",
    modelId: "claude-sonnet-4-20250514",
    context: "200K",
  },
  {
    id: "claude-code-ga",
    title: "Claude Code generally available",
    date: "2025-05-22",
    kind: "product",
    description: "Claude Code leaves preview, with VS Code and JetBrains integrations and background tasks via GitHub Actions.",
    sourceUrl: `${NEWS}/claude-4`,
    sourceLabel: "Introducing Claude 4",
  },
  {
    id: "claude-opus-4-1",
    title: "Claude Opus 4.1",
    date: "2025-08-05",
    kind: "model",
    family: "opus",
    description: "An incremental Opus upgrade focused on agentic tasks, real-world coding and reasoning.",
    sourceUrl: `${NEWS}/claude-opus-4-1`,
    sourceLabel: "Claude Opus 4.1",
    modelId: "claude-opus-4-1-20250805",
    context: "200K",
  },
  {
    id: "claude-sonnet-4-5",
    title: "Claude Sonnet 4.5",
    date: "2025-09-29",
    kind: "model",
    family: "sonnet",
    description: "Billed as the best coding model in the world at launch, with big gains on computer use and long agent runs.",
    sourceUrl: `${NEWS}/claude-sonnet-4-5`,
    sourceLabel: "Introducing Claude Sonnet 4.5",
    modelId: "claude-sonnet-4-5-20250929",
    context: "200K",
  },
  {
    id: "claude-code-plugins",
    title: "Claude Code plugins",
    date: "2025-10-09",
    kind: "product",
    description: "Bundles of slash commands, subagents, MCP servers and hooks that install with one command, shared through plugin marketplaces.",
    sourceUrl: "https://claude.com/blog/claude-code-plugins",
    sourceLabel: "Customize Claude Code with plugins",
    related: { href: "/plugins", label: "Browse plugins" },
  },
  {
    id: "claude-haiku-4-5",
    title: "Claude Haiku 4.5",
    date: "2025-10-15",
    kind: "model",
    family: "haiku",
    description: "Sonnet 4 level coding at a third of the cost and more than twice the speed. Still the current Haiku.",
    sourceUrl: `${NEWS}/claude-haiku-4-5`,
    sourceLabel: "Introducing Claude Haiku 4.5",
    modelId: "claude-haiku-4-5-20251001",
    context: "200K",
    current: true,
  },
  {
    id: "agent-skills",
    title: "Agent Skills",
    date: "2025-10-16",
    kind: "product",
    description: "Folders of instructions, scripts and resources that Claude loads only when a task needs them. Works across claude.ai, Claude Code and the API.",
    sourceUrl: "https://claude.com/blog/skills",
    sourceLabel: "Introducing Agent Skills",
    related: { href: "/skills", label: "Browse Skills" },
  },
  {
    id: "claude-opus-4-5",
    title: "Claude Opus 4.5",
    date: "2025-11-24",
    kind: "model",
    family: "opus",
    description: "A new top model for coding, agents and computer use, priced well below earlier Opus models.",
    sourceUrl: `${NEWS}/claude-opus-4-5`,
    sourceLabel: "Introducing Claude Opus 4.5",
    modelId: "claude-opus-4-5-20251101",
    context: "200K",
  },
  {
    id: "mcp-agentic-ai-foundation",
    title: "MCP donated to the Linux Foundation",
    date: "2025-12-09",
    kind: "milestone",
    description: "Anthropic hands MCP to the new Agentic AI Foundation, co-founded with Block and OpenAI, one year after launching it.",
    sourceUrl: `${NEWS}/donating-the-model-context-protocol-and-establishing-of-the-agentic-ai-foundation`,
    sourceLabel: "Donating MCP to the Agentic AI Foundation",
  },
  // 2026
  {
    id: "claude-opus-4-6",
    title: "Claude Opus 4.6",
    date: "2026-02-05",
    kind: "model",
    family: "opus",
    description: "The start of the 4.6 generation, the first with dateless model IDs (no more -2025xxxx suffixes).",
    sourceUrl: `${NEWS}/claude-opus-4-6`,
    sourceLabel: "Introducing Claude Opus 4.6",
    modelId: "claude-opus-4-6",
  },
  {
    id: "claude-sonnet-4-6",
    title: "Claude Sonnet 4.6",
    date: "2026-02-17",
    kind: "model",
    family: "sonnet",
    description: "A Sonnet upgrade at the same $3 / $15 per million token price as Sonnet 4.5.",
    sourceUrl: `${NEWS}/claude-sonnet-4-6`,
    sourceLabel: "Introducing Claude Sonnet 4.6",
    modelId: "claude-sonnet-4-6",
  },
  {
    id: "claude-mythos-preview",
    title: "Claude Mythos Preview",
    date: "2026-04-07",
    kind: "model",
    family: "mythos",
    restricted: true,
    description: "A frontier model a tier above Opus, shared only with partners in Project Glasswing (AWS, Apple, Google, Microsoft and others) to find and fix security flaws in critical software.",
    sourceUrl: "https://www.anthropic.com/glasswing",
    sourceLabel: "Project Glasswing",
  },
  {
    id: "claude-opus-4-7",
    title: "Claude Opus 4.7",
    date: "2026-04-16",
    kind: "model",
    family: "opus",
    description: "A stronger Opus with higher resolution vision and a new tokenizer.",
    sourceUrl: `${NEWS}/claude-opus-4-7`,
    sourceLabel: "Introducing Claude Opus 4.7",
    modelId: "claude-opus-4-7",
  },
  {
    id: "claude-design",
    title: "Claude Design",
    date: "2026-04-17",
    kind: "product",
    description: "An Anthropic Labs product for making designs, prototypes, slides and one-pagers together with Claude.",
    sourceUrl: `${NEWS}/claude-design-anthropic-labs`,
    sourceLabel: "Introducing Claude Design",
  },
  {
    id: "claude-opus-4-8",
    title: "Claude Opus 4.8",
    date: "2026-05-28",
    kind: "model",
    family: "opus",
    description: "Better coding and knowledge work at the same price as 4.7, a more honest collaborator, and Dynamic Workflows in Claude Code.",
    sourceUrl: `${NEWS}/claude-opus-4-8`,
    sourceLabel: "Introducing Claude Opus 4.8",
    modelId: "claude-opus-4-8",
  },
  {
    id: "claude-fable-5",
    title: "Claude Fable 5",
    date: "2026-06-09",
    kind: "model",
    family: "fable",
    description: "A new top tier: a Mythos-class model with safeguards that make it safe for general use. Its abilities topped every model Anthropic had made generally available.",
    sourceUrl: `${NEWS}/claude-fable-5-mythos-5`,
    sourceLabel: "Claude Fable 5 and Claude Mythos 5",
    modelId: "claude-fable-5",
  },
  {
    id: "claude-mythos-5",
    title: "Claude Mythos 5",
    date: "2026-06-09",
    kind: "model",
    family: "mythos",
    restricted: true,
    description: "The same generation as Fable 5 with fewer safeguards, offered only through trusted access programs.",
    sourceUrl: `${NEWS}/claude-fable-5-mythos-5`,
    sourceLabel: "Claude Fable 5 and Claude Mythos 5",
    modelId: "claude-mythos-5",
  },
  {
    id: "fable-5-paused",
    title: "Fable 5 paused under export controls",
    date: "2026-06-12",
    kind: "milestone",
    description: "Three days after launch, US export controls on Fable 5 and Mythos 5 force Anthropic to restrict access.",
    sourceUrl: `${NEWS}/redeploying-fable-5`,
    sourceLabel: "Redeploying Claude Fable 5",
  },
  {
    id: "claude-sonnet-5",
    title: "Claude Sonnet 5",
    date: "2026-06-30",
    kind: "model",
    family: "sonnet",
    description: "\"The most agentic Sonnet model yet\", with near-Opus performance at Sonnet prices.",
    sourceUrl: `${NEWS}/claude-sonnet-5`,
    sourceLabel: "Introducing Claude Sonnet 5",
    modelId: "claude-sonnet-5",
  },
  {
    id: "fable-5-redeployed",
    title: "Fable 5 returns worldwide",
    date: "2026-07-01",
    kind: "milestone",
    description: "With the export controls lifted, Fable 5 is available again globally, with new classifiers that block more cybersecurity tasks.",
    sourceUrl: `${NEWS}/redeploying-fable-5`,
    sourceLabel: "Redeploying Claude Fable 5",
  },
  {
    id: "claude-opus-5",
    title: "Claude Opus 5",
    date: "2026-07-24",
    kind: "model",
    family: "opus",
    description: "Comes close to Fable 5 at half the price.",
    sourceUrl: `${NEWS}/claude-opus-5`,
    sourceLabel: "Introducing Claude Opus 5",
    modelId: "claude-opus-5",
  },
  {
    id: "claude-fable-5-1",
    title: "Claude Fable 5.1",
    date: "2026-09-01",
    kind: "model",
    family: "fable",
    description: "Cheaper to run than Fable 5 and better at coding and knowledge work, with research skills Anthropic calls an early look at AI-driven science.",
    sourceUrl: "https://www.anthropic.com/claude-fable-and-mythos-5-1",
    sourceLabel: "Introducing Claude Fable 5.1 and Claude Mythos 5.1",
    modelId: "claude-fable-5-1",
    context: "1M",
    current: true,
  },
  {
    id: "claude-mythos-5-1",
    title: "Claude Mythos 5.1",
    date: "2026-09-01",
    kind: "model",
    family: "mythos",
    restricted: true,
    description: "The same model as Fable 5.1 with different safeguards, limited to trusted access programs.",
    sourceUrl: "https://www.anthropic.com/claude-fable-and-mythos-5-1",
    sourceLabel: "Introducing Claude Fable 5.1 and Claude Mythos 5.1",
    modelId: "claude-mythos-5-1",
  },
  {
    id: "claude-opus-5-5",
    title: "Claude Opus 5.5",
    date: "2026-09-22",
    kind: "model",
    family: "opus",
    description: "The first Claude 5.5 model. Performs at the level of Fable 5.1 on most work and costs 40% less to run than Opus 5.",
    sourceUrl: "https://www.anthropic.com/claude-opus-5-5",
    sourceLabel: "Introducing Claude Opus 5.5",
    modelId: "claude-opus-5-5",
    context: "1M",
    current: true,
  },
  {
    id: "claude-marketplace",
    title: "Claude Marketplace",
    date: "2026-09-23",
    kind: "product",
    description: "One catalog for 2,000+ connectors and plugins, Claude-powered products, and service partners.",
    sourceUrl: "https://claude.com/blog/claude-marketplace",
    sourceLabel: "Claude Marketplace",
    related: { href: "/plugins", label: "Browse plugins" },
  },
  {
    id: "claude-sonnet-5-5",
    title: "Claude Sonnet 5.5",
    date: "2026-09-28",
    kind: "model",
    family: "sonnet",
    description: "The second Claude 5.5 model. Over 30% faster than Sonnet 5 and up to 30% cheaper per task. The fastest Sonnet yet.",
    sourceUrl: "https://www.anthropic.com/claude-sonnet-5-5",
    sourceLabel: "Introducing Claude Sonnet 5.5",
    modelId: "claude-sonnet-5-5",
    context: "1M",
    current: true,
  },
];

export const FAMILY_LABELS: Record<Family, string> = {
  opus: "Opus",
  sonnet: "Sonnet",
  haiku: "Haiku",
  fable: "Fable",
  mythos: "Mythos",
  claude: "Claude",
  instant: "Instant",
};

export const GROUP_LABELS: Record<Group, string> = {
  opus: "Opus",
  sonnet: "Sonnet",
  haiku: "Haiku",
  fable: "Fable & Mythos",
  early: "Claude 1 & 2",
  products: "Products",
};

export const GROUPS = Object.keys(GROUP_LABELS) as Group[];

export function groupOf(e: TimelineEntry): Group {
  if (e.kind !== "model") return "products";
  switch (e.family) {
    case "opus":
    case "sonnet":
    case "haiku":
      return e.family;
    case "fable":
    case "mythos":
      return "fable";
    default:
      return "early";
  }
}

// Date helpers. Always UTC so server, client and OG image agree.
const DAY = 86_400_000;
export const toTime = (iso: string) => Date.parse(`${iso}T00:00:00Z`);
export const daysBetween = (a: string, b: string) => Math.round((toTime(b) - toTime(a)) / DAY);
export const yearOf = (iso: string) => Number(iso.slice(0, 4));
export function formatDate(iso: string, opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" }) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { ...opts, timeZone: "UTC" });
}

/** Oldest first. */
export const CHRONO = [...ENTRIES].sort((a, b) => toTime(a.date) - toTime(b.date));
/** Generally available model releases: the set every stat is computed from. */
export const PUBLIC_MODELS = CHRONO.filter((e) => e.kind === "model" && !e.restricted);
export const CURRENT_MODELS = PUBLIC_MODELS.filter((e) => e.current).sort((a, b) => {
  const order: Family[] = ["fable", "opus", "sonnet", "haiku"];
  return order.indexOf(a.family!) - order.indexOf(b.family!);
});

interface Gap {
  days: number;
  from: TimelineEntry[];
  to: TimelineEntry[];
}

/** Gap (in days) from each public model release to the previous distinct release date. */
export const GAP_BEFORE: Record<string, number> = {};

function computeStats() {
  const byDate = new Map<string, TimelineEntry[]>();
  for (const m of PUBLIC_MODELS) byDate.set(m.date, [...(byDate.get(m.date) ?? []), m]);
  const dates = [...byDate.keys()];
  const gaps: Gap[] = [];
  for (let i = 1; i < dates.length; i++) {
    const g = { days: daysBetween(dates[i - 1], dates[i]), from: byDate.get(dates[i - 1])!, to: byDate.get(dates[i])! };
    gaps.push(g);
    for (const m of g.to) GAP_BEFORE[m.id] = g.days;
  }
  const fastest = gaps.reduce((a, b) => (b.days < a.days ? b : a));
  const longest = gaps.reduce((a, b) => (b.days > a.days ? b : a));
  const avgGap = Math.round(gaps.reduce((s, g) => s + g.days, 0) / gaps.length);

  const first = PUBLIC_MODELS[0];
  const last = PUBLIC_MODELS[PUBLIC_MODELS.length - 1];
  const years = [...new Set(PUBLIC_MODELS.map((m) => yearOf(m.date)))].sort();
  const perYear = years.map((y) => ({ year: y, count: PUBLIC_MODELS.filter((m) => yearOf(m.date) === y).length }));
  const busiestYear = perYear.reduce((a, b) => (b.count > a.count ? b : a));
  const count = (f: Family) => PUBLIC_MODELS.filter((m) => m.family === f).length;

  // Opus releases in the last 365 days of the dataset.
  const yearAgo = toTime(LAST_UPDATED) - 365 * DAY;
  const opusLastYear = PUBLIC_MODELS.filter((m) => m.family === "opus" && toTime(m.date) > yearAgo).length;

  return {
    models: PUBLIC_MODELS.length,
    restricted: CHRONO.filter((e) => e.kind === "model" && e.restricted).length,
    releaseDays: dates.length,
    spanDays: daysBetween(first.date, last.date),
    first,
    last,
    fastest,
    longest,
    avgGap,
    perYear,
    busiestYear,
    opus: count("opus"),
    sonnet: count("sonnet"),
    haiku: count("haiku") + count("instant"),
    fable: count("fable"),
    opusLastYear,
    products: CHRONO.filter((e) => e.kind !== "model").length,
  };
}

export const STATS = computeStats();

export const names = (list: TimelineEntry[]) => list.map((e) => e.title.replace(/^Claude /, "")).join(" + ");
