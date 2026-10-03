"use client";

import { Fragment, useMemo, useState } from "react";
import { TOPICS, topicSlug } from "@/lib/launch-options";
import Link from "next/link";
import { LaunchListRow } from "@/components/launches/LaunchListRow";
import { LaunchVoteButton } from "@/components/launches/LaunchVoteButton";
import {
  Megaphone,
  ArrowRight,
  Rocket,
  Search,
} from "lucide-react";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { rankedLaunches } from "@/lib/home-community";
import { SPONSOR_LAUNCH_PRICE, openAdvertiseDialog } from "@/lib/advertise";
import { useShowcaseProjects } from "@/hooks/use-showcase";
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

function LaunchRow({ project, rank }: { project: ShowcaseProject; rank: number }) {
  return (
    <LaunchListRow
      project={project}
      rank={rank}
      surface="launches_list"
      right={<LaunchVoteButton project={project} placement="launches_list" />}
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
  initialTopic = "",
}: {
  initialData: ShowcaseProject[];
  /** From ?topic= (shareable topic view). */
  initialTopic?: string;
}) {
  const [activeFilter, setActiveFilter] = useState<LaunchFilter>("all");
  const [topic, setTopic] = useState(initialTopic);
  const pickTopic = (next: string) => {
    setTopic(next);
    const params = new URLSearchParams(window.location.search);
    if (next) params.set("topic", topicSlug(next));
    else params.delete("topic");
    const qs = params.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${qs ? `?${qs}` : ""}`);
  };
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

  const topics = useMemo(
    () =>
      TOPICS.map((name) => ({ name, count: listedProjects.filter((p) => p.topics?.includes(name)).length })).filter((t) => t.count > 0),
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
      if (topic && !project.topics?.includes(topic)) return false;
      if (normalizedQuery && !haystack.includes(normalizedQuery)) return false;
      return true;
    });
  }, [activeFilter, listedProjects, query, topic]);


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

          {/* What launches are for: only topics that have launches. */}
          {topics.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-x-1 gap-y-1.5" role="group" aria-label="Filter by topic">
              <span className="mr-1 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Topic</span>
              {topics.map(({ name, count }) => (
                <button
                  key={name}
                  type="button"
                  aria-pressed={topic === name}
                  onClick={() => pickTopic(topic === name ? "" : name)}
                  className={`rounded-[6px] px-2 py-1 text-[12.5px] transition-colors ${
                    topic === name ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-foreground/[0.06] hover:text-foreground"
                  }`}
                >
                  {name}
                  <span className="ml-1 font-mono text-[10.5px] opacity-60">{count}</span>
                </button>
              ))}
            </div>
          )}

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
                  <LaunchRow project={project} rank={index + 1} />
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
