"use client";

import Link from "next/link";
import { Bot, Github, Plug, Puzzle, Sparkles, SquareSlash, Webhook } from "lucide-react";
import { PluginPartList } from "@/components/directory/PluginPartList";
import { InstallActions, InstallPanel } from "@/components/directory/InstallPanel";
import { DetailSection, ResourceDetail, scrollToInstall } from "@/components/directory/ResourceDetail";
import { CategoryGlyph } from "@/components/directory/DiscoverListing";
import { DirectoryRow } from "@/components/directory/DirectoryList";
import { compactNumber, pluginIcon, type DirectoryItem } from "@/lib/directory";
import type { InstallResolution } from "@/lib/install";
import type { Plugin } from "@/types";

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

/** One row per kind of thing the plugin adds, with a plain explanation. */
function insideRows(c: Plugin["contents"]): { label: string; body: string }[] {
  if (!c) return [];
  return [
    c.skills ? { label: plural(c.skills, "Skill"), body: "Things Claude can do when you ask." } : null,
    c.agents ? { label: plural(c.agents, "Agent"), body: "Specialized helpers Claude can hand work to." } : null,
    c.commands ? { label: plural(c.commands, "Command"), body: "Shortcuts you type with a slash." } : null,
    c.hooks ? { label: "Hooks", body: "Run automatically at set points in a session." } : null,
    c.mcp ? { label: "MCP server", body: "Connects Claude to an outside service once you sign in." } : null,
  ].filter((x): x is { label: string; body: string } => Boolean(x));
}

/** "2 skills, 1 agent, hooks, MCP server" from the counted contents. */
function contentChips(c: Plugin["contents"]): string[] {
  if (!c) return [];
  return [
    c.skills ? plural(c.skills, "skill") : null,
    c.agents ? plural(c.agents, "agent") : null,
    c.commands ? plural(c.commands, "command") : null,
    c.hooks ? "Hooks" : null,
    c.mcp ? "MCP server" : null,
  ].filter((x): x is string => Boolean(x));
}

