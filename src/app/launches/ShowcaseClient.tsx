"use client";

import { Fragment, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowUp,
  BadgeCheck,
  MessageCircle,
  Plus,
  Rocket,
  Search,
  Tag,
} from "lucide-react";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { faviconFor } from "@/lib/directory";
import { publicLaunches } from "@/lib/home-community";
import { useAuth } from "@/lib/auth";
import { useShowcaseProjects, useUpvoteShowcase } from "@/hooks/use-showcase";
import type { ShowcaseProject } from "@/types";

function authorLabel(project: ShowcaseProject) {
  return project.author_name || project.author_username || "Claude AI community";
}

function normalizeCategory(project: ShowcaseProject) {
  return project.category?.trim() || project.tech_stack?.[0]?.trim() || "Claude app";
}

function projectKey(project: ShowcaseProject) {
  return [
    project.title.toLowerCase().trim(),
    authorLabel(project).toLowerCase().trim(),
    (project.tagline || project.description).toLowerCase().trim().slice(0, 120),
  ].join("|");
}

function shortPitch(project: ShowcaseProject) {
  return project.tagline?.trim() || project.description.trim();
}

function LaunchIcon({ project }: { project: ShowcaseProject }) {
  const src = project.logo_url || faviconFor(project.app_url || project.demo_url);
  const fallback = project.title.trim()[0]?.toUpperCase() || "L";

  return (
    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-background shadow-sm sm:h-16 sm:w-16">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- dynamic favicon for submitted launch URLs
        <img
          src={src}
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />
      ) : (
        <span className="text-xl font-semibold text-muted-foreground">{fallback}</span>
      )}
    </div>
  );
}

function RankMark({ rank }: { rank: number }) {
  if (rank <= 3) {
    return (
      <div className="flex w-10 shrink-0 flex-col items-center justify-center text-primary">
        <span className="text-base font-semibold leading-none">#{rank}</span>
      </div>
    );
  }

  return (
    <div className="flex w-10 shrink-0 items-center justify-center font-mono text-sm text-muted-foreground">
      #{rank}
    </div>
  );
}

function VoteButton({
  project,
  authenticated,
  pending,
  onVote,
}: {
  project: ShowcaseProject;
  authenticated: boolean;
  pending: boolean;
  onVote: () => void;
}) {
  const [animating, setAnimating] = useState(false);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!animating) {
      setAnimating(true);
      onVote();
      setTimeout(() => setAnimating(false), 600);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending || !authenticated}
      aria-label={authenticated ? `Upvote ${project.title}` : "Sign in to upvote"}
      title={authenticated ? "Upvote this launch" : "Sign in to upvote"}
      className={`flex h-14 w-12 shrink-0 flex-col items-center justify-center gap-0.5 rounded-xl border transition sm:h-16 sm:w-14 ${
        authenticated
          ? "border-border bg-background text-foreground shadow-sm hover:border-[var(--cad-line-hover)] hover:bg-card cursor-pointer"
          : "border-border/50 bg-background/50 text-muted-foreground cursor-not-allowed"
      } ${animating ? "scale-105 bg-primary/10 border-primary" : ""} disabled:pointer-events-none`}
    >
      <ArrowUp className={`h-4 w-4 transition-transform ${animating ? "scale-125" : ""}`} aria-hidden="true" />
      <span className={`text-base font-semibold leading-none transition ${animating ? "scale-110" : ""}`}>
        {project.upvotes ?? 0}
      </span>
    </button>
  );
}

function LaunchRow({
  project,
  rank,
  onVote,
  authenticated,
  pending,
}: {
  project: ShowcaseProject;
  rank: number;
  onVote: (project: ShowcaseProject) => void;
  authenticated: boolean;
  pending: boolean;
}) {
  const category = normalizeCategory(project);
  const tags = [category, ...(project.tech_stack ?? []).filter((tag) => tag !== category)].slice(0, 3);

  return (
    <article className={`border-b border-border ${rank <= 3 ? "bg-primary/[0.045]" : "bg-background"}`}>
      <div className="flex items-center gap-3 px-4 py-4 md:px-6">
        <RankMark rank={rank} />
        <Link href={`/showcase/${project.id}`} className="flex min-w-0 flex-1 items-center gap-4">
          <LaunchIcon project={project} />
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-center gap-2">
              <h2 className="truncate text-base font-semibold leading-tight text-foreground sm:text-lg">
                {project.title}
              </h2>
              {project.badge_verified && (
                <BadgeCheck className="h-4 w-4 shrink-0 fill-amber-400 text-amber-400" aria-hidden="true" />
              )}
            </div>
            <p className="mt-1.5 line-clamp-1 text-sm leading-5 text-muted-foreground">
              {shortPitch(project)}
            </p>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
                Feedback
              </span>
              <span className="inline-flex min-w-0 items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span className="truncate">{tags.join(", ")}</span>
              </span>
            </div>
          </div>
        </Link>
        <VoteButton
          project={project}
          authenticated={authenticated}
          pending={pending}
          onVote={() => onVote(project)}
        />
      </div>
    </article>
  );
}

