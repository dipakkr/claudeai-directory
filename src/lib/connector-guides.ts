/**
 * "How to connect <App> to Claude" guides at /connectors/{slug}.
 *
 * Every fact carries a source and the date it was checked. A guide only goes
 * live when `publishGaps` comes back empty: an unverified guide stays a draft
 * rather than shipping generic text.
 */

export type Surface = "desktop" | "claude_ai" | "claude_code";

export type MethodKind = "official_connector" | "official_mcp" | "third_party_mcp" | "plugin" | "no_mcp";

export interface Source {
  url: string;
  /** YYYY-MM-DD */
  verifiedOn: string;
}

export interface Method {
  kind: MethodKind;
  name: string;
  maintainer: string;
  isOfficial: boolean;
  url: string;
  worksIn: Surface[];
  auth: "oauth" | "api_key" | "local" | "none";
  /** What needs to be running or installed besides Claude. */
  needs?: string;
  /** YYYY-MM-DD of the last commit or release, when there is a repo. */
  lastActivity?: string;
  status: "active" | "unmaintained" | "deprecated" | "unverified";
  /** Slug of this server's /mcp listing, when it has one. */
  mcpSlug?: string;
  note?: string;
  source: Source;
}

export interface Step {
  /** Plain text; `backticks` render as inline code. */
  text: string;
  code?: { value: string; label?: string; copyable?: boolean };
}

export interface SetupBlock {
  /** Index into `methods`. */
  method: number;
  title: string;
  surface: string;
  steps: Step[];
  source: Source;
}

export interface ExamplePrompt {
  prompt: string;
  outcome: string;
  /** Run for real, or backed by a tool the server documents. */
  basis: "tested" | "documented";
}

export interface ConnectorGuide {
  slug: string;
  app: string;
  category: "notes" | "messaging" | "commerce" | "cms" | "smart-home" | "design" | "video" | "music" | "dev";
  /** Title-tag phrase after "Connect <App> to Claude". Set only to override the default. */
  h1?: string;
  title?: string;
  description: string;
  /** 2-3 sentences: the shortest working route and where it works. */
  quickAnswer: string;
  methods: Method[];
  setup: SetupBlock[];
  permissions: { heading: string; body: string }[];
  prompts: ExamplePrompt[];
  troubleshooting: { problem: string; fix: string; sourceUrl: string }[];
  faq: { q: string; a: string }[];
  related: string[];
  /** YYYY-MM-DD the guide as a whole was last checked. */
  verifiedOn: string;
  status: "draft" | "published";
}

/** Why a guide can't go live yet. Empty means it can. */
export function publishGaps(g: ConnectorGuide): string[] {
  const gaps: string[] = [];
  if (!g.methods.some((m) => m.source.url && m.source.verifiedOn)) gaps.push("No method with a verified source");
  if (g.setup.length === 0) gaps.push("No setup steps");
  if (g.prompts.length < 3) gaps.push(`Only ${g.prompts.length} example prompts (need 3)`);
  if (g.prompts.filter((p) => p.basis === "tested").length < 3) gaps.push("Fewer than 3 example prompts actually tested");
  const recommended = g.setup[0] ? g.methods[g.setup[0].method] : undefined;
  if (recommended?.status === "unverified") gaps.push("Recommended method is unverified");
  if (g.faq.length < 4) gaps.push("Fewer than 4 FAQ entries");
  return gaps;
}

export const isLive = (g: ConnectorGuide) => g.status === "published" && publishGaps(g).length === 0;

export const SURFACE_LABEL: Record<Surface, string> = {
  desktop: "Claude Desktop",
  claude_ai: "Claude.ai",
  claude_code: "Claude Code",
};

export const KIND_LABEL: Record<MethodKind, string> = {
  official_connector: "Official connector",
  official_mcp: "Official MCP server",
  third_party_mcp: "Community MCP server",
  plugin: "Plugin",
  no_mcp: "No MCP needed",
};

export const AUTH_LABEL: Record<Method["auth"], string> = {
  oauth: "OAuth sign-in",
  api_key: "API key",
  local: "Local only",
  none: "None",
};

export const guideH1 = (g: ConnectorGuide) => g.h1 ?? `How to connect ${g.app} to Claude`;
export const guideTitle = (g: ConnectorGuide) =>
  g.title ?? `Connect ${g.app} to Claude (${g.verifiedOn.slice(0, 4)} Guide)`;
