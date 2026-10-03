import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { BreadcrumbSchema, SoftwareApplicationSchema } from "@/components/seo/JsonLd";
import { fetchApi } from "@/lib/api-server";
import { agentToItem, mcpToItem, pluginToItem, skillToItem, type DirectoryItem } from "@/lib/directory";
import { resolvePluginInstall, type InstallResolution } from "@/lib/install";
import { resourceTitle } from "@/lib/seo";
import type { Agent, MCPServer, Plugin, Skill } from "@/types";
import PluginDetail from "./PluginDetail";

const SITE_URL = "https://www.claudeai.directory";
/** Marketplaces Claude Code ships with, so users never need to add them. */
const PREINSTALLED = new Set(["claude-plugins-official"]);
/** Marketplaces whose own README says their plugins work in Claude Code. */
const CLAUDE_CODE_OK = new Set(["claude-plugins-official", "knowledge-work-plugins"]);

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const plugin = await fetchApi<Plugin>(`/plugins/${slug}`);
  if (!plugin) return { title: "Plugin Not Found" };
  const name = plugin.title || plugin.name;
  const title = resourceTitle(`${name} Plugin`, plugin.description);
  const description = (plugin.description || `${name} plugin for Claude Code`).slice(0, 160);
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: `${SITE_URL}/plugins/${slug}` },
    openGraph: { title, description, url: `${SITE_URL}/plugins/${slug}`, type: "website" },
    twitter: { card: "summary", title, description },
  };
}

export default async function PluginPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const plugin = await fetchApi<Plugin>(`/plugins/${slug}`);
  if (!plugin) notFound();

  // The product's wider footprint in the directory: MCP servers, skills and agents named after it.
  const brand = (plugin.title || plugin.name).trim();
  const q = encodeURIComponent(brand);
  const [related, mcp, mcps, skills, agents] = await Promise.all([
    fetchApi<{ data: Plugin[] }>(`/plugins?category=${encodeURIComponent(plugin.category)}&limit=7`),
    fetchApi<MCPServer>(`/mcp-servers/${slug}`),
    fetchApi<{ data: MCPServer[] }>(`/mcp-servers?search=${q}&limit=6`),
    fetchApi<{ data: Skill[] }>(`/skills?search=${q}&limit=6`),
    fetchApi<{ data: Agent[] }>(`/agents?search=${q}&limit=6`),
  ]);
  const named = new RegExp(`\\b${brand.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
  const ecosystem: DirectoryItem[] = [
    ...(mcps?.data ?? []).filter((s) => named.test(s.name)).map(mcpToItem),
    ...(skills?.data ?? []).filter((s) => named.test(s.name)).map(skillToItem),
    ...(agents?.data ?? []).filter((a) => named.test(a.name)).map(agentToItem),
  ].slice(0, 8);

  const m = plugin.marketplace;
  // Cowork-only on Claude Marketplace and no Claude Code support stated: link to Cowork, no CLI command.
  const coworkOnly = !plugin.works_in?.claude_code && !CLAUDE_CODE_OK.has(m.name);
  const resolution: InstallResolution = coworkOnly
    ? {
        method: "manual",
        verified: false,
        title: "Install in Claude (Cowork)",
        reason: "This plugin is published for Claude Cowork. Its publisher doesn't list Claude Code support.",
        setupUrl: plugin.works_in?.cowork_url || plugin.official?.url,
        setupLabel: "Open in Claude",
        sourceUrl: plugin.github_url || undefined,
      }
    : resolvePluginInstall({
    match: {
      marketplaceName: m.name,
      marketplaceSource: m.source,
      pluginName: m.plugin_name,
      bundledWith: [],
      ours: false,
      preinstalled: PREINSTALLED.has(m.name),
      publisher: m.source.startsWith("anthropics/") ? "Anthropic" : undefined,
    },
    setupUrl: plugin.official?.url,
    sourceUrl: plugin.github_url,
  });
  const name = plugin.title || plugin.name;

  return (
    <div className="min-h-screen bg-background">
      <SoftwareApplicationSchema
        name={name}
        description={plugin.description}
        url={`${SITE_URL}/plugins/${slug}`}
        author={plugin.author?.name}
        category="DeveloperApplication"
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: SITE_URL },
          { name: "Plugins", url: `${SITE_URL}/plugins` },
          { name, url: `${SITE_URL}/plugins/${slug}` },
        ]}
      />
      <Header />
      <main>
        <PluginDetail
          plugin={plugin}
          resolution={resolution}
          related={(related?.data ?? []).filter((p) => p.id !== plugin.id).slice(0, 6).map(pluginToItem)}
          ecosystem={ecosystem}
          mcpHref={mcp ? `/mcp/${mcp.slug || slug}` : null}
        />
      </main>
      <Footer />
    </div>
  );
}
