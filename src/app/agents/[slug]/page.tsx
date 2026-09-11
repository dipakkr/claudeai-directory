import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { BreadcrumbSchema, SoftwareApplicationSchema } from "@/components/seo/JsonLd";
import { fetchApi } from "@/lib/api-server";
import { resolvePluginInstall } from "@/lib/install";
import { agentSource } from "@/lib/resource-source";
import { loadRegistryIndex } from "@/lib/server/registry";
import { resourceTitle } from "@/lib/seo";
import type { Agent } from "@/types";
import AgentDetail from "./AgentDetail";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.claudeai.directory";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const agent = await fetchApi<Agent>(`/agents/${slug}`);
  if (!agent) return { title: "Agent Not Found" };
  const title = resourceTitle(agent.title || agent.name, agent.description);
  const description = agent.description?.slice(0, 160) || `${agent.title || agent.name} agent for Claude Code`;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: `/agents/${slug}` },
    openGraph: { title, description, url: `/agents/${slug}`, type: "website" },
    twitter: { card: "summary", title, description },
  };
}

export default async function AgentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [agent, registry] = await Promise.all([fetchApi<Agent>(`/agents/${slug}`), loadRegistryIndex()]);
  if (!agent) notFound();

  const source = agentSource(agent);
  const resolution = resolvePluginInstall({
    match: source ? registry.get(source.repo, source.path) : null,
    sourceUrl: source?.url ?? agent.github_url,
  });

  return (
    <div className="min-h-screen bg-background">
      <SoftwareApplicationSchema
        name={agent.title || agent.name}
        description={agent.description}
        url={`${SITE_URL}/agents/${slug}`}
        author={agent.author?.name}
        category="DeveloperApplication"
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: SITE_URL },
          { name: "Agents", url: `${SITE_URL}/agents` },
          { name: agent.title || agent.name, url: `${SITE_URL}/agents/${slug}` },
        ]}
      />
      <Header />
      <main>
        <AgentDetail agent={agent} resolution={resolution} />
      </main>
      <Footer />
    </div>
  );
}
