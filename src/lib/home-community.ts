import { hasDofollow } from "@/lib/launch-options";
import type { ShowcaseProject, Thread } from "@/types";

// Only member submissions are launch proof; legacy seeded demos are not.
export function publicLaunches(projects: ShowcaseProject[]): ShowcaseProject[] {
  const seen = new Set<string>();
  const seenBuilders = new Set<string>();
  return [...projects].sort((a, b) => Date.parse(b.listed_at || b.created_at) - Date.parse(a.listed_at || a.created_at)).filter(project => {
    if (project.status !== "listed" || !project.author_id) return false;
    try {
      const url = new URL(project.app_url || project.demo_url || "");
      if (!['https:', 'http:'].includes(url.protocol) || /(^|\.)example\.(com|org|net)$/.test(url.hostname)) return false;
      const key = `${url.hostname.replace(/^www\./, "")}${url.pathname.replace(/\/+$/, "")}`;
      const builderKey = `${project.author_id}:${project.title.trim().toLowerCase()}`;
      if (seen.has(key) || seenBuilders.has(builderKey)) return false;
      seen.add(key);
      seenBuilders.add(builderKey);
      return true;
    } catch { return false; }
  });
}

/**
 * Launch ranking everywhere: paid launches still in their featured week first (marked `promoted`),
 * then most upvotes; ties keep publicLaunches' newest-first order.
 */
export function rankedLaunches(projects: ShowcaseProject[], now = Date.now()): ShowcaseProject[] {
  const promoted = (p: ShowcaseProject) => Boolean(p.featured_until && Date.parse(p.featured_until) > now);
  return publicLaunches(projects)
    .map((p) => ({ ...p, promoted: promoted(p) }))
    // Promoted first, then launches with our badge (dofollow), then the rest; upvotes within each group.
    .sort(
      (a, b) =>
        Number(b.promoted) - Number(a.promoted) ||
        Number(hasDofollow(b)) - Number(hasDofollow(a)) ||
        (b.upvotes ?? 0) - (a.upvotes ?? 0),
    );
}

/** Launches that are MCP servers: categorised as one, or named "... MCP". */
export const isMcpLaunch = (p: ShowcaseProject) => /\bmcp\b/i.test(p.category ?? "") || /\bmcp\b/i.test(p.title);

export function selectedDiscussions(threads: Thread[]): Thread[] {
  return threads.filter(thread => thread.author_username && thread.body.trim().length >= 40 && /\b(claude|mcp|anthropic)\b/i.test(`${thread.title ?? ""} ${thread.body} ${thread.tags.join(" ")}`))
    .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at)).slice(0, 8);
}
