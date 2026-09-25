import type { MetadataRoute } from "next";
import { COURSES } from "@/data/courses";
import { getCourseContent } from "@/data/course-content";
import { reviewedAgents } from "@/data/resource-guides";
import { publicLaunches } from "@/lib/home-community";
import type { ShowcaseProject } from "@/types";

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
    { url: `${SITE_URL}/courses`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/launches`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/members`, changeFrequency: "weekly", priority: 0.5 },
    { url: `${SITE_URL}/cheatsheet`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/anthropic-claude-release-timelines`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/resources`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/guides`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/blog`, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/learn`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/community`, changeFrequency: "daily", priority: 0.6 },
    { url: `${SITE_URL}/feed`, changeFrequency: "daily", priority: 0.6 },
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
    fetchSlugs("/community/threads", "id"),
  ]);

  // Resource pages are mirrors whose canonical is the author's original, so they are not listed here.
  // Launches: the same public, de-duplicated set the launches page shows.
  const launchSlugs = await fetchPublicLaunchSlugs();
  const agentSlugs = await fetchSlugs("/agents", "_id");
  const pluginSlugs = await fetchSlugs("/plugins", "_id");
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
    url: `${SITE_URL}/community/${id}`,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const coursePages: MetadataRoute.Sitemap = COURSES.flatMap((course) => [
    {
      url: `${SITE_URL}/courses/${course.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    },
  ]);

  // One page per lesson. Locked lessons are noindex, so only open ones are listed.
  const courseLessonPages: MetadataRoute.Sitemap = COURSES.flatMap((course) => {
    const content = getCourseContent(course.slug);
    return (content?.modules ?? [])
      .filter((module) => module.free)
      .flatMap((module) =>
        module.lessons.map((lesson) => ({
          url: `${SITE_URL}/courses/${course.slug}/learn/${module.id}/${lesson.id}`,
          changeFrequency: "weekly" as const,
          priority: course.isFree ? 0.7 : 0.55,
        }))
      );
  });

  const all: MetadataRoute.Sitemap = [
    ...staticPages,
    ...mcpPages,
    ...skillPages,
    ...agentPages,
    ...pluginPages,
    ...promptPages,
    ...jobPages,
    ...lessonPages,
    ...launchPages,
    ...blogPages,
    ...threadPages,
    ...coursePages,
    ...courseLessonPages,
  ];
  // One entry per URL (duplicate records, e.g. two MCP rows with the same slug, would repeat it).
  const seen = new Set<string>();
  return all.filter((entry) => !seen.has(entry.url) && Boolean(seen.add(entry.url)));
}
