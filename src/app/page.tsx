import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HomeContent from "@/components/home/HomeContent";
import { OrganizationSchema, WebSiteSchema } from "@/components/seo/JsonLd";
import { fetchApi } from "@/lib/api-server";
import type { Stat, Skill, MCPServer, FeedItem, Prompt, Thread, PublicProfile } from "@/types";

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
  const [statsData, featuredSkillsData, mcpServersData, feedData, promptsData, threadsData, membersData] = await Promise.all([
    fetchApi<Stat[]>("/stats"),
    fetchApi<SkillsListResponse>("/skills?featured=true&limit=8"),
    fetchApi<MCPServersListResponse>("/mcp-servers?limit=8"),
    fetchApi<FeedItem[]>("/feed?limit=10"),
    fetchApi<Prompt[]>("/prompts?limit=8"),
    fetchApi<Thread[]>("/community/threads?limit=6"),
    fetchApi<MembersListResponse>("/users?per_page=12"),
  ]);

  const initialStats = statsData ?? [];
  const initialFeaturedSkills = featuredSkillsData?.data ?? [];
  const initialMcpServers = mcpServersData?.data ?? [];
  const initialFeedItems = feedData ?? [];
  const initialPrompts = promptsData ?? [];
  const initialThreads = threadsData ?? [];
  const communityMembers = membersData?.members ?? [];
  const memberCount = membersData?.total ?? 0;

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
        />
      </main>
      <Footer />
    </div>
  );
}
