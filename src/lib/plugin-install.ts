import { resolvePluginInstall, type InstallResolution } from "@/lib/install";
import type { Plugin } from "@/types";

/** Marketplaces Claude Code ships with, so users never need to add them. */
const PREINSTALLED = new Set(["claude-plugins-official"]);
/** Marketplaces whose own README says their plugins work in Claude Code. */
const CLAUDE_CODE_OK = new Set(["claude-plugins-official", "knowledge-work-plugins"]);

/** How to install a plugin. Its skills, agents and commands install the same way, with the plugin. */
export function pluginResolution(plugin: Plugin): InstallResolution {
  const m = plugin.marketplace;
  // Cowork-only on Claude Marketplace and no Claude Code support stated: link to Cowork, no CLI command.
  const coworkOnly = !plugin.works_in?.claude_code && !CLAUDE_CODE_OK.has(m.name);
  if (coworkOnly) {
    return {
      method: "manual",
      verified: false,
      title: "Install in Claude (Cowork)",
      reason: "This plugin is published for Claude Cowork. Its publisher doesn't list Claude Code support.",
      setupUrl: plugin.works_in?.cowork_url || plugin.official?.url,
      setupLabel: "Open in Claude",
      sourceUrl: plugin.github_url || undefined,
    };
  }
  return resolvePluginInstall({
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
}
