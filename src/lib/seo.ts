/**
 * Resource page titles follow CLAUDE.md: "{Resource Name} for Claude: {Primary Use}".
 * The primary use is the first clause of the resource's own description, kept short.
 */
export function resourceTitle(name: string, useText?: string | null): string {
  const clause = (useText || "")
    .replace(/\s+/g, " ")
    .trim()
    .split(/(?<=[.!?])\s/)[0]
    .replace(/[.!?]+$/, "");
  if (!clause) return `${name} for Claude`;
  let use = clause;
  if (use.length > 60) {
    const cut = use.slice(0, 60);
    const at = Math.max(cut.lastIndexOf(","), cut.lastIndexOf(" "));
    use = cut
      .slice(0, at > 30 ? at : 60)
      .replace(/[,\s]+$/, "")
      // Don't end a cut title on a connecting word ("... API for").
      .replace(/\s+(?:a|an|and|as|at|by|for|from|in|into|of|on|or|the|to|using|via|with)$/i, "");
  }
  return `${name} for Claude: ${use.charAt(0).toUpperCase()}${use.slice(1)}`;
}

/** Filtered or searched listing URLs are not indexed (CLAUDE.md "Technical SEO"). */
export function listingRobots(params: Record<string, string | undefined>) {
  const filtered = Object.values(params).some(Boolean);
  return filtered ? { index: false, follow: true } : undefined;
}
