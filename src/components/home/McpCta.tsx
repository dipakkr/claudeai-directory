"use client";

import { useState } from "react";
import Link from "next/link";
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

function ServerIcon({ iconUrl, name, size = 56 }: { iconUrl?: string; name: string; size?: number }) {
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

const McpCta = ({ initialServers = [] }: { initialServers?: MCPServer[] }) => {
  const featuredServers = initialServers.slice(0, 7);

  return (
    <section className="cad-section">
      <div className="container">
        <div className="overflow-hidden rounded-[14px] border border-border bg-card">
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
            {featuredServers.length > 0 && (
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
            )}
            <Link
              href="/mcp"
              className="inline-flex min-h-12 items-center justify-center rounded-[9px] bg-primary px-7 text-sm font-semibold text-primary-foreground hover:bg-[var(--cad-accent-hover)]"
            >
              Explore MCP servers
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default McpCta;
