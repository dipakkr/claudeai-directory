import type { Metadata } from "next";
import ListingPage from "@/components/directory/ListingPage";
import { CollectionPageSchema } from "@/components/seo/JsonLd";
import { fetchApi } from "@/lib/api-server";
import { agentToItem, buildOrders } from "@/lib/directory";
import { loadOrders } from "@/lib/server/rankings";
import { listingRobots } from "@/lib/seo";
import type { Agent } from "@/types";
import { reviewedAgents } from "@/data/resource-guides";

type ListingParams = Promise<{ category?: string; search?: string }>;

export async function generateMetadata({ searchParams }: { searchParams: ListingParams }): Promise<Metadata> {
  return { robots: listingRobots(await searchParams) };
}

export default async function AgentsPage({ searchParams }: { searchParams: ListingParams }) {
  const params = await searchParams;
  const [response, ranked] = await Promise.all([
    fetchApi<{ data: Agent[] }>("/agents?limit=200"),
    loadOrders("agent"),
  ]);
  const agents = response?.data ?? [];
  const items = [...agents, ...reviewedAgents.filter(reviewed => !agents.some(agent => agent.id === reviewed.id))].map(agentToItem);

  return (
    <ListingPage
      title="Claude Agents"
      description="Specialized subagents for Claude Code: code review, testing, debugging, security, research and more."
      items={items}
      orders={buildOrders(items, ranked, false)}
      searchPlaceholder="Search agents..."
      initialCategory={params.category}
      initialQuery={params.search}
      emptyMessage="Agents are being reviewed. Check back soon."
      schema={
        <CollectionPageSchema
          name="Claude Agents"
          description="Community-built Claude Code agents for coding, testing, debugging and research."
          url="https://www.claudeai.directory/agents"
        />
      }
    >
      <h2>What are Claude Agents?</h2>
      <p>
        <strong>Agents</strong> (subagents) are specialized assistants that Claude Code can hand work to. Each one is a
        Markdown file with a name, a description of when to use it, the tools it may use and its own instructions, so a
        reviewer or a test writer can work with a focused context.
      </p>
      <h3>How installing works</h3>
      <p>
        Agents listed here are installed through a Claude Code plugin marketplace. Add the marketplace once, then install
        any agent with a single <code className="font-mono text-foreground">/plugin install</code> command. Every entry
        points at the creator&apos;s own repository.
      </p>
    </ListingPage>
  );
}
