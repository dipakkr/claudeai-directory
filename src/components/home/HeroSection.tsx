"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Wrench, Server, FileText, Briefcase, Rocket, BookOpen, DollarSign, Users, X, Wand2 } from "lucide-react";
import { useSearch } from "@/hooks/use-search";
import { useDebounce } from "@/hooks/use-debounce";
import type { Stat } from "@/types";

const typeIcons: Record<string, React.ReactNode> = {
  skill: <Wrench className="h-4 w-4 text-primary" />,
  mcp_server: <Server className="h-4 w-4 text-primary" />,
  prompt: <FileText className="h-4 w-4 text-primary" />,
  job: <Briefcase className="h-4 w-4 text-primary" />,
  showcase: <Rocket className="h-4 w-4 text-primary" />,
  blog: <BookOpen className="h-4 w-4 text-primary" />,
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

type CategoryItem = {
  name: string;
  description: string;
  href: string;
  icon: any;
  iconColor: string;
  iconBg: string;
  fullWidth?: boolean;
};

const categories: CategoryItem[] = [
  {
    name: "Skills",
    description: "Reusable Claude capabilities",
    href: "/skills",
    icon: Wrench,
    iconColor: "text-primary",
    iconBg: "bg-primary/10",
  },
  {
    name: "Prompts",
    description: "Copy-ready templates",
    href: "/prompts",
    icon: FileText,
    iconColor: "text-primary",
    iconBg: "bg-primary/10",
  },
  {
    name: "MCP Servers",
    description: "Connect Claude to any tool",
    href: "/mcp",
    icon: Server,
    iconColor: "text-primary",
    iconBg: "bg-primary/10",
  },
  {
    name: "Guides",
    description: "Learn to build with Claude",
    href: "/guides",
    icon: BookOpen,
    iconColor: "text-primary",
    iconBg: "bg-primary/10",
  },
  {
    name: "Context Generator",
    description: "Generate AI-friendly CLAUDE.md context",
    href: "/setup",
    icon: Wand2,
    iconColor: "text-primary",
    iconBg: "bg-primary/10",
    fullWidth: true,
  },
];

const HeroSection = ({ initialQuery = "", initialStats = [] }: { initialQuery?: string; initialStats?: Stat[] }) => {
  const [query, setQuery] = useState(initialQuery);
  const debouncedQuery = useDebounce(query, 300);
  const { data: results, isLoading } = useSearch(debouncedQuery);
  const isSearching = query.length > 0;


  return (
    <section className="pt-16 pb-14 md:pt-24 md:pb-20 relative overflow-x-clip">
      {/* Subtle background effects */}
      <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 translate-y-1/2 w-[600px] h-[600px] bg-primary/5 blur-[150px] rounded-full pointer-events-none z-[-1]" />

      <div className="container relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center max-w-7xl mx-auto">

          {/* Left column */}
          <div className="lg:col-span-6 lg:pr-8">
            {/* Label */}
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary mb-8 shadow-sm">
              <span className="relative flex h-2 w-2 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Open community for Claude builders
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.1] mb-6">
              Everything you need<br />
              to build with <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">Claude</span>
            </h1>

            <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-10 max-w-lg">
              Unlock the full potential of Claude with community-curated skills, MCP servers, prompts, jobs, and guides.
            </p>

            {/* Search */}
            <div className="relative max-w-xl mb-12">
              <div className="relative group">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/20 to-border blur opacity-40 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative bg-card/80 backdrop-blur-xl rounded-2xl border border-border flex items-center shadow-lg transition-all duration-300">
                  <Search className="absolute left-4 h-5 w-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search skills, MCPs, prompts, jobs..."
                    className="w-full min-w-0 bg-transparent pl-12 pr-12 py-4 md:py-5 text-sm md:text-base text-foreground placeholder:text-muted-foreground focus:outline-none rounded-2xl"
                  />
                  {isSearching && (
                    <button
                      onClick={() => setQuery("")}
                      className="absolute right-4 p-1.5 rounded-full bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Search results */}
              {isSearching && (
                <div className="absolute top-full left-0 right-0 mt-3 z-50">
                  {isLoading ? (
                    <div className="rounded-2xl border border-border bg-card/95 backdrop-blur-xl p-8 text-center shadow-xl">
                      <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">Searching collective...</p>
                    </div>
                  ) : (results ?? []).length > 0 ? (
                    <div className="rounded-2xl border border-border bg-card/95 backdrop-blur-xl shadow-xl divide-y divide-border overflow-hidden max-h-[400px] overflow-y-auto">
                      {(results ?? []).map((result) => {
                        const route = typeRoutes[result._type] ?? "/";
                        const icon = typeIcons[result._type];
                        const label = typeLabels[result._type] ?? result._type;
                        const itemSlug = result.slug || result._id || result.id;
                        return (
                          <Link
                            key={`${result._type}-${itemSlug}`}
                            href={`${route}/${itemSlug}`}
                            className="flex items-start gap-4 px-5 py-4 hover:bg-muted/50 transition-colors"
                          >
                            <div className="mt-0.5 shrink-0 bg-background p-2 rounded-lg border border-border shadow-sm">{icon}</div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-semibold text-foreground truncate">
                                  {result.title ?? result.name}
                                </span>
                                <span className="text-[10px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full shrink-0 border border-border/50">
                                  {label}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                {result.description}
                              </p>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  ) : debouncedQuery.length >= 2 ? (
                    <div className="rounded-2xl border border-border bg-card/95 backdrop-blur-xl p-8 text-center shadow-xl">
                      <p className="text-sm font-medium text-foreground mb-1">No results found</p>
                      <p className="text-sm text-muted-foreground mb-4">We couldn't find anything matching "{debouncedQuery}".</p>
                      <button onClick={() => setQuery("")} className="text-sm text-primary hover:underline font-medium">
                        Clear search
                      </button>
                    </div>
                  ) : null}
                </div>
              )}
            </div>

          </div>

          {/* Right column — category grid, hidden when searching or on mobile */}
          {!isSearching && (
            <div className="hidden lg:grid grid-cols-2 gap-3 lg:col-span-6 lg:pl-4 relative">
              {categories.map((cat, i) => {
                const Icon = cat.icon;
                return (
                  <Link
                    key={cat.href}
                    href={cat.href}
                    style={{ animationDelay: `${i * 50}ms` }}
                    className={`group relative overflow-hidden rounded-2xl border border-border/40 bg-card/30 p-4 hover:bg-card/80 hover:border-border transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:hover:shadow-[0_8px_30px_rgba(255,255,255,0.02)] backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 ${cat.fullWidth ? 'col-span-2' : ''}`}
                  >
                    <div className={`${cat.iconBg} rounded-xl h-10 w-10 flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-1 ring-1 ring-inset ring-black/5 dark:ring-white/5`}>
                      <Icon className={`h-5 w-5 ${cat.iconColor}`} />
                    </div>

                    <h3 className="text-sm font-semibold text-foreground mb-1 transition-colors group-hover:text-primary">{cat.name}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed opacity-80">{cat.description}</p>
                  </Link>
                );
              })}
            </div>
          )}

        </div>
      </div>
    </section>
  );
};

export default HeroSection;
