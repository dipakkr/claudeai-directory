import type { MetadataRoute } from "next";

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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/mcp`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/skills`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/agents`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/submit`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/prompts`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/jobs`, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/showcase`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/resources`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/guides`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/blog`, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/learn`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/community`, changeFrequency: "daily", priority: 0.6 },
    { url: `${SITE_URL}/feed`, changeFrequency: "daily", priority: 0.6 },
    { url: `${SITE_URL}/llm-api-pricing`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/llm-api-pricing/cost-calculator`, changeFrequency: "weekly", priority: 0.6 },
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

  const resourceSlugs = await fetchSlugs("/resources", "_id");
  const agentSlugs = await fetchSlugs("/agents", "_id");
  const lessonPaths = await fetchGuideLessonPaths(guideSlugs);

  const mcpPages: MetadataRoute.Sitemap = mcpSlugs.map((slug) => ({
    url: `${SITE_URL}/mcp/${slug}`,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const agentPages: MetadataRoute.Sitemap = agentSlugs.map((slug) => ({
    url: `${SITE_URL}/agents/${slug}`,
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

  const guidePages: MetadataRoute.Sitemap = guideSlugs.map((slug) => ({
    url: `${SITE_URL}/guides/${slug}`,
    changeFrequency: "weekly",
    priority: 0.7,
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

  const resourcePages: MetadataRoute.Sitemap = resourceSlugs.map((slug) => ({
    url: `${SITE_URL}/resources/${slug}`,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const threadPages: MetadataRoute.Sitemap = threadIds.map((id) => ({
    url: `${SITE_URL}/community/${id}`,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [
    ...staticPages,
    ...mcpPages,
    ...skillPages,
    ...agentPages,
    ...promptPages,
    ...jobPages,
    ...guidePages,
    ...lessonPages,
    ...resourcePages,
    ...blogPages,
    ...threadPages,
  ];
}