function SponsoredLaunchSlot() {
  return (
    <Link
      href="/advertise"
      className="block border-b border-border bg-[linear-gradient(100deg,rgba(251,191,36,0.08),rgba(255,255,255,0.02),rgba(168,85,247,0.08))] transition-colors hover:bg-card/55"
    >
      <div className="grid gap-5 px-4 py-8 md:grid-cols-[72px_minmax(0,1fr)_104px] md:items-center md:px-6">
        <div className="hidden justify-center md:flex">
          <span className="origin-center -rotate-90 font-mono text-xs font-semibold uppercase tracking-[0.32em] text-muted-foreground">
            Sponsored
          </span>
        </div>
        <div className="relative min-w-0">
          <p className="text-balance text-2xl font-normal leading-tight text-foreground sm:text-[30px]">
            Put your Claude product in front of builders
          </p>
          <p className="mt-4 inline-flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            <span className="h-px w-8 bg-foreground" />
            Sponsor a launch slot
          </p>
        </div>
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-border bg-background shadow-sm md:justify-self-end">
          <div className="grid grid-cols-2 gap-1.5">
            <span className="h-6 w-6 rounded-md bg-foreground" />
            <span className="h-6 w-6 rotate-45 rounded-md bg-primary" />
            <span className="h-6 w-6 rounded-md bg-foreground" />
            <span className="h-6 w-6 rounded-md bg-foreground" />
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function ShowcaseClient({
  initialData,
}: {
  initialData: ShowcaseProject[];
}) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const upvote = useUpvoteShowcase();
  const [activeCategory, setActiveCategory] = useState("All");
  const [query, setQuery] = useState("");

  const { data: projects } = useShowcaseProjects(undefined, { initialData });

  const listedProjects = useMemo(() => {
    const seen = new Set<string>();
    return publicLaunches(projects ?? [])
      .filter((project) => {
        const key = projectKey(project);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .sort((a, b) => (b.upvotes ?? 0) - (a.upvotes ?? 0));
  }, [projects]);

  const categories = useMemo(() => {
    const values = new Set(listedProjects.map(normalizeCategory));
    return ["All", ...Array.from(values).sort((a, b) => a.localeCompare(b))];
  }, [listedProjects]);

  const visibleProjects = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return listedProjects.filter((project) => {
      const haystack = [
        project.title,
        project.tagline,
        project.description,
        normalizeCategory(project),
        ...(project.tech_stack ?? []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (activeCategory !== "All" && normalizeCategory(project) !== activeCategory) return false;
      if (normalizedQuery && !haystack.includes(normalizedQuery)) return false;
      return true;
    });
  }, [activeCategory, listedProjects, query]);

  const handleVote = (project: ShowcaseProject) => {
    if (!isAuthenticated) {
      toast.error("Sign in to upvote launches", {
        action: { label: "Sign in", onClick: () => router.push("/login") },
      });
      return;
    }

    upvote.mutate(project.id, {
      onSuccess: () => toast.success("Upvoted"),
      onError: () => toast.error("Could not upvote this launch"),
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="mx-auto max-w-[1120px] px-4 pb-6 pt-8 md:px-8 md:pt-11">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
                Community launches
              </p>
              <h1 className="mt-2 max-w-[720px] text-balance text-[28px] font-normal leading-tight text-foreground md:text-[38px]">
                Discover Claude products and their makers
              </h1>
            </div>
            <Button asChild className="h-9 self-start px-4 text-sm">
              <Link href="/showcase/submit">
                <Plus className="h-4 w-4" />
                Submit launch
              </Link>
            </Button>
          </div>

          <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative max-w-[420px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search launches"
                className="h-10 w-full rounded-lg border border-border bg-card pl-10 pr-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-[var(--cad-line-hover)]"
              />
            </div>
            {categories.length > 1 && (
              <div className="flex flex-wrap gap-2">
                {categories.slice(0, 6).map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setActiveCategory(category)}
                    className={`rounded-lg border px-3 py-1.5 text-xs transition ${
                      activeCategory === category
                        ? "border-foreground bg-foreground text-background"
                        : "border-border bg-card text-muted-foreground hover:border-[var(--cad-line-hover)] hover:text-foreground"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="mx-auto max-w-[1120px] px-4 md:px-8">
          <div className="overflow-hidden rounded-2xl border border-border">
            {visibleProjects.length > 0 ? (
              visibleProjects.map((project, index) => (
                <Fragment key={project.id}>
                  <LaunchRow
                    project={project}
                    rank={index + 1}
                    authenticated={isAuthenticated}
                    pending={upvote.isPending}
                    onVote={handleVote}
                  />
                  {index === Math.min(2, visibleProjects.length - 1) ? <SponsoredLaunchSlot /> : null}
                </Fragment>
              ))
            ) : (
              <div className="px-4 py-16 text-center md:px-6">
                <Rocket className="mx-auto h-10 w-10 text-muted-foreground/35" />
                <p className="mt-4 text-base font-medium text-foreground">No launches found</p>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                  Try another search or submit the first launch for this category.
                </p>
                <Button className="mt-5" asChild>
                  <Link href="/showcase/submit">Submit launch</Link>
                </Button>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
