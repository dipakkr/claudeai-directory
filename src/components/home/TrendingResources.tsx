"use client";

import Link from "next/link";
import { ArrowUpRight, TrendingUp, Star, Shield } from "lucide-react";
import { useMCPServers } from "@/hooks/use-mcp-servers";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const TrendingResources = () => {
  const { data: servers, isLoading } = useMCPServers({ trending: true, limit: 6 });

  return (
    <section className="py-10">
      <div className="container">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <h2 className="text-base font-medium text-foreground">Trending MCP Servers</h2>
          </div>
          <Link
            href="/mcp"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            View all <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {(servers ?? []).slice(0, 6).map((server) => (
              <Link
                key={server.id}
                href={`/mcp/${server.slug || server.id}`}
                className="group rounded-lg border border-border bg-card p-4 hover:bg-accent/50 hover:border-primary/20 transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center text-primary text-sm font-medium">
                      {server.name[0]?.toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-foreground flex items-center gap-1">
                        {server.name}
                        {server.official && <Shield className="h-3 w-3 text-primary" />}
                      </h3>
                      <p className="text-xs text-muted-foreground">{typeof server.author === "object" ? server.author?.name : server.author}</p>
                    </div>
                  </div>
                  <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                  {server.description}
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Star className="h-3 w-3" />
                    {server.stars.toLocaleString()}
                  </span>
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                    {server.category}
                  </Badge>
                  {server.trending && (
                    <Badge className="text-[10px] px-1.5 py-0 bg-primary/10 text-primary border-0">
                      Trending
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

export default TrendingResources;
