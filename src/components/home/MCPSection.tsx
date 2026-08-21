"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Shield, Wrench, Unlock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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

function ServerIcon({ iconUrl, name }: { iconUrl?: string; name: string }) {
  const [failed, setFailed] = useState(false);
  const favicon = getFaviconUrl(iconUrl);

  if (favicon && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
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
    <div className="cad-icon-tile">
      {name[0]?.toUpperCase()}
    </div>
  );
}

const MCPSection = ({ initialServers = [] }: { initialServers?: MCPServer[] }) => {
  return (
    <section className="cad-section cad-section-rule">
      <div className="container">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-base font-medium text-foreground">Popular MCP Servers</h2>
          <Link
            href="/mcp"
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
          >
            View all <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {initialServers.slice(0, 8).map((server) => (
            <Link
              key={server.id}
              href={`/mcp/${server.slug || server.id}`}
              className="cad-card group p-4"
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
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
                <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <p className="mb-3 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                {server.one_liner || server.description}
              </p>
              <div className="flex flex-wrap items-center gap-1.5 border-t border-border pt-3">
                {(server.capabilities?.tools?.length ?? 0) > 0 && (
                  <span className="flex items-center gap-1 rounded bg-muted/50 px-1.5 py-0.5 text-[10px] text-muted-foreground">
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
      </div>
    </section>
  );
};

export default MCPSection;
