import type { Metadata } from "next";
import ListingPage from "@/components/directory/ListingPage";
import { CollectionPageSchema } from "@/components/seo/JsonLd";
import { fetchApi } from "@/lib/api-server";
import { buildOrders, pluginToItem } from "@/lib/directory";
import { loadOrders } from "@/lib/server/rankings";
import { listingRobots } from "@/lib/seo";
import type { Plugin } from "@/types";

type ListingParams = Promise<{ category?: string; search?: string }>;

export async function generateMetadata({ searchParams }: { searchParams: ListingParams }): Promise<Metadata> {
  return { robots: listingRobots(await searchParams) };
}

export default async function PluginsPage({ searchParams }: { searchParams: ListingParams }) {
  const params = await searchParams;
  const [response, ranked] = await Promise.all([fetchApi<{ data: Plugin[] }>("/plugins?limit=500"), loadOrders("plugin")]);
  const items = (response?.data ?? []).map(pluginToItem);

  return (
    <ListingPage
      title="Claude Code Plugins"
      description="Plugins bundle skills, agents, commands and MCP servers into one install for Claude Code."
      items={items}
      orders={buildOrders(items, ranked, false)}
      searchPlaceholder="Search plugins..."
      initialCategory={params.category}
      initialQuery={params.search}
      emptyMessage="Plugins are loading. Check back soon."
      schema={
        <CollectionPageSchema
          name="Claude Code Plugins"
          description="Claude Code plugins that bundle skills, agents, commands and MCP servers."
          url="https://www.claudeai.directory/plugins"
        />
      }
    >
      <h2>What are Claude Code plugins?</h2>
      <p>
        A <strong>plugin</strong> packages skills, subagents, slash commands, hooks and MCP servers so they install together
        with one command. Plugins are published in marketplaces: a GitHub repository with a{" "}
        <code className="font-mono text-foreground">marketplace.json</code> file that lists them.
      </p>
      <h3>How installing works</h3>
      <p>
        Every plugin here comes from a published marketplace, so the install command points at a real entry. Plugins in
        Anthropic&apos;s official marketplace install with a single <code className="font-mono text-foreground">/plugin install</code>{" "}
        command, since Claude Code already knows that marketplace. Others need the marketplace added once first.
      </p>
    </ListingPage>
  );
}
