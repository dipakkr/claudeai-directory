import type { MarketplaceMatch } from "@/lib/install";

// Published plugin marketplaces the site reads. A marketplace install command
// is shown only for components listed in one of these live manifests, so an
// entry that is not merged yet can never produce a command.
const MARKETPLACES = [
  {
    // Our registry (INSTALL_REGISTRY.md). Missing until the repo is published;
    // a 404 simply means no entries.
    ours: true,
    source: "claude-directory/plugins",
    // REGISTRY_MANIFEST_URL lets staging or local QA point at an unpublished build.
    manifestUrl:
      process.env.REGISTRY_MANIFEST_URL ||
      "https://raw.githubusercontent.com/claude-directory/plugins/main/.claude-plugin/marketplace.json",
  },
  {
    // Anthropic's own skills marketplace (bundles like document-skills).
    ours: false,
    source: "anthropics/skills",
    manifestUrl: "https://raw.githubusercontent.com/anthropics/skills/main/.claude-plugin/marketplace.json",
  },
] as const;

interface ManifestPlugin {
  name?: string;
  source?: string | { source?: string; repo?: string; url?: string; path?: string };
  strict?: boolean;
  skills?: string[] | string;
  agents?: string[] | string;
}

interface Manifest {
  name?: string;
  plugins?: ManifestPlugin[];
}

export interface RegistryIndex {
  /** key: `${owner/repo}:${path}` (path without leading "./" or trailing "/") */
  get(repo: string, path: string): MarketplaceMatch | null;
}

const normalizePath = (p: string) => p.replace(/^\.\//, "").replace(/\/+$/, "");
const key = (repo: string, path: string) => `${repo.toLowerCase()}:${normalizePath(path)}`;
const asList = (v?: string[] | string) => (Array.isArray(v) ? v : v ? [v] : []);

function pluginRepo(plugin: ManifestPlugin, marketplaceRepo: string): { repo: string; base: string } | null {
  const src = plugin.source;
  if (typeof src === "string") {
    // Relative source inside the marketplace repo.
    return src.startsWith("./") || src === "." ? { repo: marketplaceRepo, base: normalizePath(src === "." ? "" : src) } : null;
  }
  if (src?.source === "github" && src.repo) return { repo: src.repo, base: "" };
  if (src?.source === "git-subdir" && src.url && src.path) {
    const m = src.url.match(/github\.com\/([^/]+\/[^/.]+)/);
    return m ? { repo: m[1], base: normalizePath(src.path) } : null;
  }
  return null;
}

async function fetchManifest(url: string, timeoutMs: number): Promise<Manifest | null> {
  try {
    const res = await fetch(url, { next: { revalidate: 600 }, signal: AbortSignal.timeout(timeoutMs) });
    if (!res.ok) return null;
    return (await res.json()) as Manifest;
  } catch {
    return null;
  }
}

export async function loadRegistryIndex(timeoutMs = 10000): Promise<RegistryIndex> {
  const entries = new Map<string, MarketplaceMatch>();
  const manifests = await Promise.all(MARKETPLACES.map((m) => fetchManifest(m.manifestUrl, timeoutMs)));

  manifests.forEach((manifest, i) => {
    const marketplace = MARKETPLACES[i];
    if (!manifest?.name || !Array.isArray(manifest.plugins)) return;
    for (const plugin of manifest.plugins) {
      if (!plugin.name) continue;
      const origin = pluginRepo(plugin, marketplace.source);
      if (!origin) continue;
      const components = [...asList(plugin.skills), ...asList(plugin.agents)].map((p) =>
        normalizePath([origin.base, normalizePath(p)].filter(Boolean).join("/")),
      );
      const names = components.map((p) => p.split("/").pop()!.replace(/\.md$/, ""));
      components.forEach((path, idx) => {
        const k = key(origin.repo, path);
        const existing = entries.get(k);
        // Our registry wins; otherwise prefer a single-component plugin over a bundle.
        const candidate: MarketplaceMatch = {
          marketplaceName: manifest.name!,
          marketplaceSource: marketplace.source,
          pluginName: plugin.name!,
          bundledWith: names.filter((_, j) => j !== idx),
          ours: marketplace.ours,
        };
        if (
          !existing ||
          (candidate.ours && !existing.ours) ||
          (candidate.ours === existing.ours && candidate.bundledWith.length < existing.bundledWith.length)
        ) {
          entries.set(k, candidate);
        }
      });
    }
  });

  return { get: (repo, path) => entries.get(key(repo, path)) ?? null };
}
