"use client";

import { useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  BadgeCheck,
  MessageSquareText,
  Search,
  Sparkles,
  ThumbsUp,
} from "lucide-react";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useShowcaseProjects } from "@/hooks/use-showcase";
import type { ShowcaseProject } from "@/types";

function authorLabel(project: ShowcaseProject) {
  return project.author_name || project.author_username || "Claude AI community";
}

export default function ShowcaseClient({
  initialData,
}: {
  initialData: ShowcaseProject[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const search = searchParams.get("search") ?? "";

  const { data: projects } = useShowcaseProjects(
    { search: search || undefined },
    { initialData }
  );

  const setSearch = useCallback((value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set("search", value);
    else params.delete("search");
    const query = params.toString();
    router.push(query ? `/showcase?${query}` : "/showcase");
  }, [router, searchParams]);

  const listedProjects = projects ?? [];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="border-b border-border bg-card/35">
          <div className="mx-auto grid max-w-[1180px] gap-8 px-6 py-10 sm:px-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-end">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-[13px] font-medium text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                App showcase
              </div>
              <h1 className="max-w-[15ch] text-balance text-[clamp(34px,6vw,52px)] font-medium leading-[1.04] tracking-normal text-foreground">
                Claude apps from the community
              </h1>
              <p className="mt-4 max-w-[62ch] text-base leading-[1.65] text-muted-foreground">
                Browse apps, workflows, and tools built by Claude AI community
                members. Every submitted app must carry a verified directory
                badge before it appears here.
              </p>
            </div>

            <div className="rounded-[14px] border border-border bg-background p-4">
              <p className="text-sm font-medium text-foreground">Submit your app</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Create a public profile, request feedback, and earn a verified
                listing after adding the Claude AI Directory badge.
              </p>
              <Button className="mt-4 w-full" asChild>
                <Link href="/submit">
                  Start submission
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1180px] px-6 py-8 sm:px-8">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-foreground">Verified apps</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {listedProjects.length} listed {listedProjects.length === 1 ? "app" : "apps"}
              </p>
            </div>
            <div className="relative w-full md:w-[360px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search apps, categories, builders..."
                defaultValue={search}
                onChange={(event) => setSearch(event.target.value)}
                className="h-10 bg-card pl-10 text-sm"
              />
            </div>
          </div>

          {listedProjects.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {listedProjects.map((project) => (
                <Link
                  key={project.id}
                  href={`/showcase/${project.id}`}
                  className="group flex min-h-[260px] flex-col rounded-[12px] border border-border bg-card p-5 transition-colors hover:border-primary/35"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] bg-primary/12 text-base font-semibold text-primary">
                        {project.title.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h3 className="truncate text-base font-semibold text-foreground">
                          {project.title}
                        </h3>
                        <p className="mt-1 truncate text-xs text-muted-foreground">
                          by {authorLabel(project)}
                        </p>
                      </div>
                    </div>
                    {project.badge_verified && (
                      <Badge variant="secondary" className="shrink-0 gap-1 rounded-md">
                        <BadgeCheck className="h-3 w-3" />
                        Verified
                      </Badge>
                    )}
                  </div>

                  <p className="mt-4 line-clamp-2 text-sm font-medium leading-6 text-foreground/90">
                    {project.tagline || project.description}
                  </p>
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">
                    {project.description}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {project.category && (
                      <Badge variant="outline" className="rounded-md">
                        {project.category}
                      </Badge>
                    )}
                    {(project.tech_stack ?? []).slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="rounded-md">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="mt-auto flex items-center justify-between border-t border-border pt-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <MessageSquareText className="h-4 w-4" />
                      Feedback open
                    </span>
                    <span className="flex items-center gap-1.5">
                      <ThumbsUp className="h-4 w-4" />
                      {project.upvotes}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-[14px] border border-dashed border-border bg-card p-10 text-center">
              <p className="text-base font-medium text-foreground">No verified apps found</p>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                Try a different search or submit the first app for this category.
                Listings go public after the directory badge is verified.
              </p>
              <Button className="mt-5" asChild>
                <Link href="/submit">Submit an app</Link>
              </Button>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
