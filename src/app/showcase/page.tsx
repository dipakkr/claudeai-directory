"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, ThumbsUp, Github, ExternalLink, ArrowUpRight } from "lucide-react";
import { useShowcaseProjects } from "@/hooks/use-showcase";

const Showcase = () => {
  const [search, setSearch] = useState("");
  const { data: projects, isLoading } = useShowcaseProjects({
    search: search || undefined,
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container py-10">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-foreground mb-2">Showcase</h1>
            <p className="text-sm text-muted-foreground">
              Projects built with Claude AI by the community
            </p>
          </div>

          <div className="relative max-w-md mb-6">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 bg-card border-border pl-10 text-sm"
            />
          </div>

          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-48 rounded-lg" />
              ))}
            </div>
          ) : (
            <>
              <p className="mb-4 text-xs text-muted-foreground">
                {projects?.length ?? 0} projects
              </p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {(projects ?? []).map((project) => (
                  <div
                    key={project.id}
                    className="group rounded-lg border border-border bg-card overflow-hidden hover:border-primary/20 transition-all"
                  >
                    <div className="aspect-video bg-muted/50 flex items-center justify-center">
                      <span className="text-3xl text-muted-foreground/30">
                        {project.title[0]?.toUpperCase()}
                      </span>
                    </div>
                    <div className="p-4">
                      <h3 className="text-sm font-medium text-foreground mb-1">{project.title}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                        {project.description}
                      </p>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {project.tech_stack.slice(0, 3).map((t) => (
                          <Badge key={t} variant="secondary" className="text-[10px] px-1.5 py-0">
                            {t}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <ThumbsUp className="h-3 w-3" />
                          {project.upvotes}
                        </span>
                        <div className="flex items-center gap-2">
                          {project.github_url && (
                            <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                              <Github className="h-3.5 w-3.5" />
                            </a>
                          )}
                          {project.demo_url && (
                            <a href={project.demo_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {(projects ?? []).length === 0 && (
                <div className="py-16 text-center">
                  <p className="text-sm text-muted-foreground">No projects found.</p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Showcase;
