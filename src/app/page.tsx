import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HomeContent from "@/components/home/HomeContent";
import { OrganizationSchema, WebSiteSchema } from "@/components/seo/JsonLd";
import { fetchApi } from "@/lib/api-server";
import type { Stat, Skill, MCPServer, FeedItem } from "@/types";

interface SkillsListResponse {
  data: Skill[];
  isCache: boolean;
}

interface MCPServersListResponse {
  data: MCPServer[];
  isCache: boolean;
}

export default async function Home() {
  const [statsData, featuredSkillsData, mcpServersData, feedData] = await Promise.all([
    fetchApi<Stat[]>("/stats"),
    fetchApi<SkillsListResponse>("/skills?featured=true&limit=8"),
    fetchApi<MCPServersListResponse>("/mcp-servers?limit=8"),
    fetchApi<FeedItem[]>("/feed?limit=10"),
  ]);

  const initialStats = statsData ?? [];
  const initialFeaturedSkills = featuredSkillsData?.data ?? [];
  const initialMcpServers = mcpServersData?.data ?? [];
  const initialFeedItems = feedData ?? [];

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
        />
      </main>
      <Footer />
    </div>
  );
}
