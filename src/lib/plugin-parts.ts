import type { PluginPartKind } from "@/types";

export const KIND_LABEL: Record<PluginPartKind, { one: string; many: string; body: string; what: string }> = {
  skills: { one: "Skill", many: "skills", body: "Instructions", what: "Claude uses it on its own when your request matches." },
  agents: { one: "Agent", many: "agents", body: "Definition", what: "A specialized helper Claude Code can hand work to." },
  commands: { one: "Command", many: "commands", body: "Prompt", what: "A shortcut you type with a slash in Claude Code." },
};

/** Below this much instruction text a page says little beyond its plugin's: noindex, not in the sitemap. */
export const MIN_INDEXABLE_BODY = 400;

type Standalone = { id: string; name?: string; title?: string; github_url?: string | null };

const owner = (url?: string | null) => url?.match(/github\.com\/([^/#?]+)/i)?.[1]?.toLowerCase() ?? null;
const norm = (s?: string) => (s || "").toLowerCase().replace(/[^a-z0-9]/g, "");

/** owner/repo/path of a GitHub file link, without the branch; null for a plain repo link. */
const filePath = (url?: string | null) => {
  const m = url?.match(/github\.com\/([^/]+\/[^/]+)\/blob\/[^/]+\/([^#?]+)/i);
  return m ? `${m[1]}/${m[2]}`.toLowerCase() : null;
};

/**
 * The standalone skill or agent that is this same file. Its page wins. When the standalone entry
 * links to a file, the paths must match (one repo can hold several files with the same name);
 * when it links to a repo, the same name from the same GitHub owner is enough.
 */
export function standaloneTwin<T extends Standalone>(part: { name: string; url?: string }, standalone: T[]): T | undefined {
  const n = norm(part.name);
  const o = owner(part.url);
  if (!o) return undefined;
  return standalone.find((s) => {
    const file = filePath(s.github_url);
    if (file) return file === filePath(part.url);
    return owner(s.github_url) === o && [s.id, s.name, s.title].some((x) => norm(x) === n);
  });
}

/** Parts that get their own row and sitemap entry: not a copy of another plugin's file or of a standalone entry. */
export function ownParts<P extends { name: string; url?: string; canonical?: string | null }>(parts: P[], standalone: Standalone[]): P[] {
  return parts.filter((p) => !p.canonical && !standaloneTwin(p, standalone));
}
