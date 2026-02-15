"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  Wrench,
  Shield,
  ArrowUpRight,
  Unlock,
  Plug,
} from "lucide-react";
import { useMCPServers } from "@/hooks/use-mcp-servers";
import { CollectionPageSchema } from "@/components/seo/JsonLd";

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
      <img
        src={favicon}
        alt={name}
        width={size}
        height={size}
        className="rounded-md object-contain shrink-0"
        style={{ width: size, height: size }}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <div
      className="rounded-md bg-primary/10 flex items-center justify-center text-primary font-semibold shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {name[0]?.toUpperCase()}
    </div>
  );
}

const categories = [
  "All",
  "Development",
  "Data",
  "Finance",
  "Marketing",
  "Business",
  "Healthcare",
  "Productivity",
  "Automation",
  "Communication",
  "Design",
  "Research",
  "Travel",
  "AI",
  "Other",
];

const MCPServers = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const { data: servers, isLoading } = useMCPServers({
    search: search || undefined,
    category: category === "All" ? undefined : category.toLowerCase(),
    limit: 200,
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <CollectionPageSchema
        name="MCP Servers"
        description="Browse and discover Model Context Protocol (MCP) servers to connect Claude AI to your favorite tools."
        url="https://claudeai.directory/mcp"
      />
      <Header />
      <main className="flex-1">
        <div className="container py-10">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-foreground mb-2">
              MCP Connectors
            </h1>
            <p className="text-sm text-muted-foreground">
              Connect Claude to your favorite tools with Model Context Protocol
              servers
            </p>
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search connectors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 bg-card border-border pl-10 text-sm"
            />
          </div>

          <div className="flex items-center gap-1.5 mb-6 overflow-x-auto pb-1">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-2.5 py-1 text-[11px] rounded-md border transition-colors whitespace-nowrap ${category === c
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border text-muted-foreground hover:text-foreground"
                  }`}
              >
                {c}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <Skeleton key={i} className="h-40 rounded-lg" />
              ))}
            </div>
          ) : (
            <>
              <p className="mb-4 text-xs text-muted-foreground">
                {servers?.length ?? 0} connectors found
              </p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {(servers ?? []).map((server) => (
                  <Link
                    key={server.id}
                    href={`/mcp/${server.slug || server.id}`}
                    className="group rounded-lg border border-border bg-card p-4 hover:bg-accent/50 hover:border-primary/20 transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <ServerIcon iconUrl={server.branding?.icon_url} name={server.name} size={36} />
                        <div className="min-w-0">
                          <h3 className="text-sm font-medium text-foreground flex items-center gap-1.5">
                            <span className="truncate">{server.name}</span>
                            {server.official && (
                              <Shield className="h-3 w-3 text-primary shrink-0" />
                            )}
                          </h3>
                          <p className="text-[11px] text-muted-foreground truncate">
                            {(typeof server.author === "object" ? server.author?.name : server.author) || "Community"}
                          </p>
                        </div>
                      </div>
                      <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                      {server.one_liner || server.description}
                    </p>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      {(server.capabilities?.tools?.length ?? 0) > 0 && (
                        <span className="flex items-center gap-1 text-[10px] text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">
                          <Wrench className="h-2.5 w-2.5" />
                          {server.capabilities.tools.length} tools
                        </span>
                      )}
                      {server.connection?.is_authless && (
                        <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded">
                          <Unlock className="h-2.5 w-2.5" />
                          No auth
                        </span>
                      )}
                      {server.capabilities?.has_mcp_app && (
                        <span className="flex items-center gap-1 text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                          <Plug className="h-2.5 w-2.5" />
                          App
                        </span>
                      )}
                      {server.category && (
                        <Badge
                          variant="secondary"
                          className="text-[10px] px-1.5 py-0"
                        >
                          {server.category}
                        </Badge>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
              {(servers ?? []).length === 0 && (
                <div className="py-16 text-center">
                  <p className="text-sm text-muted-foreground">
                    No connectors found.
                  </p>
                </div>
              )}
            </>
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

              <h3 className="text-sm font-medium text-foreground pt-2">
                What can MCP do?
              </h3>
              <ul className="list-disc list-inside space-y-1 pl-1">
                <li>Connect AI assistants to your Google Calendar, Notion, Slack, and other everyday tools for a more personalized experience.</li>
                <li>Let Claude Code generate full web apps from a Figma design by connecting to the Figma MCP server.</li>
                <li>Enable enterprise chatbots to query multiple databases across an organization using natural language.</li>
                <li>Give AI models access to specialized tools&mdash;from search engines and code interpreters to 3D design software.</li>
              </ul>

              <h3 className="text-sm font-medium text-foreground pt-2">
                How does MCP work?
              </h3>
              <p>
                MCP follows a client-server architecture. An <strong className="text-foreground">MCP host</strong> (like
                Claude Desktop or an IDE) connects to one or more <strong className="text-foreground">MCP servers</strong> via
                the protocol. Each server exposes a set of <strong className="text-foreground">tools</strong> (actions
                the AI can take), <strong className="text-foreground">resources</strong> (data the AI can read),
                and <strong className="text-foreground">prompts</strong> (pre-built templates for common tasks).
                The host manages connections and routes requests between the AI model and the servers.
              </p>

              <h3 className="text-sm font-medium text-foreground pt-2">
                Why does MCP matter?
              </h3>
              <ul className="list-disc list-inside space-y-1 pl-1">
                <li><strong className="text-foreground">For developers:</strong> Build integrations once and they work across any MCP-compatible AI application, reducing development time and complexity.</li>
                <li><strong className="text-foreground">For AI applications:</strong> Tap into a growing ecosystem of connectors without building custom integrations for each data source.</li>
                <li><strong className="text-foreground">For end users:</strong> Get more capable AI assistants that can access your data and take actions on your behalf, securely and with your permission.</li>
              </ul>

              <p className="pt-2">
                MCP is open source and maintained by Anthropic. Learn more at the{" "}
                <a
                  href="https://modelcontextprotocol.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  official MCP documentation
                </a>.
              </p>
            </div>
          </section>

          {/* Interlinks */}
          <section className="mt-12 border-t border-border pt-10 max-w-3xl">
            <h3 className="text-lg font-medium text-foreground mb-3">
              Explore more from Claude Directory
            </h3>
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
};

export default MCPServers;
