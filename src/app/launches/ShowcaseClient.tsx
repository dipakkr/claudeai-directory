"use client";

import { Fragment, useMemo, useState } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowUp,
  Megaphone,
  BadgeCheck,
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
import { useSignIn } from "@/components/auth/SignInDialog";
import { useAuth } from "@/lib/auth";
import { openAdvertiseDialog } from "@/lib/advertise";
import { myLaunchUpvotesQuery, useMyLaunchUpvotes, useShowcaseProjects, useUpvoteShowcase } from "@/hooks/use-showcase";
import type { ShowcaseProject } from "@/types";
import { track } from "@/lib/analytics";

function authorLabel(project: ShowcaseProject) {
  return project.author_name || project.author_username || "Claude AI community";
}

function normalizeCategory(project: ShowcaseProject) {
  return project.category?.trim() || project.tech_stack?.[0]?.trim() || "Claude app";
}

// Fixed launch filters, derived from real fields (category, website, GitHub repo).
type LaunchFilter = "all" | "web" | "mcp" | "claude" | "open";
const LAUNCH_FILTERS: { id: LaunchFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "web", label: "Web apps" },
  { id: "mcp", label: "MCP servers" },
  { id: "claude", label: "Skills & plugins" },
  { id: "open", label: "Open source" },
];

function launchKind(project: ShowcaseProject): Exclude<LaunchFilter, "all" | "open"> | null {
  const category = (project.category || "").toLowerCase();
  if (category.includes("mcp")) return "mcp";
  if (/skill|agent|plugin|workflow/.test(category)) return "claude";
  if (category.includes("web app") || project.app_url || project.demo_url) return "web";
  return null;
}

function matchesFilter(project: ShowcaseProject, filter: LaunchFilter) {
  if (filter === "all") return true;
  if (filter === "open") return Boolean(project.github_url);
  return launchKind(project) === filter;
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
  voted,
  onVote,
}: {
  project: ShowcaseProject;
  authenticated: boolean;
  pending: boolean;
  voted: boolean;
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
      disabled={pending}
      aria-pressed={voted}
      aria-label={voted ? `Remove upvote from ${project.title}` : `Upvote ${project.title}`}
      title={!authenticated ? "Sign in to upvote" : voted ? "You upvoted this. Click to undo." : "Upvote this launch"}
      className={`flex h-14 w-12 shrink-0 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-xl border shadow-sm transition sm:h-16 sm:w-14 ${
        voted
          ? "border-primary bg-primary/10 text-primary"
          : "border-border bg-background text-foreground hover:border-[var(--cad-line-hover)] hover:bg-card"
      } ${animating ? "scale-105" : ""} disabled:opacity-70`}
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
  voted,
}: {
  project: ShowcaseProject;
  rank: number;
  onVote: (project: ShowcaseProject) => void;
  authenticated: boolean;
  pending: boolean;
  voted: boolean;
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
          voted={voted}
          onVote={() => onVote(project)}
        />
      </div>
    </article>
  );
}

function SponsoredLaunchSlot() {
  return (
    <button
      type="button"
      onClick={() => {
        track("ad_slot_clicked", { slot: "launch_row" });
        openAdvertiseDialog(undefined, "launch");
      }}
      className="block w-full text-left border-b border-border bg-[linear-gradient(100deg,rgba(251,191,36,0.08),rgba(255,255,255,0.02),rgba(168,85,247,0.08))] transition-colors hover:bg-card/55"
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
            Sponsor a launch slot · $99/month
          </p>
        </div>
        <div className="flex h-20 w-20 items-center justify-center md:justify-self-end">
          {/* Our own mark for the paid slot: get seen by builders. */}
          <Megaphone aria-hidden="true" className="h-10 w-10 -rotate-12 text-primary" strokeWidth={1.5} />
        </div>
      </div>
    </button>
  );
}

export default function ShowcaseClient({
  initialData,
}: {
  initialData: ShowcaseProject[];
}) {
  const queryClient = useQueryClient();
  const { requireAuth } = useSignIn();
  const { isAuthenticated } = useAuth();
  const upvote = useUpvoteShowcase();
  const { data: myUpvotes } = useMyLaunchUpvotes(isAuthenticated);
  const votedSlugs = useMemo(() => new Set(myUpvotes ?? []), [myUpvotes]);
  const [activeFilter, setActiveFilter] = useState<LaunchFilter>("all");
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

  const filters = useMemo(
    () =>
      LAUNCH_FILTERS.map((f) => ({ ...f, count: listedProjects.filter((p) => matchesFilter(p, f.id)).length })).filter(
        (f) => f.id === "all" || f.count > 0,
      ),
    [listedProjects],
  );

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

      if (!matchesFilter(project, activeFilter)) return false;
      if (normalizedQuery && !haystack.includes(normalizedQuery)) return false;
      return true;
    });
  }, [activeFilter, listedProjects, query]);

  const handleVote = (project: ShowcaseProject) =>
    void requireAuth(`upvote ${project.title}`, async ({ resumed }) => {
      // Just signed in: the upvote is a toggle, so don't undo an earlier one.
      if (resumed && (await queryClient.fetchQuery(myLaunchUpvotesQuery)).includes(project.id)) {
        toast.success(`You already upvoted ${project.title}`);
        return;
      }
      upvote.mutate(project.id, {
        onSuccess: (updated) => {
          if (updated.voted !== false) track("launch_upvoted", { slug: project.id, placement: "launches_list" });
          toast.success(updated.voted === false ? "Upvote removed" : `Upvoted ${project.title}`);
        },
        onError: () => toast.error("Could not save your upvote"),
      });
    });

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
            {filters.length > 1 && (
              <div className="flex flex-wrap gap-2" role="group" aria-label="Filter launches">
                {filters.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    aria-pressed={activeFilter === f.id}
                    onClick={() => setActiveFilter(f.id)}
                    className={`cursor-pointer rounded-lg border px-3 py-1.5 text-xs transition ${
                      activeFilter === f.id
                        ? "border-foreground bg-foreground text-background"
                        : "border-border bg-card text-muted-foreground hover:border-[var(--cad-line-hover)] hover:text-foreground"
                    }`}
                  >
                    {f.label}
                    {f.id !== "all" && <span className="ml-1.5 opacity-60">{f.count}</span>}
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
                    pending={upvote.isPending && upvote.variables === project.id}
                    voted={votedSlugs.has(project.id)}
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