export default function PluginDetail({
  plugin,
  resolution,
  related,
  ecosystem,
  mcpHref,
}: {
  plugin: Plugin;
  resolution: InstallResolution;
  related: DirectoryItem[];
  /** Other skills, MCP servers and agents in the directory for the same product. */
  ecosystem: DirectoryItem[];
  /** Our MCP server page with the same slug, when there is one. */
  mcpHref: string | null;
}) {
  const name = plugin.title || plugin.name;
  const official = plugin.official;
  const inside = contentChips(plugin.contents);
  const parts = plugin.components;
  const totals = plugin.contents;
  // Older rows have counts only: fall back to the plain summary.
  const rows = parts ? [] : insideRows(plugin.contents);
  const repo = plugin.github_url?.match(/github\.com\/([^/]+\/[^/#?]+)/)?.[1];
  const category = plugin.category ? plugin.category.charAt(0).toUpperCase() + plugin.category.slice(1) : "";

  return (
    <ResourceDetail
      backHref="/plugins"
      backLabel="Plugins"
      iconSrc={pluginIcon(plugin)}
      icon={<CategoryGlyph category={plugin.category} type="plugin" name={name} className="h-6 w-6" />}
      name={name}
      verified={official?.anthropic_verified}
      tagline={plugin.description}
      meta={
        <>
          <span>Plugin</span>
          {plugin.author?.name && (
            <>
              <span aria-hidden>·</span>
              <span>by {plugin.author.name}</span>
            </>
          )}
          {repo && (
            <>
              <span aria-hidden>·</span>
              <a href={plugin.github_url!} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:text-foreground">
                <Github className="h-3.5 w-3.5" />
                {repo}
              </a>
            </>
          )}
        </>
      }
      action={
        <InstallActions resolution={resolution} kind="plugin" resourceId={plugin.id} name={name} href={`/plugins/${plugin.id}`} onInstall={scrollToInstall} />
      }
      facts={[
        { label: "Made by", value: plugin.author?.name, href: plugin.author?.url || undefined },
        { label: "Category", chips: category ? [category] : [] },
        { label: "What's inside", chips: rows.length ? [] : inside },
        { label: "Anthropic verified", value: official?.anthropic_verified ? "Yes" : null },
        { label: "Installs on Claude Marketplace", value: official?.installs ? compactNumber(official.installs) : null },
        { label: "Marketplace", value: `${plugin.marketplace.name}`, mono: true },
      ]}
      links={[
        { label: "View on Claude Marketplace", href: official?.url },
        { label: "Source", href: plugin.github_url },
        { label: "Homepage", href: plugin.homepage && plugin.homepage !== plugin.github_url ? plugin.homepage : null },
        { label: "Use in Claude (Cowork)", href: plugin.works_in?.cowork_url },
      ]}
      related={related}
      relatedTitle="Related plugins"
    >
      {mcpHref && (
        <p className="text-[13.5px] text-[var(--cad-desc)]">
          Only need the tools?{" "}
          <Link href={mcpHref} className="text-[var(--cad-link)] underline underline-offset-[3px]">
            {name} is also listed as an MCP server
          </Link>
          .
        </p>
      )}

      {rows.length > 0 && (
        <DetailSection id="inside" title="What's inside">
          <ul className="divide-y divide-border overflow-hidden rounded-[12px] border border-border">
            {rows.map((r) => (
              <li key={r.label} className="flex items-center gap-4 px-5 py-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] border border-border text-muted-foreground">
                  <Puzzle className="h-4 w-4" />
                </span>
                <span>
                  <span className="block text-[15px] font-medium text-foreground">{r.label}</span>
                  <span className="block text-[13.5px] text-muted-foreground">{r.body}</span>
                </span>
              </li>
            ))}
          </ul>
        </DetailSection>
      )}

      {parts && parts.skills.length > 0 && (
        <DetailSection id="skills" title={`Skills (${totals?.skills ?? parts.skills.length})`}>
          <p className="-mt-1 mb-3 text-[13.5px] text-muted-foreground">Claude uses these on its own when your request matches.</p>
          <PluginPartList pluginId={plugin.id} kind="skills" parts={parts.skills} total={totals?.skills ?? parts.skills.length} icon={Sparkles} />
        </DetailSection>
      )}

      {parts && parts.mcp_servers.length > 0 && (
        <DetailSection id="mcp" title={parts.mcp_servers.length === 1 ? "MCP server" : `MCP servers (${parts.mcp_servers.length})`}>
          <p className="-mt-1 mb-3 text-[13.5px] text-muted-foreground">Added to Claude Code when you install the plugin. You sign in to {name} the first time it is used.</p>
          <ul className="divide-y divide-border overflow-hidden rounded-[12px] border border-border">
            {parts.mcp_servers.map((server) => (
              <li key={server.name} className="flex gap-4 px-5 py-4">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-border text-muted-foreground">
                  <Plug className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[14px] text-foreground">{server.name}</span>
                    <span className="rounded border border-border px-1.5 py-px font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
                      {server.type === "stdio" ? "Local" : "Remote"}
                    </span>
                  </span>
                  {(server.url || server.command) && (
                    <code className="mt-1 block truncate font-mono text-[12.5px] text-muted-foreground">{server.url || server.command}</code>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </DetailSection>
      )}

      {parts && parts.agents.length > 0 && (
        <DetailSection id="agents" title={`Agents (${totals?.agents ?? parts.agents.length})`}>
          <p className="-mt-1 mb-3 text-[13.5px] text-muted-foreground">Specialized helpers Claude can hand work to.</p>
          <PluginPartList pluginId={plugin.id} kind="agents" parts={parts.agents} total={totals?.agents ?? parts.agents.length} icon={Bot} />
        </DetailSection>
      )}

      {parts && parts.commands.length > 0 && (
        <DetailSection id="commands" title={`Commands (${totals?.commands ?? parts.commands.length})`}>
          <p className="-mt-1 mb-3 text-[13.5px] text-muted-foreground">Shortcuts you type in Claude Code.</p>
          <PluginPartList pluginId={plugin.id} kind="commands" parts={parts.commands} total={totals?.commands ?? parts.commands.length} icon={SquareSlash} prefix="/" />
        </DetailSection>
      )}

      {parts?.hooks && (
        <p className="flex items-center gap-2 text-[13.5px] text-muted-foreground">
          <Webhook className="h-4 w-4" />
          Also adds hooks that run automatically at set points in a session.
        </p>
      )}

      <DetailSection id="install" title="Install">
        <InstallPanel resolution={resolution} kind="plugin" resourceId={plugin.id} bare />
      </DetailSection>

      {ecosystem.length > 0 && (
        <DetailSection id="more" title={`More for ${name} on Claude`}>
          <ol>
            {ecosystem.map((item, i) => (
              <DirectoryRow key={item.key} item={item} rank={i + 1} showType />
            ))}
          </ol>
        </DetailSection>
      )}
    </ResourceDetail>
  );
}
