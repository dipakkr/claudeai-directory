import type { MetadataRoute } from "next";
import { isIndexable } from "@/lib/feed";
import type { Thread } from "@/types";
import { reviewedAgents } from "@/data/resource-guides";
import { publicLaunches } from "@/lib/home-community";
import type { ShowcaseProject } from "@/types";
import { MIN_INDEXABLE_BODY, ownParts } from "@/lib/plugin-parts";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.claudeai.directory";
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

async function fetchSlugs(endpoint: string, slugField = "id"): Promise<string[]> {
  try {
    const res = await fetch(`${API_BASE}${endpoint}?limit=500`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    // Handle both wrapped { data: [...] } and plain array responses
    const data = Array.isArray(json) ? json : (json.data ?? []);
    return (data as Record<string, unknown>[]).map(
      (item) => String(item[slugField] || item._id || "")
    ).filter(Boolean);
  } catch {
    return [];
  }
}

/** Pages for skills, agents and commands inside plugins, only those with enough of their own text to index. */
async function fetchStandalone(endpoint: string): Promise<{ id: string; name?: string; github_url?: string | null }[]> {
  try {
    const res = await fetch(`${API_BASE}${endpoint}?limit=500`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data = ((await res.json()).data ?? []) as { _id: string; name?: string; github_url?: string | null }[];
    return data.map((d) => ({ id: String(d._id), name: d.name, github_url: d.github_url }));
  } catch {
    return [];
  }
}

async function fetchPluginPartPaths(): Promise<string[]> {
  const kinds = ["skills", "agents", "commands"] as const;
  const [skills, agents] = await Promise.all([fetchStandalone("/skills"), fetchStandalone("/agents")]);
  const standalone = { skills, agents: [...agents, ...reviewedAgents], commands: [] };
  const lists = await Promise.all(
    kinds.map(async (kind) => {
      const paths: string[] = [];
      try {
        // Paged to stay under the fetch data cache's 2 MB per response.
        for (let skip = 0; skip < 5000; skip += 800) {
          const res = await fetch(`${API_BASE}/plugins/parts?kind=${kind}&skip=${skip}&limit=800`, { next: { revalidate: 3600 } });
          if (!res.ok) break;
          const parts = ((await res.json()).data ?? []) as { plugin_id: string; slug: string; name: string; url?: string; canonical?: string | null; body_len?: number }[];
          for (const p of ownParts(parts, standalone[kind])) {
            if ((p.body_len ?? 0) >= MIN_INDEXABLE_BODY) paths.push(`/plugins/${p.plugin_id}/${kind}/${p.slug}`);
          }
          if (parts.length < 800) break;
        }
      } catch {
        // Partial list is fine: the rest is picked up on the next revalidation.
      }
      return paths;
    })
  );
  return lists.flat();
}

/** Feed posts with enough substance to index (see isIndexable). */
async function fetchIndexablePosts(): Promise<string[]> {
  try {
    const res = await fetch(`${API_BASE}/community/threads?limit=500`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    // Raw fetch: the API's _id is not mapped to id here.
    const posts = (await res.json()) as (Thread & { _id?: string })[];
    return posts.filter(isIndexable).map((p) => String(p._id ?? p.id));
  } catch {
    return [];
  }
}

/** Guide lessons live under guide.chapters[].lessons[], not a flat list. */
async function fetchGuideLessonPaths(guideSlugs: string[]): Promise<string[]> {
  const perGuide = await Promise.all(
    guideSlugs.map(async (slug) => {
      try {
        const res = await fetch(`${API_BASE}/guides/${slug}`, {
          next: { revalidate: 3600 },
        });
        if (!res.ok) return [];
        const guide = await res.json();
        const chapters = (guide?.chapters ?? []) as { lessons?: { id?: string }[] }[];
        return chapters.flatMap((chapter) =>
          (chapter.lessons ?? [])
            .map((lesson) => lesson?.id)
            .filter(Boolean)
            .map((lessonId) => `${slug}/${lessonId}`)
        );
      } catch {
        return [];
      }
    })
  );
  return perGuide.flat();
}

async function fetchPublicLaunchSlugs(): Promise<string[]> {
  try {
    const res = await fetch(`${API_BASE}/showcase?limit=500`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const json = await res.json();
    const rows = (Array.isArray(json) ? json : (json.data ?? [])) as (ShowcaseProject & { _id?: string })[];
    return publicLaunches(rows.map((row) => ({ ...row, id: row.id || String(row._id || "") }))).map((p) => p.id).filter(Boolean);
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/mcp`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/skills`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/agents`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/plugins`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/submit`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/prompts`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/jobs`, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/launches`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/members`, changeFrequency: "weekly", priority: 0.5 },
    { url: `${SITE_URL}/stats`, changeFrequency: "daily", priority: 0.4 },
    { url: `${SITE_URL}/cheatsheet`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/anthropic-claude-release-timelines`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/resources`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/guides`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/blog`, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/learn`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/feed`, changeFrequency: "daily", priority: 0.7 },
    { url: `${SITE_URL}/claude-code-commands`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/llm-api-pricing`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/claude-md-generator`, changeFrequency: "monthly", priority: 0.6 },
  ];

  // Dynamic pages
  const [mcpSlugs, skillIds, promptSlugs, jobSlugs, guideSlugs, blogSlugs, threadIds] = await Promise.all([
    fetchSlugs("/mcp-servers", "slug"),
    fetchSlugs("/skills", "_id"),
    fetchSlugs("/prompts", "_id"),
    fetchSlugs("/jobs", "_id"),
    fetchSlugs("/guides", "_id"),
    fetchSlugs("/blog", "_id"),
    fetchIndexablePosts(),
  ]);

  // Resource pages are mirrors whose canonical is the author's original, so they are not listed here.
  // Launches: the same public, de-duplicated set the launches page shows.
  const launchSlugs = await fetchPublicLaunchSlugs();
  const agentSlugs = await fetchSlugs("/agents", "_id");
  const pluginSlugs = await fetchSlugs("/plugins", "_id");
  const pluginPartPaths = await fetchPluginPartPaths();
  const lessonPaths = await fetchGuideLessonPaths(guideSlugs);

  const mcpPages: MetadataRoute.Sitemap = mcpSlugs.map((slug) => ({
    url: `${SITE_URL}/mcp/${slug}`,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const agentPages: MetadataRoute.Sitemap = [...new Set([...agentSlugs, ...reviewedAgents.map(agent => agent.id)])].map((slug) => ({
    url: `${SITE_URL}/agents/${slug}`,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const pluginPages: MetadataRoute.Sitemap = pluginSlugs.map((slug) => ({
    url: `${SITE_URL}/plugins/${slug}`,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const pluginPartPages: MetadataRoute.Sitemap = pluginPartPaths.map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const skillPages: MetadataRoute.Sitemap = skillIds.map((id) => ({
    url: `${SITE_URL}/skills/${id}`,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const promptPages: MetadataRoute.Sitemap = promptSlugs.map((slug) => ({
    url: `${SITE_URL}/prompts/${slug}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const jobPages: MetadataRoute.Sitemap = jobSlugs.map((slug) => ({
    url: `${SITE_URL}/jobs/${slug}`,
    changeFrequency: "daily",
    priority: 0.7,
  }));

  // Guide index URLs redirect to their first lesson; the lessons are listed below.
  const launchPages: MetadataRoute.Sitemap = launchSlugs.map((slug) => ({
    url: `${SITE_URL}/launches/${slug}`,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const blogPages: MetadataRoute.Sitemap = blogSlugs.map((slug) => ({
    url: `${SITE_URL}/blog/${slug}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  // Lesson pages carry the searchable content ("what is claude", "build an
  // mcp server"); without these only the guide index was discoverable.
  const lessonPages: MetadataRoute.Sitemap = lessonPaths.map((path) => ({
    url: `${SITE_URL}/guides/${path}`,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const threadPages: MetadataRoute.Sitemap = threadIds.map((id) => ({
    url: `${SITE_URL}/feed/${id}`,
    changeFrequency: "weekly",
    priority: 0.6,
  }));


  const all: MetadataRoute.Sitemap = [
    ...staticPages,
    ...mcpPages,
    ...skillPages,
    ...agentPages,
    ...pluginPages,
    ...pluginPartPages,
    ...promptPages,
    ...jobPages,
    ...lessonPages,
    ...launchPages,
    ...blogPages,
    ...threadPages,
  ];
  // One entry per URL (duplicate records, e.g. two MCP rows with the same slug, would repeat it).
  const seen = new Set<string>();
  return all.filter((entry) => !seen.has(entry.url) && Boolean(seen.add(entry.url)));
}
