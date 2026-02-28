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
    description: "Slash commands & reusable workflows",
    href: "/skills",
    icon: Wrench,
    iconColor: "text-primary",
    iconBg: "bg-primary/10",
  },
  {
    name: "Prompts",
    description: "Battle-tested prompts, ready to paste",
    href: "/prompts",
    icon: FileText,
    iconColor: "text-primary",
    iconBg: "bg-primary/10",
  },
  {
    name: "MCP Servers",
    description: "Connect Claude to your entire stack",
    href: "/mcp",
    icon: Server,
    iconColor: "text-primary",
    iconBg: "bg-primary/10",
  },
  {
    name: "Guides",
    description: "Deep dives for Claude Code power users",
    href: "/guides",
    icon: BookOpen,
    iconColor: "text-primary",
    iconBg: "bg-primary/10",
  },
  {
    name: "Context Generator",
    description: "Auto-generate your project's CLAUDE.md file",
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
    <section className="pt-10 pb-8 md:pt-24 md:pb-20 relative overflow-x-clip">
      <div className="container relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center max-w-7xl mx-auto">

          {/* Left column */}
          <div className="lg:col-span-6 lg:pr-8">
            {/* Label */}
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary mb-6 shadow-sm">
              <span className="relative flex h-1.5 w-1.5 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary"></span>
              </span>
              The Claude Code community hub
            </div>

            {/* Headline */}
            <h1 className="text-3xl md:text-5xl font-normal tracking-tight text-foreground leading-[1.15] mb-5">
              Everything you need<br />
              to build with <span className="text-primary font-medium">Claude</span>
            </h1>

            <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-10 max-w-lg">
              Discover MCP servers, skills, and prompts crafted by the Claude community. Connect your tools, sharpen your workflows, and ship faster with Claude Code.
            </p>

            {/* Search */}
            <div className="relative w-full max-w-xl text-left mb-6">
              <div className="relative group">
                <div className="relative bg-transparent rounded-md border border-border flex items-center transition-all duration-300 focus-within:border-foreground/30 shadow-sm">
                  <Search className="absolute left-4 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search MCPs, skills, prompts, guides..."
                    className="w-full min-w-0 bg-transparent pl-11 pr-11 py-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none rounded-md"
                  />
                  {isSearching && (
                    <button
                      onClick={() => setQuery("")}
                      className="absolute right-3 p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Search results */}
              {isSearching && (
                <div className="absolute top-full left-0 right-0 mt-2 z-50">
                  {isLoading ? (
                    <div className="rounded-md border border-border bg-card p-8 text-center shadow-lg">
                      <div className="h-5 w-5 border-2 border-border border-t-foreground rounded-full animate-spin mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">Searching collective...</p>
                    </div>
                  ) : (results ?? []).length > 0 ? (
                    <div className="rounded-md border border-border bg-card shadow-lg divide-y divide-border overflow-hidden max-h-[400px] overflow-y-auto">
                      {(results ?? []).map((result) => {
                        const route = typeRoutes[result._type] ?? "/";
                        const icon = typeIcons[result._type];
                        const label = typeLabels[result._type] ?? result._type;
                        const itemSlug = result.slug || result._id || result.id;
                        return (
                          <Link
                            key={`${result._type}-${itemSlug}`}
                            href={`${route}/${itemSlug}`}
                            className="flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
                          >
                            <div className="mt-0.5 shrink-0 bg-transparent p-1.5 rounded border border-border">{icon}</div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-sm font-medium text-foreground truncate">
                                  {result.title ?? result.name}
                                </span>
                                <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded shrink-0 border border-border">
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
                    <div className="rounded-md border border-border bg-card p-8 text-center shadow-lg">
                      <p className="text-sm font-medium text-foreground mb-1">No results found</p>
                      <p className="text-sm text-muted-foreground mb-3">We couldn't find anything matching "{debouncedQuery}".</p>
                      <button onClick={() => setQuery("")} className="text-sm text-foreground hover:underline font-medium">
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
                    className={`group relative overflow-hidden rounded-xl border border-border bg-transparent p-4 transition-colors duration-200 hover:border-foreground/20 hover:bg-muted/30 ${cat.fullWidth ? 'col-span-2' : ''}`}
                  >
                    <div className={`${cat.iconBg} rounded-md h-8 w-8 flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-105 group-hover:-translate-y-0.5`}>
                      <Icon className={`h-4 w-4 ${cat.iconColor}`} />
                    </div>

                    <h3 className="text-sm font-medium text-foreground mb-1">{cat.name}</h3>
                    <p className="text-[11px] text-muted-foreground line-clamp-1">{cat.description}</p>
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
