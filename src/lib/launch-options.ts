/** Choices shared by the launch submit and edit forms. */
export const CATEGORIES = ["Web app", "MCP server", "Skill", "Agent", "Claude Code plugin", "Workflow"];
/** What a launch is for (CATEGORIES above is what kind of thing it is). Mirrors the backend list. */
export const TOPICS = [
  "Developer tools",
  "Productivity",
  "Marketing & SEO",
  "Sales & CRM",
  "Design",
  "Data & analytics",
  "Writing & content",
  "Research",
  "Finance",
  "Education",
  "Security",
  "DevOps & infra",
  "Customer support",
  "Other",
];

/** A launch can have up to this many topics. */
export const MAX_TOPICS = 3;

/** "Marketing & SEO" -> "marketing-seo", for ?topic= links. */
export const topicSlug = (topic: string) => topic.toLowerCase().replace(/&/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export const PLATFORMS = ["Web", "macOS", "Windows", "Linux", "iOS", "Android", "CLI", "Chrome extension", "API"];
