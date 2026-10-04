import type { Metadata } from "next";
import Link from "next/link";
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
  const plugins = response?.data ?? [];
  const items = plugins.map(pluginToItem);
  const sum = (key: "skills" | "agents" | "commands") => plugins.reduce((n, p) => n + (p.contents?.[key] ?? 0), 0);
  const inside = plugins.length
    ? ` ${plugins.length} plugins with ${sum("skills").toLocaleString("en-US")} skills, ${sum("agents")} agents and ${sum("commands")} commands between them.`
    : "";

  return (
    <ListingPage
      title="Claude Plugins Marketplace"
      description={`Plugins bundle skills, agents, commands and MCP servers into one install for Claude Code.${inside}`}
      items={items}
      orders={buildOrders(items, ranked, false)}
      searchPlaceholder="Search plugins..."
      initialCategory={params.category}
      initialQuery={params.search}
      emptyMessage="Plugins are loading. Check back soon."
      schema={
        <CollectionPageSchema
          name="Claude Plugins Marketplace"
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
      <h3>See inside a plugin before you install it</h3>
      <p>
        Each plugin page lists what it adds, and every skill, agent and command has its own page with its full
        instructions, so you can read what Claude will be told to do. They also show up in{" "}
        <Link href="/skills" className="text-foreground underline underline-offset-4 hover:text-primary">Skills</Link> and{" "}
        <Link href="/agents" className="text-foreground underline underline-offset-4 hover:text-primary">Agents</Link>, marked
        with the plugin they come in. The plugins listed here come from the marketplaces Anthropic publishes; install counts
        are Anthropic&apos;s, from Claude Marketplace.
      </p>
    </ListingPage>
  );
}
