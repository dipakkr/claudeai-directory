import type { BlogPost } from "@/types";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.claudeai.directory";
export const SITE_NAME = "Claude Directory";
export const BLOG_DESCRIPTION =
  "Practical articles on Claude, Claude Code, MCP servers, Skills and Agents. Community posts are reviewed before they are published.";

export interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
}

export interface ArticleLink {
  url: string;
  text: string;
  host: string;
}

export function postUrl(slug: string) {
  return `${SITE_URL}/blog/${slug}`;
}

export function formatDate(date?: string, month: "short" | "long" = "long") {
  const iso = isoDate(date);
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-US", { month, day: "numeric", year: "numeric", timeZone: "UTC" });
}

/** ISO date for machine-readable fields, or undefined when missing. */
export function isoDate(date?: string) {
  if (!date) return undefined;
  const parsed = new Date(date.endsWith("Z") || /[+-]\d\d:\d\d$/.test(date) ? date : `${date}Z`);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
}

/** True when the post was edited on a later day than it was published. */
export function wasUpdated(post: BlogPost) {
  const published = isoDate(post.published_at);
  const updated = isoDate(post.updated_at);
  return Boolean(published && updated && updated.slice(0, 10) > published.slice(0, 10));
}

/** The article body without its leading "# Title" line (the page renders the H1). */
export function articleBody(content: string) {
  const trimmed = content.trimStart();
  if (!trimmed.startsWith("# ")) return trimmed;
  const newline = trimmed.indexOf("\n");
  return newline === -1 ? "" : trimmed.slice(newline).trimStart();
}

function plainInline(markdown: string) {
  return markdown
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[`*_~]/g, "")
    .replace(/<[^>]+>/g, "")
    .trim();
}

export function postSummary(post: BlogPost) {
  const own = post.summary || post.seo_description;
  if (own) return own;
  const firstParagraph = articleBody(post.content)
    .split(/\n{2,}/)
    .find((block) => block.trim() && !/^(#|```|>|\||-|\*|\d+\.)/.test(block.trim()));
  const text = plainInline(firstParagraph ?? "");
  return text.length > 200 ? `${text.slice(0, 197).trimEnd()}...` : text;
}

export function slugifyHeading(text: string) {
  return (
    plainInline(text)
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-") || "section"
  );
}

/** Lines of the body outside fenced code blocks. */
function proseLines(content: string) {
  const lines: string[] = [];
  let fenced = false;
  for (const line of content.split("\n")) {
    if (/^\s*(```|~~~)/.test(line)) {
      fenced = !fenced;
      continue;
    }
    if (!fenced) lines.push(line);
  }
  return lines;
}

/**
 * Every h1-h3 in document order with a unique id. The article renderer assigns
 * the same ids in the same order, so the table of contents always matches.
 */
export function headingIds(content: string) {
  const seen = new Map<string, number>();
  const headings: { id: string; text: string; depth: number }[] = [];
  for (const line of proseLines(content)) {
    const match = /^(#{1,3})\s+(.+?)\s*#*\s*$/.exec(line);
    if (!match) continue;
    const base = slugifyHeading(match[2]);
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    headings.push({ id: count ? `${base}-${count}` : base, text: plainInline(match[2]), depth: match[1].length });
  }
  return headings;
}

export function tableOfContents(content: string): TocItem[] {
  return headingIds(content).map((h) => ({ id: h.id, text: h.text, level: h.depth === 3 ? 3 : 2 }));
}

/** External links cited in the article body, deduplicated, in order. */
export function externalLinks(content: string): ArticleLink[] {
  const siteHost = new URL(SITE_URL).hostname.replace(/^www\./, "");
  const links = new Map<string, ArticleLink>();
  const add = (rawUrl: string, text: string) => {
    let url: URL;
    try {
      url = new URL(rawUrl.replace(/[).,;]+$/, ""));
    } catch {
      return;
    }
    if (!/^https?:$/.test(url.protocol)) return;
    const host = url.hostname.replace(/^www\./, "");
    if (host === siteHost) return;
    const key = url.toString();
    if (!links.has(key)) links.set(key, { url: key, text: plainInline(text) || host, host });
  };
  const prose = proseLines(content).join("\n").replace(/`[^`]*`/g, "");
  for (const match of prose.matchAll(/(?<!!)\[([^\]]+)\]\((https?:\/\/[^)\s]+)(?:\s+"[^"]*")?\)/g)) add(match[2], match[1]);
  for (const match of prose.matchAll(/<(https?:\/\/[^>\s]+)>/g)) add(match[1], "");
  return [...links.values()];
}

export function sourceLinks(post: BlogPost): { label: string; links: ArticleLink[] } {
  if (post.sources && post.sources.length > 0) {
    const links = post.sources.flatMap((raw) => {
      try {
        const url = new URL(raw);
        return [{ url: url.toString(), text: url.hostname.replace(/^www\./, "") + url.pathname.replace(/\/$/, ""), host: url.hostname.replace(/^www\./, "") }];
      } catch {
        return [];
      }
    });
    return { label: "Sources", links };
  }
  return { label: "Links in this article", links: externalLinks(post.content) };
}

export function wordCount(content: string) {
  return (proseLines(content).join(" ").match(/\w+/g) ?? []).length;
}

export function authorHref(post: BlogPost) {
  return post.author_username ? `/u/${post.author_username}` : null;
}

/** Categories in first-seen order. */
export function categoriesOf(posts: BlogPost[]) {
  return [...new Set(posts.map((post) => post.category).filter(Boolean))];
}
