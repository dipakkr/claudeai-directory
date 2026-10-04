import type { PluginPartKind } from "@/types";

export const KIND_LABEL: Record<PluginPartKind, { one: string; many: string; body: string; what: string }> = {
  skills: { one: "Skill", many: "skills", body: "Instructions", what: "Claude uses it on its own when your request matches." },
  agents: { one: "Agent", many: "agents", body: "Definition", what: "A specialized helper Claude Code can hand work to." },
};

/** Below this much instruction text a page says little beyond its plugin's: noindex, not in the sitemap. */
export const MIN_INDEXABLE_BODY = 400;
