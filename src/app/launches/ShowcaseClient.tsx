"use client";

import { Fragment, useMemo, useState } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useLaunchVisited } from "@/components/launches/UpvoteBox";
import { UpvoteCount } from "@/components/feed/UpvoteMotion";
import { UpTriangle, upvotePillClass } from "@/components/launches/UpvotePill";
import { LaunchListRow } from "@/components/launches/LaunchListRow";
import { markLaunchVisited } from "@/lib/launch-visits";
import {
  Megaphone,
  ArrowRight,
  Plus,
  Rocket,
  Search,
} from "lucide-react";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { rankedLaunches } from "@/lib/home-community";
import { useSignIn } from "@/components/auth/SignInDialog";
import { useAuth } from "@/lib/auth";
import { SPONSOR_LAUNCH_PRICE, openAdvertiseDialog } from "@/lib/advertise";
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
  const website = project.app_url || project.demo_url;
  const visited = useLaunchVisited(project.id);
  // Only people who opened the website can upvote; removing a vote is always allowed.
  const locked = Boolean(website) && !visited && !voted;
  const [bump, setBump] = useState(0);
  const [shake, setShake] = useState(0);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (locked && website) {
      setShake((n) => n + 1);
      track("launch_upvote_gated", { slug: project.id });
      toast(`Try ${project.title} before you upvote`, {
        id: `gate-${project.id}`,
        description: "Upvotes come from people who opened the product.",
        action: {
          label: "Visit website",
          onClick: () => {
            window.open(website, "_blank", "noopener,noreferrer");
            markLaunchVisited(project.id);
          },
        },
      });
      return;
    }
    setBump((n) => n + 1);
    onVote();
  };

  return (
    <button
      key={`shake-${shake}`}
      type="button"
      onClick={handleClick}
      disabled={pending}
      aria-pressed={voted}
      aria-label={voted ? `Remove upvote from ${project.title}` : `Upvote ${project.title}`}
      title={!authenticated ? "Sign in to upvote" : voted ? "You upvoted this. Click to undo." : locked ? "Try the product first" : "Upvote this launch"}
      className={`relative cursor-pointer active:scale-95 ${upvotePillClass(voted)} ${locked && shake ? "upvote-shake" : ""} disabled:opacity-70`}
    >
      {voted && bump > 0 && (
        <span key={`float-${bump}`} aria-hidden className="upvote-float pointer-events-none absolute -top-1 left-1/2 text-[11px] font-bold text-primary">
          +1
        </span>
      )}
      <span className="relative inline-flex">
        {voted && bump > 0 && <span key={`ring-${bump}`} aria-hidden className="upvote-ring absolute inset-[-6px] rounded-full bg-primary/40" />}
        <span key={`arrow-${bump}`} className={`inline-flex ${bump > 0 ? "upvote-pop" : ""} ${voted ? "text-primary" : "text-muted-foreground"}`}>
          <UpTriangle className="h-2.5 w-3" />
        </span>
      </span>
      <UpvoteCount count={project.upvotes ?? 0} bump={bump} up={voted} />
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
  return (
    <LaunchListRow
      project={project}
      rank={rank}
      surface="launches_list"
      right={<VoteButton project={project} authenticated={authenticated} pending={pending} voted={voted} onVote={() => onVote(project)} />}
    />
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
      className="flex w-full items-center gap-4 rounded-[8px] border border-primary/30 bg-primary/[0.04] px-4 py-3.5 text-left transition-colors hover:border-primary/50"
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[6px] border border-dashed border-primary/40 text-primary">
        <Megaphone aria-hidden="true" className="h-3.5 w-3.5" />
      </span>
      <span className="min-w-0 flex-1 truncate text-[14px]">
        <span className="font-medium text-foreground">Your Claude product here</span>
        <span className="text-muted-foreground"> · Sponsor this spot for ${SPONSOR_LAUNCH_PRICE}/month</span>
      </span>
      <span className="shrink-0 rounded-[4px] border border-border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        Sponsored
      </span>
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
    return rankedLaunches(projects ?? []).filter((project) => {
      const key = projectKey(project);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
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
        <section className="mx-auto max-w-[880px] px-4 pb-4 pt-10 md:px-8 md:pt-14">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-primary">Launches</p>
              <h1 className="mt-3 max-w-[18ch] font-sans text-3xl font-semibold tracking-tight text-foreground md:text-[40px] md:leading-[1.1]">
                Apps built with Claude, supported by builders
              </h1>
              <p className="mt-3 text-[15px] text-muted-foreground">Try them, meet the makers and upvote your favorites.</p>
            </div>
            <Link
              href="/launches/submit"
              className="inline-flex h-10 shrink-0 items-center gap-1.5 self-start rounded-full bg-foreground px-4 text-sm font-medium text-background transition-colors hover:bg-foreground/85 sm:self-auto"
            >
              <Plus className="h-4 w-4" />
              Launch your app
            </Link>
          </div>

          {/* Free listing: the real badge and one line. */}
          <div className="mt-6 flex flex-col gap-3 rounded-[10px] border border-border px-4 py-3 sm:flex-row sm:items-center sm:gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element -- our own SVG badge (the generic slug renders the same artwork) */}
            <img src="/badge/your-app?theme=dark" alt="Listed on Claude AI Directory badge" width={156} height={38} className="h-[38px] w-[156px] shrink-0" />
            <p className="min-w-0 flex-1 text-[13.5px] text-muted-foreground">Launch for free. Add the badge to your site and get a dofollow backlink.</p>
            <Link href="/launches/submit" className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary hover:underline">
              Launch your app
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-[300px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search launches"
                className="h-10 w-full rounded-[10px] border border-transparent bg-foreground/[0.06] pl-10 pr-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-[var(--cad-line-hover)]"
              />
            </div>
            {filters.length > 1 && (
              <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter launches">
                {filters.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    aria-pressed={activeFilter === f.id}
                    onClick={() => setActiveFilter(f.id)}
                    className={`cursor-pointer rounded-full px-3 py-1.5 text-xs transition ${
                      activeFilter === f.id ? "bg-foreground text-background" : "bg-foreground/[0.06] text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {f.label}
                    {f.id !== "all" && <span className="ml-1.5 opacity-60">{f.count}</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="mt-8 flex items-center gap-3">
            <h2 className="shrink-0 font-mono text-[11px] uppercase tracking-[0.16em] text-foreground">All launches</h2>
            <span className="h-px flex-1 bg-border" aria-hidden />
            <span className="shrink-0 text-xs text-muted-foreground">Ranked by upvotes</span>
          </div>
        </section>

        <section className="mx-auto max-w-[880px] px-4 md:px-8">
          <ol>
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
                  {index === Math.min(2, visibleProjects.length - 1) ? (
                    <li className="border-b border-border py-3">
                      <SponsoredLaunchSlot />
                    </li>
                  ) : null}
                </Fragment>
              ))
            ) : (
              <li className="px-4 py-16 text-center md:px-6">
                <Rocket className="mx-auto h-10 w-10 text-muted-foreground/35" />
                <p className="mt-4 text-base font-medium text-foreground">No launches found</p>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                  Try another search or submit the first launch for this category.
                </p>
                <Button className="mt-5" asChild>
                  <Link href="/launches/submit">Submit launch</Link>
                </Button>
              </li>
            )}
          </ol>
        </section>
      </main>
      <Footer />
    </div>
  );
}
