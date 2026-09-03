import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HomeContent from "@/components/home/HomeContent";
import { OrganizationSchema, WebSiteSchema } from "@/components/seo/JsonLd";
import { fetchApi } from "@/lib/api-server";
import type { Stat, Skill, MCPServer, FeedItem, Prompt, Thread, PublicProfile, ShowcaseProject } from "@/types";
import type { UseCaseBundle } from "@/components/home/UseCaseCarousel";

// "Claude for X" carousel bundles, mapped to real index categories. Only
// categories with enough live servers become cards (see filter below).
const USE_CASE_DEFS: { key: string; category: string; label: string; tagline: string }[] = [
  { key: "sales", category: "business", label: "Claude for Sales", tagline: "CRM, outreach & pipeline" },
  { key: "marketing", category: "marketing", label: "Claude for Marketing", tagline: "Campaigns, content & analytics" },
  { key: "finance", category: "finance", label: "Claude for Finance", tagline: "Payments, accounting & markets" },
  { key: "developers", category: "development", label: "Claude for Developers", tagline: "Code, CI & infrastructure" },
  { key: "productivity", category: "productivity", label: "Claude for Productivity", tagline: "Docs, tasks & scheduling" },
  { key: "data", category: "data", label: "Claude for Data", tagline: "Databases, ETL & analytics" },
  { key: "healthcare", category: "healthcare", label: "Claude for Healthcare", tagline: "Clinical & health data tools" },
  { key: "design", category: "design", label: "Claude for Design", tagline: "Design, assets & creative" },
  { key: "research", category: "research", label: "Claude for Research", tagline: "Web, search & knowledge" },
];

function buildUseCaseBundles(servers: MCPServer[]): UseCaseBundle[] {
  return USE_CASE_DEFS.map((def) => {
    const matched = servers.filter(
      (s) => (s.category || "").toLowerCase() === def.category,
    );
    return {
      key: def.key,
      label: def.label,
      tagline: def.tagline,
      href: `/mcp?category=${def.category}`,
      count: matched.length,
      servers: matched.slice(0, 6).map((s) => ({
        name: s.name,
        slug: s.slug,
        icon: s.branding?.icon_url ?? null,
      })),
    };
  }).filter((b) => b.servers.length >= 3);
}

interface SkillsListResponse {
  data: Skill[];
  isCache: boolean;
}

interface MCPServersListResponse {
  data: MCPServer[];
  isCache: boolean;
}

interface MembersListResponse {
  members: PublicProfile[];
  total: number;
}

export default async function Home() {
  const [statsData, featuredSkillsData, mcpServersData, mcpAllData, feedData, promptsData, threadsData, membersData, showcaseData] = await Promise.all([
    fetchApi<Stat[]>("/stats"),
    fetchApi<SkillsListResponse>("/skills?featured=true&limit=8"),
    fetchApi<MCPServersListResponse>("/mcp-servers?limit=8"),
    fetchApi<MCPServersListResponse>("/mcp-servers?limit=200"),
    fetchApi<FeedItem[]>("/feed?limit=10"),
    fetchApi<Prompt[]>("/prompts?limit=8"),
    fetchApi<Thread[]>("/community/threads?limit=6"),
    fetchApi<MembersListResponse>("/users?per_page=12"),
    fetchApi<ShowcaseProject[]>("/showcase?limit=6"),
  ]);

  const initialStats = statsData ?? [];
  const initialFeaturedSkills = featuredSkillsData?.data ?? [];
  const initialMcpServers = mcpServersData?.data ?? [];
  const useCaseBundles = buildUseCaseBundles(mcpAllData?.data ?? []);
  const initialFeedItems = feedData ?? [];
  const initialPrompts = promptsData ?? [];
  const initialThreads = threadsData ?? [];
  const communityMembers = membersData?.members ?? [];
  const memberCount = membersData?.total ?? 0;
  const initialShowcase = Array.isArray(showcaseData) ? showcaseData : [];

  return (
    <div className="min-h-screen bg-background">
      <OrganizationSchema />
      <WebSiteSchema />
      <Header />
      <main>
        <HomeContent
          initialStats={initialStats}
          initialFeaturedSkills={initialFeaturedSkills}
          initialMcpServers={initialMcpServers}
          initialFeedItems={initialFeedItems}
          initialPrompts={initialPrompts}
          initialThreads={initialThreads}
          communityMembers={communityMembers}
          memberCount={memberCount}
          useCaseBundles={useCaseBundles}
          initialShowcase={initialShowcase}
        />
      </main>
      <Footer />
    </div>
  );
}
