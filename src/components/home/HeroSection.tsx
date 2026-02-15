"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Wrench, Server, FileText, Briefcase, Rocket, BookOpen, X } from "lucide-react";
import { useStats } from "@/hooks/use-stats";
import { useSearch } from "@/hooks/use-search";
import { useDebounce } from "@/hooks/use-debounce";

const typeIcons: Record<string, React.ReactNode> = {
  skill: <Wrench className="h-4 w-4 text-blue-500" />,
  mcp_server: <Server className="h-4 w-4 text-green-500" />,
  prompt: <FileText className="h-4 w-4 text-purple-500" />,
  job: <Briefcase className="h-4 w-4 text-orange-500" />,
  showcase: <Rocket className="h-4 w-4 text-pink-500" />,
  blog: <BookOpen className="h-4 w-4 text-yellow-600" />,
};

const typeLabels: Record<string, string> = {
  skill: "Skill",
  mcp_server: "MCP",
  prompt: "Prompt",
  job: "Job",
  showcase: "Showcase",
  blog: "Article",
};

const typeRoutes: Record<string, string> = {
  skill: "/skills",
  mcp_server: "/mcp",
  prompt: "/prompts",
  job: "/jobs",
  showcase: "/showcase",
  blog: "/blog",
};

const HeroSection = ({ initialQuery = "" }: { initialQuery?: string }) => {
  const { data: stats } = useStats();
  const memberCount = stats?.find((s) => s.label === "Community Members")?.value ?? "2K+";

  const [query, setQuery] = useState(initialQuery);
  const debouncedQuery = useDebounce(query, 300);
  const { data: results, isLoading } = useSearch(debouncedQuery);

  const isSearching = query.length > 0;

  return (
    <section className="pt-24 pb-16 md:pt-32 md:pb-20">
      <div className="container">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="mb-6 text-xl md:text-2xl lg:text-2xl font-semibold text-foreground leading-[1.15] tracking-tight">
            The Claude AI Community Hub
          </h1>

          <p className="mb-4 text-base md:text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Discover skills, MCP servers, prompts, jobs, and showcase projects.
            Everything you need to build with Claude.
          </p>

          {/* Inline search bar */}
          <div className="mx-auto w-full max-w-xl relative">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search skills, MCPs, prompts, jobs..."
                className="w-full rounded-xl border border-border bg-card/60 pl-12 pr-12 py-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 hover:bg-card transition-all"
              />
              {isSearching && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Search results */}
            {isSearching && (
              <div className="mt-4 text-left">
                {isLoading ? (
                  <div className="rounded-xl border border-border bg-card p-8 text-center">
                    <p className="text-sm text-muted-foreground">Searching...</p>
                  </div>
                ) : (results ?? []).length > 0 ? (
                  <div className="rounded-xl border border-border bg-card divide-y divide-border overflow-hidden">
                    {(results ?? []).map((result) => {
                      const route = typeRoutes[result._type] ?? "/";
                      const icon = typeIcons[result._type];
                      const label = typeLabels[result._type] ?? result._type;

                      return (
                        <Link
                          key={`${result._type}-${result.id}`}
                          href={`${route}/${result.id}`}
                          className="flex items-start gap-3 px-4 py-3 hover:bg-accent/50 transition-colors"
                        >
                          <div className="mt-0.5 shrink-0">{icon}</div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-foreground truncate">
                                {result.title ?? result.name}
                              </span>
                              <span className="text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded shrink-0">
                                {label}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                              {result.description}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                ) : debouncedQuery.length >= 2 ? (
                  <div className="rounded-xl border border-border bg-card p-8 text-center">
                    <p className="text-sm text-muted-foreground">No results found</p>
                    <button
                      onClick={() => setQuery("")}
                      className="mt-2 text-sm text-primary hover:underline"
                    >
                      Clear search
                    </button>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
