import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HomeContent from "@/components/home/HomeContent";
import { OrganizationSchema, WebSiteSchema } from "@/components/seo/JsonLd";
import { fetchApi } from "@/lib/api-server";
import { agentToItem, buildOrders, mcpToItem, skillToItem } from "@/lib/directory";
import { loadOrders } from "@/lib/server/rankings";
import type { Agent, MCPServer, Skill } from "@/types";

const TITLE = "Claude Directory: Skills, MCP Servers & Agents";
const DESCRIPTION =
  "Discover community-built Claude Skills, MCP servers and Agents. Explore what is trending, install useful resources and publish what you build.";

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

export default async function Home() {
  const [skillsData, mcpData, agentsData, ranked] = await Promise.all([
    fetchApi<ListResponse<Skill>>("/skills?limit=100"),
    fetchApi<ListResponse<MCPServer>>("/mcp-servers?limit=200"),
    fetchApi<ListResponse<Agent>>("/agents?limit=200"),
    loadOrders(),
  ]);

  const items = [
    ...(skillsData?.data ?? []).map(skillToItem),
    ...(mcpData?.data ?? []).map(mcpToItem),
    ...(agentsData?.data ?? []).map(agentToItem),
  ];

  return (
    <div className="min-h-screen bg-background">
      <OrganizationSchema />
      <WebSiteSchema />
      <Header />
      <main>
        <HomeContent items={items} orders={buildOrders(items, ranked)} />
      </main>
      <Footer />
    </div>
  );
}
