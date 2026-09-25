"use client";

import Link from "next/link";
import { InstallActions, InstallPanel } from "@/components/directory/InstallPanel";
import { DetailSection, ResourceDetail, scrollToInstall } from "@/components/directory/ResourceDetail";
import { CategoryGlyph } from "@/components/directory/DiscoverListing";
import { compactNumber, faviconFor, type DirectoryItem } from "@/lib/directory";
import type { InstallResolution } from "@/lib/install";
import type { Plugin } from "@/types";

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

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
  const category = plugin.category ? plugin.category.charAt(0).toUpperCase() + plugin.category.slice(1) : "";

  return (
    <ResourceDetail
      backHref="/plugins"
      backLabel="Plugins"
      iconSrc={faviconFor(plugin.author?.url || plugin.homepage)}
      icon={<CategoryGlyph category={plugin.category} type="plugin" name={name} className="h-6 w-6" />}
      name={name}
      verified={official?.anthropic_verified}
      tagline={plugin.description}
      action={
        <InstallActions resolution={resolution} kind="plugin" resourceId={plugin.id} name={name} href={`/plugins/${plugin.id}`} onInstall={scrollToInstall} />
      }
      facts={[
        { label: "Made by", value: plugin.author?.name, href: plugin.author?.url || undefined },
        { label: "Category", chips: category ? [category] : [] },
        { label: "What's inside", chips: inside },
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

      <DetailSection id="install" title="Install">
        <InstallPanel resolution={resolution} kind="plugin" resourceId={plugin.id} bare />
      </DetailSection>
    </ResourceDetail>
  );
}
