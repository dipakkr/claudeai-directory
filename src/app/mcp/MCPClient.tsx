"use client";

import { useState, useCallback, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

import {
  Check,
  Shield,
  Plus,
  Search,
} from "lucide-react";
import { useMCPServers } from "@/hooks/use-mcp-servers";
import { CollectionPageSchema } from "@/components/seo/JsonLd";
import type { MCPServer } from "@/types";

function getFaviconUrl(iconUrl?: string): string | null {
  if (!iconUrl) return null;
  try {
    const hostname = new URL(iconUrl).hostname;
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;
  } catch {
    return null;
  }
}

function ServerIcon({ iconUrl, name, size = 36 }: { iconUrl?: string; name: string; size?: number }) {
  const [failed, setFailed] = useState(false);
  const favicon = getFaviconUrl(iconUrl);

  if (favicon && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={favicon}
        alt={name}
        width={size}
        height={size}
        className="shrink-0 rounded-lg bg-[var(--cad-chip)] object-contain p-1"
        style={{ width: size, height: size }}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <div
      className="cad-icon-tile"
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {name[0]?.toUpperCase()}
    </div>
  );
}

const categories = [
  "All", "Development", "Data", "Finance", "Marketing", "Business",
  "Healthcare", "Productivity", "Automation", "Communication", "Design",
  "Research", "Travel", "AI", "Other",
];

export default function MCPClient({
  initialData,
}: {
  initialData: MCPServer[];
  initialParams: { category?: string; search?: string };
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const search = searchParams.get("search") ?? "";
  const category = searchParams.get("category") ?? "All";
  const [searchInput, setSearchInput] = useState(search);
  const [noAuthOnly, setNoAuthOnly] = useState(false);

  const { data: servers } = useMCPServers(
    {
      search: search || undefined,
      category: category === "All" ? undefined : category.toLowerCase(),
      limit: 200,
    },
    { initialData }
  );



  const setCategory = useCallback((value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "All") params.set("category", value);
    else params.delete("category");
    router.push(`/mcp?${params.toString()}`);
  }, [router, searchParams]);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    const trimmed = searchInput.trim();
    if (trimmed) params.set("search", trimmed);
    else params.delete("search");
    router.push(`/mcp?${params.toString()}`);
  };

  const filtered = noAuthOnly
    ? (servers ?? []).filter((s) => s.connection?.is_authless)
    : (servers ?? []);

  const featuredServers = filtered.slice(0, 7);

  return (
    <div className="cad-shell flex flex-col">
      <CollectionPageSchema
        name="MCP Servers"
        description="Browse and discover Model Context Protocol (MCP) servers to connect Claude AI to your favorite tools."
        url="https://www.claudeai.directory/mcp"
      />
      <Header />
      <main className="flex-1">
        <section className="mx-auto flex max-w-[1180px] flex-col gap-7 px-6 pb-12 pt-16 sm:px-8 md:pt-[88px]">
          <div className="flex items-start justify-between gap-5">
            <div className="flex items-center gap-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-mark.svg" alt="" className="h-14 w-14 md:h-[64px] md:w-[64px]" />
              <div className="min-w-0">
                <h1 className="text-[clamp(32px,4vw,42px)] font-medium leading-[1.08]">MCPs</h1>
                <p className="mt-2 max-w-[62ch] text-pretty text-base font-medium leading-[1.5] text-muted-foreground md:text-lg">
                  Model Context Protocol servers people use to connect Claude to tools, data and workflows.
                </p>
              </div>
            </div>
            <Link
              href="/submit"
              className="inline-flex h-10 shrink-0 items-center justify-center rounded-[9px] bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-[var(--cad-accent-hover)]"
            >
              Add MCP Server
            </Link>
          </div>

          <form onSubmit={handleSearch} className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto_auto]">
            <label className="flex h-11 items-center gap-2.5 rounded-[9px] border border-border bg-card px-4">
              <Search className="h-4 w-4 shrink-0 text-[var(--cad-faint)]" />
              <input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search MCP servers"
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </label>
            <label className="flex h-11 items-center gap-2 rounded-[9px] border border-border bg-card px-4 text-sm font-medium text-muted-foreground">
              <span>Filter:</span>
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="bg-transparent font-semibold text-foreground outline-none"
                aria-label="Filter MCP servers"
              >
                {categories.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={() => setNoAuthOnly((value) => !value)}
              className={`h-11 rounded-[9px] border px-4 text-sm font-semibold transition-colors ${
                noAuthOnly
                  ? "border-primary bg-[var(--cad-accent-soft)] text-primary"
                  : "border-border bg-card text-muted-foreground hover:border-primary hover:text-primary"
              }`}
            >
              No auth
            </button>
          </form>
        </section>

        <section className="mx-auto max-w-[1180px] px-6 pb-14 sm:px-8">
          <div className="overflow-hidden rounded-[10px] border border-border bg-card">
            <div className="flex min-h-[290px] flex-col items-center justify-center gap-6 bg-[linear-gradient(180deg,var(--cad-raised)_0%,var(--cad-raised)_34%,var(--cad-accent-soft)_140%)] px-6 py-12 text-center">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--cad-faint)]">
                  Curated from the index
                </div>
                <h2 className="mt-5 text-[clamp(26px,3vw,36px)] font-medium leading-tight">
                  Claude with MCP servers
                </h2>
                <p className="mx-auto mt-4 max-w-[47ch] text-pretty text-base font-medium leading-[1.45] text-muted-foreground">
                  Browse live MCP listings for development, data, browser automation, cloud services and research workflows.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                {featuredServers.map((server) => (
                  <span
                    key={server.id}
                    className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-[9px] border border-border bg-card text-sm font-semibold text-muted-foreground shadow-sm"
                    title={server.name}
                  >
                    <ServerIcon iconUrl={server.branding?.icon_url} name={server.name} size={56} />
                  </span>
                ))}
              </div>
              <Link
                href="#mcp-servers"
                className="inline-flex min-h-12 items-center justify-center rounded-[9px] bg-primary px-7 text-sm font-semibold text-primary-foreground hover:bg-[var(--cad-accent-hover)]"
              >
                Explore MCP servers
              </Link>
            </div>
          </div>
        </section>

        <div id="mcp-servers" className="mx-auto max-w-[1180px] px-6 pb-[88px] sm:px-8">
          <div className="mb-5 flex items-baseline justify-between gap-4">
            <h2 className="text-[clamp(24px,2.4vw,32px)] font-medium leading-tight">Top MCP servers</h2>
            <span className="whitespace-nowrap text-sm font-medium text-primary">
              {filtered.length} shown
            </span>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((server) => (
              <Link
                key={server.id}
                href={`/mcp/${server.slug || server.id}`}
                className="group flex min-h-[92px] items-center gap-4 rounded-[9px] border border-border bg-card p-4 transition-colors hover:border-[var(--cad-line-hover)]"
              >
                <ServerIcon iconUrl={server.branding?.icon_url} name={server.name} size={44} />
                <div className="min-w-0 flex-1">
                  <div className="flex min-w-0 items-center gap-2">
                    <h3 className="truncate text-[15px] font-semibold">{server.name}</h3>
                    {server.official && (
                      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[var(--cad-chip)] text-[10px] text-[var(--cad-faint)]">
                        <Shield className="h-2.5 w-2.5" />
                      </span>
                    )}
                    {server.capabilities?.has_mcp_app && (
                      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[var(--cad-chip)] text-[10px] text-[var(--cad-faint)]">
                        <Check className="h-2.5 w-2.5" />
                      </span>
                    )}
                  </div>
                  <p className="mt-1 line-clamp-2 text-pretty text-[13.5px] leading-[1.45] text-muted-foreground">
                    {server.one_liner || server.description}
                  </p>
                </div>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] border border-border bg-[var(--cad-raised)] text-muted-foreground group-hover:border-primary group-hover:text-primary">
                  <Plus className="h-4 w-4" />
                </span>
              </Link>
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-sm text-muted-foreground">No MCP servers found.</p>
            </div>
          )}

          {/* SEO: What is MCP */}
          <section className="mt-20 border-t border-border pt-12 max-w-3xl">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              What is the Model Context Protocol (MCP)?
            </h2>
            <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
              <p>
                The <strong className="text-foreground">Model Context Protocol (MCP)</strong> is
                an open standard for connecting AI applications to external data sources, tools,
                and workflows. Think of MCP like a USB-C port for AI&mdash;just as USB-C provides
                a universal way to connect devices and peripherals, MCP provides a standardized
                way to connect AI models like Claude to the systems they need to work with.
              </p>
              <h3 className="text-sm font-medium text-foreground pt-2">What can MCP do?</h3>
              <ul className="list-disc list-inside space-y-1 pl-1">
                <li>Connect AI assistants to your Google Calendar, Notion, Slack, and other everyday tools.</li>
                <li>Let Claude Code generate full web apps from a Figma design by connecting to the Figma MCP server.</li>
                <li>Enable enterprise chatbots to query multiple databases across an organization.</li>
                <li>Give AI models access to specialized tools from search engines to 3D design software.</li>
              </ul>
              <h3 className="text-sm font-medium text-foreground pt-2">How does MCP work?</h3>
              <p>
                MCP follows a client-server architecture. An <strong className="text-foreground">MCP host</strong> connects
                to one or more <strong className="text-foreground">MCP servers</strong> via the protocol. Each server exposes
                tools, resources, and prompts. The host manages connections and routes requests between the AI and the servers.
              </p>
              <p className="pt-2">
                MCP is open source and maintained by Anthropic. Learn more at the{" "}
                <a href="https://modelcontextprotocol.io" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  official MCP documentation
                </a>.
              </p>
            </div>
          </section>

          <section className="mt-12 border-t border-border pt-10 max-w-3xl">
            <h3 className="text-lg font-medium text-foreground mb-3">Explore more from ClaudeAI Directory</h3>
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm">
              <Link href="/skills" className="text-primary hover:underline">Claude Skills</Link>
              <Link href="/prompts" className="text-primary hover:underline">Prompt Library</Link>
              <Link href="/showcase" className="text-primary hover:underline">Community Showcase</Link>
              <Link href="/jobs" className="text-primary hover:underline">AI Jobs</Link>
              <Link href="/learn" className="text-primary hover:underline">Learn &amp; Resources</Link>
              <Link href="/feed" className="text-primary hover:underline">Latest Feed</Link>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
