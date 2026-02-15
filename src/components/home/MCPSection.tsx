"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Shield, Wrench, Unlock, Plug } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useMCPServers } from "@/hooks/use-mcp-servers";

function getFaviconUrl(iconUrl?: string): string | null {
  if (!iconUrl) return null;
  try {
    const hostname = new URL(iconUrl).hostname;
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;
  } catch {
    return null;
  }
}

function ServerIcon({ iconUrl, name }: { iconUrl?: string; name: string }) {
  const [failed, setFailed] = useState(false);
  const favicon = getFaviconUrl(iconUrl);

  if (favicon && !failed) {
    return (
      <img
        src={favicon}
        alt={name}
        width={32}
        height={32}
        className="h-8 w-8 rounded-md object-contain shrink-0"
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center text-primary text-sm font-medium shrink-0">
      {name[0]?.toUpperCase()}
    </div>
  );
}

const MCPSection = () => {
  const { data: servers, isLoading } = useMCPServers({ limit: 8 });

  return (
    <section className="py-10">
      <div className="container">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-medium text-foreground">Popular MCP Servers</h2>
          <Link
            href="/mcp"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            View all <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {(servers ?? []).slice(0, 8).map((server) => (
              <Link
                key={server.id}
                href={`/mcp/${server.slug || server.id}`}
                className="group rounded-lg border border-border bg-card p-4 hover:bg-accent/50 hover:border-primary/20 transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <ServerIcon iconUrl={server.branding?.icon_url} name={server.name} />
                    <div className="min-w-0">
                      <h3 className="text-sm font-medium text-foreground flex items-center gap-1">
                        <span className="truncate">{server.name}</span>
                        {server.official && <Shield className="h-3 w-3 text-primary shrink-0" />}
                      </h3>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {(typeof server.author === "object" ? server.author?.name : server.author) || "Community"}
                      </p>
                    </div>
                  </div>
                  <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
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
                  {server.category && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                      {server.category}
                    </Badge>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default MCPSection;
