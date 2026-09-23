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

export function selectedDiscussions(threads: Thread[]): Thread[] {
  return threads.filter(thread => thread.author_username && thread.body.trim().length >= 40 && /\b(claude|mcp|anthropic)\b/i.test(`${thread.title} ${thread.tags.join(" ")}`))
    .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at)).slice(0, 8);
}
