// Install resolution (see INSTALL_REGISTRY.md and docs/INSTALL_API_CONTRACT.md).
//
// Every install command shown on the site is generated here from structured,
// validated fields. Stored command strings are never replayed as-is, and a
// plugin marketplace command only appears when the entry exists in a
// published marketplace.json (see lib/server/registry.ts).

export type InstallMethod = "plugin_marketplace" | "mcp_http" | "mcp_stdio" | "manual";
export type InstallStatus = "verified" | "unverified" | "broken" | "needs_review";
export type ResourceKind = "skill" | "mcp" | "agent";

/** The `install` object from the API (snake_case, all optional except method/status). */
export interface ResourceInstall {
  method: InstallMethod;
  status: InstallStatus;
  verified_at?: string;
  plugin_name?: string;
  source_repo?: string;
  source_ref?: string;
  source_path?: string;
  mcp_name?: string;
  url?: string;
  transport?: "http" | "sse" | "stdio";
  oauth_required?: boolean;
  command?: string;
  args?: string[];
  env_keys?: string[];
}

/** A plugin entry found in a published marketplace that contains this resource. */
export interface MarketplaceMatch {
  marketplaceName: string;
  /** What users pass to `/plugin marketplace add`. */
  marketplaceSource: string;
  pluginName: string;
  /** Other components the same plugin installs (bundles such as document-skills). */
  bundledWith: string[];
  /** Our own registry, as opposed to the creator's marketplace. */
  ours: boolean;
}

export type InstallResolution =
  | {
      method: "plugin_marketplace";
      verified: true;
      installCommand: string;
      addMarketplaceCommand: string;
      match: MarketplaceMatch;
      sourceUrl?: string;
    }
  | {
      method: "mcp_http";
      verified: true;
      name: string;
      url: string;
      transport: "http" | "sse";
      command: string;
      oauthRequired: boolean;
      sourceUrl?: string;
    }
  | {
      method: "mcp_stdio";
      verified: true;
      name: string;
      command: string;
      envKeys: string[];
      sourceUrl?: string;
    }
  | {
      method: "manual";
      verified: false;
      /** Why there is no direct install, in plain words. */
      reason: string;
      setupUrl?: string;
      sourceUrl?: string;
    };

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ENV_KEY = /^[A-Z][A-Z0-9_]*$/;
// Conservative: a single shell word made of safe characters.
const SAFE_ARG = /^[A-Za-z0-9@%+=:,./_~-]+$/;

export function toSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function isHttpsUrl(value?: string | null): value is string {
  if (!value) return false;
  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" && !url.username && !url.password;
  } catch {
    return false;
  }
}

export function mcpHttpCommand(name: string, url: string, transport: "http" | "sse" = "http"): string {
  return `claude mcp add --transport ${transport} ${name} ${url}`;
}

export function mcpStdioCommand(name: string, command: string, args: string[], envKeys: string[]): string {
  // Placeholder values stay shell-safe (no angle brackets) so a pasted command
  // fails loudly at the server, not in the shell.
  const env = envKeys.map((key) => `--env ${key}=YOUR_VALUE`);
  return ["claude mcp add --transport stdio", ...env, name, "--", command, ...args].join(" ");
}

export function pluginInstallCommand(pluginName: string, marketplaceName: string): string {
  return `/plugin install ${pluginName}@${marketplaceName}`;
}

export function marketplaceAddCommand(source: string): string {
  return `/plugin marketplace add ${source}`;
}

/** MCP: structured `install` from the API wins; otherwise derive from connection fields. */
export function resolveMcpInstall(input: {
  install?: ResourceInstall | null;
  slug: string;
  connectionUrl?: string | null;
  transport?: string | null;
  isAuthless?: boolean | null;
  setupUrl?: string | null;
  sourceUrl?: string | null;
}): InstallResolution {
  const sourceUrl = input.sourceUrl || undefined;
  const setupUrl = input.setupUrl || sourceUrl;
  const install = input.install;

  if (install && install.status !== "verified") {
    return { method: "manual", verified: false, reason: "Setup details for this server are still being reviewed.", setupUrl, sourceUrl };
  }

  if (install?.method === "mcp_http") {
    const name = install.mcp_name ?? "";
    if (SLUG.test(name) && isHttpsUrl(install.url)) {
      const transport = install.transport === "sse" ? "sse" : "http";
      return {
        method: "mcp_http",
        verified: true,
        name,
        url: install.url.trim(),
        transport,
        command: mcpHttpCommand(name, install.url.trim(), transport),
        oauthRequired: Boolean(install.oauth_required),
        sourceUrl,
      };
    }
  }

  if (install?.method === "mcp_stdio") {
    const name = install.mcp_name ?? "";
    const args = install.args ?? [];
    const envKeys = install.env_keys ?? [];
    if (
      SLUG.test(name) &&
      install.command &&
      SAFE_ARG.test(install.command) &&
      args.every((a) => SAFE_ARG.test(a)) &&
      envKeys.every((k) => ENV_KEY.test(k))
    ) {
      return {
        method: "mcp_stdio",
        verified: true,
        name,
        command: mcpStdioCommand(name, install.command, args, envKeys),
        envKeys,
        sourceUrl,
      };
    }
  }

  if (install?.method === "manual") {
    return { method: "manual", verified: false, reason: "This server needs manual setup.", setupUrl, sourceUrl };
  }

  // Rows not backfilled yet: a remote HTTPS endpoint with a known transport is
  // enough to build a verified-shape command. Anything else needs review.
  const transport = (input.transport || "").toLowerCase();
  const name = toSlug(input.slug);
  if (!install && isHttpsUrl(input.connectionUrl) && SLUG.test(name) && ["streamable-http", "http", "sse"].includes(transport)) {
    const t = transport === "sse" ? "sse" : "http";
    const url = input.connectionUrl.trim();
    return {
      method: "mcp_http",
      verified: true,
      name,
      url,
      transport: t,
      command: mcpHttpCommand(name, url, t),
      oauthRequired: input.isAuthless === false,
      sourceUrl,
    };
  }

  return {
    method: "manual",
    verified: false,
    reason: "Direct install is not available yet for this server.",
    setupUrl,
    sourceUrl,
  };
}

/** Skills and agents: installable only through a published marketplace entry. */
export function resolvePluginInstall(input: {
  match: MarketplaceMatch | null;
  setupUrl?: string | null;
  sourceUrl?: string | null;
}): InstallResolution {
  const sourceUrl = input.sourceUrl || undefined;
  if (input.match && SLUG.test(input.match.pluginName)) {
    return {
      method: "plugin_marketplace",
      verified: true,
      installCommand: pluginInstallCommand(input.match.pluginName, input.match.marketplaceName),
      addMarketplaceCommand: marketplaceAddCommand(input.match.marketplaceSource),
      match: input.match,
      sourceUrl,
    };
  }
  return {
    method: "manual",
    verified: false,
    reason: "Direct install is not available yet.",
    setupUrl: input.setupUrl || sourceUrl,
    sourceUrl,
  };
}
