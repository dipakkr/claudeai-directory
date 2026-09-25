/**
 * Resource page titles follow CLAUDE.md: "{Resource Name} for Claude: {Primary Use}".
 * The primary use is the first clause of the resource's own description, kept short.
 */
export function resourceTitle(name: string, useText?: string | null): string {
  const MAX = 60; // Google cuts titles off at roughly 60 characters.
  const prefix = `${name.trim()} for Claude`;
  if (prefix.length > MAX - 12) return prefix.length > MAX ? `${prefix.slice(0, MAX - 1).trimEnd()}…` : prefix;
  const clause = (useText || "")
    .replace(/\s+/g, " ")
    .trim()
    .split(/(?<=[.!?])\s/)[0]
    .replace(/[.!?]+$/, "");
  if (!clause) return prefix;
  const budget = MAX - prefix.length - 2; // ": "
  let use = clause;
  if (use.length > budget) {
    const cut = use.slice(0, budget + 1);
    const at = Math.max(cut.lastIndexOf(","), cut.lastIndexOf(" "));
    if (at <= 8) return prefix; // no clean word break: better no clause than half a word
    use = cut
      .slice(0, at)
      .replace(/[,\s]+$/, "")
      // Don't end a cut title on a connecting word ("... API for").
      .replace(/\s+(?:a|an|and|as|at|by|for|from|in|into|of|on|or|the|to|using|via|with|your)$/i, "");
  }
  if (use.length < 8) return prefix;
  return `${prefix}: ${use.charAt(0).toUpperCase()}${use.slice(1)}`;
}

/** Filtered or searched listing URLs are not indexed (CLAUDE.md "Technical SEO"). */
export function listingRobots(params: Record<string, string | undefined>) {
  const filtered = Object.values(params).some(Boolean);
  return filtered ? { index: false, follow: true } : undefined;
}
