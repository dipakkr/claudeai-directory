"use client";

import Link from "next/link";
import { Github, Puzzle } from "lucide-react";
import { InstallActions, InstallPanel } from "@/components/directory/InstallPanel";
import { DetailSection, ResourceDetail, scrollToInstall } from "@/components/directory/ResourceDetail";
import { CategoryGlyph } from "@/components/directory/DiscoverListing";
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
  mcpHref,
}: {
  plugin: Plugin;
  resolution: InstallResolution;
  related: DirectoryItem[];
  /** Our MCP server page with the same slug, when there is one. */
  mcpHref: string | null;
}) {
  const name = plugin.title || plugin.name;
  const official = plugin.official;
  const inside = contentChips(plugin.contents);
  const rows = insideRows(plugin.contents);
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

      <DetailSection id="install" title="Install">
        <InstallPanel resolution={resolution} kind="plugin" resourceId={plugin.id} bare />
      </DetailSection>
    </ResourceDetail>
  );
}
