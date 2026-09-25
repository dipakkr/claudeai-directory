import type { Metadata } from "next";
import { Suspense } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HomeContent from "@/components/home/HomeContent";
import HomeLaunches from "@/components/home/HomeLaunches";
import HomeCommunity from "@/components/home/HomeCommunity";
import HomeFeed from "@/components/home/HomeFeed";
import { rankedLaunches, selectedDiscussions } from "@/lib/home-community";
import { reviewedAgents } from "@/data/resource-guides";
import { OrganizationSchema, WebSiteSchema } from "@/components/seo/JsonLd";
import { fetchApi } from "@/lib/api-server";
import { agentToItem, buildOrders, mcpToItem, skillToItem } from "@/lib/directory";
import { loadOrders } from "@/lib/server/rankings";
import type { Agent, MCPServer, PublicProfile, Skill, ShowcaseProject, Thread, Reply } from "@/types";

const TITLE = "Claude AI Directory: MCP Servers, Skills & Agents";
const DESCRIPTION =
  "Find Claude MCP servers, Claude Code skills, agents and prompts. Browse install commands, setup guides and community resources for building with Claude.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/" },
  twitter: { title: TITLE, description: DESCRIPTION },
};

interface ListResponse<T> {
  data: T[];
  isCache: boolean;
}

interface MembersResponse {
  members: PublicProfile[];
  total: number;
}

async function CommunityPreview({ threads, unavailable }: { threads: Thread[]; unavailable: boolean }) {
  const replyEntries = await Promise.all(threads.filter(thread => thread.replies > 0).slice(0, 3).map(async thread => {
    const replies = await fetchApi<Reply[]>(`/community/threads/${encodeURIComponent(thread.id)}/replies?limit=1`);
    return [thread.id, replies?.[0]] as const;
  }));
  const replies: Record<string, Reply> = {};
  for (const [id, reply] of replyEntries) if (reply) replies[id] = reply;
  return <HomeCommunity threads={threads} replies={replies} unavailable={unavailable} />;
}

export default async function Home() {
  const [skillsData, mcpData, agentsData, ranked, launchesData, threadsData, membersData] = await Promise.all([
    fetchApi<ListResponse<Skill>>("/skills?limit=100"),
    fetchApi<ListResponse<MCPServer>>("/mcp-servers?limit=200"),
    fetchApi<ListResponse<Agent>>("/agents?limit=200"),
    loadOrders(),
    fetchApi<ShowcaseProject[]>("/showcase?limit=100"),
    fetchApi<Thread[]>("/community/threads?limit=30"),
    fetchApi<MembersResponse>("/users?per_page=8"),
  ]);

  const threads = selectedDiscussions(threadsData ?? []);

  const items = [
    // Legacy download counters do not establish successful installations.
    ...(skillsData?.data ?? []).map(skill => ({ ...skillToItem(skill), metric: null })),
    ...(mcpData?.data ?? []).map(mcpToItem),
    ...[...(agentsData?.data ?? []), ...reviewedAgents.filter(reviewed => !agentsData?.data.some(agent => agent.id === reviewed.id))].map(agentToItem),
  ];

  return (
    <div className="min-h-screen bg-background">
      <OrganizationSchema />
      <WebSiteSchema />
      <Header />
      <main>
        <HomeContent items={items} orders={buildOrders(items, ranked)}
          members={membersData?.members ?? []}
          memberCount={membersData?.total ?? 0}
          feed={<Suspense fallback={null}><HomeFeed /></Suspense>}
          launches={<HomeLaunches projects={rankedLaunches(launchesData ?? [])} unavailable={launchesData === null} />}
          community={<Suspense fallback={<HomeCommunity threads={threads} replies={{}} unavailable={threadsData === null} />}>
            <CommunityPreview threads={threads} unavailable={threadsData === null} />
          </Suspense>}
        />
      </main>
      <Footer />
    </div>
  );
}
