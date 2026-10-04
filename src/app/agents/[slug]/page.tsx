import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { BreadcrumbSchema, SoftwareApplicationSchema } from "@/components/seo/JsonLd";
import { fetchApi } from "@/lib/api-server";
import { resolvePluginInstall } from "@/lib/install";
import { agentSource } from "@/lib/resource-source";
import { loadRegistryIndex } from "@/lib/server/registry";
import { resourceTitle, DEFAULT_OG_IMAGE } from "@/lib/seo";
import type { Agent } from "@/types";
import AgentDetail from "./AgentDetail";
import PartPage, { partMetadata } from "@/components/directory/PartPage";
import { loadPluginPart } from "@/lib/server/plugin-parts";
import { resourceGuides, reviewedAgents } from "@/data/resource-guides";

const SITE_URL = "https://www.claudeai.directory";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const agent = (await fetchApi<Agent>(`/agents/${slug}`)) ?? reviewedAgents.find(agent => agent.id === slug);
  if (!agent) {
    // Agents that ship inside a plugin live at the same short URL.
    const fromPlugin = await loadPluginPart("agents", slug);
    return fromPlugin ? partMetadata(fromPlugin.part, fromPlugin.plugin, "agents") : { title: "Agent Not Found" };
  }
  const guide = resourceGuides[`agent/${slug}`];
  const title = guide?.title || resourceTitle(agent.title || agent.name, agent.description);
  const description = guide?.metaDescription || agent.description?.slice(0, 160) || `${agent.title || agent.name} agent for Claude Code`;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: `${SITE_URL}/agents/${slug}` },
    openGraph: { images: [DEFAULT_OG_IMAGE], title, description, url: `${SITE_URL}/agents/${slug}`, type: "website" },
    twitter: { images: [DEFAULT_OG_IMAGE.url], card: "summary_large_image", title, description },
  };
}

export default async function AgentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [record, registry, plugin] = await Promise.all([
    fetchApi<Agent>(`/agents/${slug}`),
    loadRegistryIndex(),
    fetchApi<{ id: string }>(`/plugins/${slug}`),
  ]);
  const agent = record ?? reviewedAgents.find(agent => agent.id === slug);
  if (!agent) {
    const fromPlugin = await loadPluginPart("agents", slug);
    if (!fromPlugin) notFound();
    return <PartPage part={fromPlugin.part} plugin={fromPlugin.plugin} kind="agents" />;
  }

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
        <AgentDetail agent={agent} resolution={resolution} pluginHref={plugin ? `/plugins/${plugin.id}` : null} />
      </main>
      <Footer />
    </div>
  );
}
