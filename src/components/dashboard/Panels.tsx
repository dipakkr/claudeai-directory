"use client";

import { hasDofollow, isLaunchLive } from "@/lib/launch-options";
import Link from "next/link";
import { ArrowRight, BarChart3, Package, Pencil, Rocket } from "lucide-react";
import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api";
import { LinkUpgradeDialog } from "@/components/launches/LinkUpgradeDialog";

import { faviconFor } from "@/lib/directory";
import type { DashboardSummary, MySubmission } from "@/hooks/use-dashboard";
import type { ShowcaseProject } from "@/types";

/* ---------- shared ---------- */

export function timeAgo(value?: string) {
  if (!value) return "";
  const seconds = Math.floor((Date.now() - new Date(value).getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function PanelHeader({ title, description, action }: { title: string; description?: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="font-sans text-lg font-semibold tracking-tight text-foreground">{title}</h2>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}

/** Quiet mono label with a rule, like the launch pages. */
function SectionLabel({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="mb-3 flex items-center gap-3">
      <h3 className="shrink-0 font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-foreground">{title}</h3>
      <span className="h-px flex-1 bg-border" aria-hidden="true" />
      {action}
    </div>
  );
}

export function PrimaryAction({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex h-9 items-center gap-1.5 rounded-full bg-foreground px-4 text-sm font-medium text-background transition-colors hover:bg-foreground/85"
    >
      {children}
    </Link>
  );
}

function QuietAction({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="inline-flex shrink-0 items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground">
      {children}
      <ArrowRight className="h-3 w-3" />
    </Link>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  body,
  action,
}: {
  icon: typeof Rocket;
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-[10px] border border-dashed border-border px-6 py-14 text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </span>
      <p className="mt-4 text-sm font-medium text-foreground">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{body}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

function StatusPill({ tone, children }: { tone: "live" | "wait" | "bad" | "muted"; children: ReactNode }) {
  const tones = {
    live: "border-success/30 bg-success/10 text-success",
    wait: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
    bad: "border-destructive/30 bg-destructive/10 text-destructive",
    muted: "border-border text-muted-foreground",
  };
  return <span className={`inline-flex shrink-0 rounded-[4px] border px-1.5 py-px font-mono text-[10px] uppercase tracking-[0.08em] ${tones[tone]}`}>{children}</span>;
}

const listClass = "divide-y divide-border overflow-hidden rounded-[10px] border border-border bg-card";

const plural = (n: number | undefined, word: string) => `${(n ?? 0).toLocaleString("en-US")} ${n === 1 ? word : `${word}s`}`;

type LaunchMetrics = Record<string, { impressions: number; clicks: number }>;

/** All-time impressions and website clicks per launch of the signed-in maker. */
function useMyLaunchMetrics(enabled: boolean) {
  return useQuery({
    queryKey: ["launch-metrics", "mine"],
    queryFn: () => api.get<LaunchMetrics>("/metrics/my-launches"),
    enabled,
    staleTime: 60_000,
  });
}

/* ---------- analytics ---------- */

/** A number and a plain label, no box. */
function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <span className="block font-sans text-[26px] font-semibold tabular-nums leading-none text-foreground">{value.toLocaleString("en-US")}</span>
      <span className="mt-1.5 block text-[13px] text-muted-foreground">{label}</span>
    </div>
  );
}

/** How your launches are doing: the totals, then one row per live launch. */
export function AnalyticsPanel({ summary, apps, loading }: { summary?: DashboardSummary; apps: ShowcaseProject[]; loading: boolean }) {
  const live = apps.filter(isLaunchLive);
  const { data: metrics } = useMyLaunchMetrics(live.length > 0);
  if (loading) return <SkeletonRows />;
  if (live.length === 0) {
    return (
      <section>
        <PanelHeader title="Analytics" description="Upvotes, page views and website clicks for your launches." />
        <EmptyState
          icon={BarChart3}
          title="Nothing to measure yet"
          body="Launch what you built with Claude and the numbers show up here."
          action={<PrimaryAction href="/launches/submit">Launch an app</PrimaryAction>}
        />
      </section>
    );
  }
  const sum = (pick: (app: ShowcaseProject) => number | undefined) => live.reduce((n, app) => n + (pick(app) ?? 0), 0);
  const upvotes = summary?.launches.upvotes ?? sum((a) => a.upvotes);
  const views = summary?.launches.views ?? sum((a) => a.views);
  const clicks = live.reduce((n, app) => n + (metrics?.[app.id]?.clicks ?? 0), 0);
  const impressions = live.reduce((n, app) => n + (metrics?.[app.id]?.impressions ?? 0), 0);
  return (
    <section className="space-y-8">
      <PanelHeader title="Analytics" description="All time, across your live launches." />
      <div className="flex flex-wrap gap-x-12 gap-y-5">
        <Stat label={live.length === 1 ? "live launch" : "live launches"} value={live.length} />
        <Stat label={upvotes === 1 ? "upvote" : "upvotes"} value={upvotes} />
        <Stat label={views === 1 ? "page view" : "page views"} value={views} />
        <Stat label={clicks === 1 ? "website click" : "website clicks"} value={clicks} />
        <Stat label="impressions" value={impressions} />
      </div>
      <div>
        <SectionLabel title="By launch" />
        <ul className={listClass}>
          {live.map((app) => {
            const m = metrics?.[app.id];
            return (
              <li key={app.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3.5">
                <LaunchLogo app={app} />
                <Link href={`/launches/${app.id}`} className="min-w-0 flex-1 truncate font-sans text-[15px] font-medium text-foreground hover:underline">
                  {app.title}
                </Link>
                <p className="w-full pl-14 text-[13px] tabular-nums text-muted-foreground sm:w-auto sm:pl-0">
                  {plural(app.upvotes, "upvote")} · {plural(app.views, "view")} · {plural(m?.clicks, "click")}
                </p>
                <Link href={`/launches/${app.id}/analytics`} className="inline-flex items-center gap-1 pl-14 text-sm font-medium text-foreground hover:text-primary sm:pl-0">
                  Details
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                {!hasDofollow(app) && app.status !== "rejected" && (
                  <div className="flex w-full flex-col gap-2 rounded-[8px] border border-primary/25 bg-primary/[0.05] px-3 py-2.5 sm:ml-14 sm:w-[calc(100%-3.5rem)] sm:flex-row sm:items-center sm:gap-3">
                    <span className="w-fit shrink-0 rounded-[4px] border border-border bg-background px-1.5 py-px font-mono text-[11px] text-muted-foreground">nofollow</span>
                    <p className="min-w-0 flex-1 text-[13px] leading-5 text-muted-foreground">
                      Your link is nofollow, and launches with our badge rank above yours. Add our badge for free, or upgrade your link for $39.
                    </p>
                    <LinkUpgradeDialog app={app} />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/* ---------- submissions: launches + resources ---------- */

function LaunchLogo({ app }: { app: ShowcaseProject }) {
  const logo = app.logo_url || faviconFor(app.app_url || app.demo_url);
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-[10px] border border-border bg-background text-sm font-semibold text-muted-foreground">
      {logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logo} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
      ) : (
        app.title.slice(0, 1).toUpperCase()
      )}
    </span>
  );
}

/** One row per launch: logo, name and status, then what to do next. */
export function LaunchRows({ apps, loading }: { apps: ShowcaseProject[]; loading: boolean }) {
  if (loading) return <SkeletonRows />;
  if (apps.length === 0) {
    return (
      <EmptyState
        icon={Rocket}
        title="No launches yet"
        body="Launch what you built with Claude to get a public page, upvotes and feedback from builders."
        action={<PrimaryAction href="/launches/submit">Launch your first app</PrimaryAction>}
      />
    );
  }
  return (
    <ul className={listClass}>
      {apps.map((app) => {
        const rejected = app.status === "rejected";
        const live = isLaunchLive(app);
        return (
          <li key={app.id} className="flex flex-wrap items-center gap-x-4 gap-y-3 px-4 py-4">
            <LaunchLogo app={app} />
            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 items-center gap-2">
                <Link href={live ? `/launches/${app.id}` : `/launches/${app.id}/edit`} className="truncate font-sans text-[15px] font-medium text-foreground hover:underline">
                  {app.title}
                </Link>
                {/* Live is the normal state; only flag the ones that are not. */}
                {rejected ? <StatusPill tone="bad">Not approved</StatusPill> : !live && <StatusPill tone="wait">Draft</StatusPill>}
              </div>
              <p className="mt-1 truncate text-[13px] text-muted-foreground">
                {live ? `Live · ${timeAgo(app.listed_at || app.created_at)}` : rejected ? "Edit it and resubmit, or contact us" : "Complete the listing to make it public"}
              </p>
            </div>
            <div className="flex w-full items-center gap-4 pl-14 text-sm sm:w-auto sm:pl-0">
              {(live || rejected) && (
                <Link href={`/launches/${app.id}/edit`} className="inline-flex items-center gap-1.5 font-medium text-foreground hover:text-primary">
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </Link>
              )}
              {!live && !rejected && (
                // Opens the draft; its "Complete listing" button then offers the badge or publishing without it.
                <Link
                  href={`/launches/${encodeURIComponent(app.id)}/edit`}
                  className="inline-flex h-8 items-center gap-1 rounded-[8px] border border-primary/40 px-3 text-[13px] font-medium text-primary transition-colors hover:bg-primary/10"
                >
                  Complete listing
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>
            {/* The website link is nofollow until our badge is on the maker's site; adding it is free. */}
            {live && !hasDofollow(app) && (
              <div className="flex w-full flex-col gap-2 rounded-[8px] border border-primary/25 bg-primary/[0.05] px-3 py-2.5 sm:ml-14 sm:w-[calc(100%-3.5rem)] sm:flex-row sm:items-center sm:gap-3">
                <span className="w-fit shrink-0 rounded-[4px] border border-border bg-background px-1.5 py-px font-mono text-[11px] text-muted-foreground">nofollow</span>
                <p className="min-w-0 flex-1 text-[13px] leading-5 text-muted-foreground">
                  Your link is nofollow, and launches with our badge rank above yours. Add our badge for free, or upgrade your link for $39.
                </p>
                <LinkUpgradeDialog app={app} />
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

const RESOURCE_PATH: Record<string, string> = { skill: "/skills/", agent: "/agents/", mcp: "/mcp/" };
const RESOURCE_LABEL: Record<string, string> = { skill: "Skill", agent: "Agent", mcp: "MCP server" };

function ResourceRows({ items, loading }: { items: MySubmission[]; loading: boolean }) {
  if (loading) return <SkeletonRows />;
  if (items.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="Nothing submitted yet"
        body="Built a Skill, Agent or MCP server? Paste the GitHub link and we read the rest."
        action={<PrimaryAction href="/submit">Submit a resource</PrimaryAction>}
      />
    );
  }
  return (
    <ul className={listClass}>
      {items.map((item) => {
        const key = item._id || item.id || item.name;
        const published = item.status === "approved" && item.resource_slug;
        return (
          <li key={key} className="p-4">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-foreground">{item.title || item.name}</p>
              <StatusPill tone="muted">{RESOURCE_LABEL[item.resource_type] ?? item.resource_type}</StatusPill>
              {item.status === "approved" ? (
                <StatusPill tone="live">Published</StatusPill>
              ) : item.status === "rejected" ? (
                <StatusPill tone="bad">Not approved</StatusPill>
              ) : (
                <StatusPill tone="wait">In review</StatusPill>
              )}
              <span className="text-xs text-muted-foreground">{timeAgo(item.created_at)}</span>
              {published && (
                <Link
                  href={`${RESOURCE_PATH[item.resource_type] ?? "/"}${item.resource_slug}`}
                  className="ml-auto text-sm font-medium text-foreground hover:text-primary"
                >
                  View
                </Link>
              )}
            </div>
            {item.status === "rejected" && item.reject_reason && (
              <p className="mt-2 rounded-lg bg-destructive/5 px-3 py-2 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Reviewer note:</span> {item.reject_reason}
              </p>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/** Everything you put on the site: launches first, then directory resources. */
export function SubmissionsPanel({ apps, items, loading }: { apps: ShowcaseProject[]; items: MySubmission[]; loading: boolean }) {
  return (
    <section className="space-y-10">
      <PanelHeader title="Submissions" description="Your launches and the Skills, Agents and MCP servers you added to the directory." />
      <div>
        <SectionLabel title="Launches" action={apps.length > 0 ? <QuietAction href="/launches/submit">Launch an app</QuietAction> : undefined} />
        <LaunchRows apps={apps} loading={loading} />
      </div>
      <div>
        <SectionLabel title="Resources" action={items.length > 0 ? <QuietAction href="/submit">Submit a resource</QuietAction> : undefined} />
        <ResourceRows items={items} loading={loading} />
      </div>
    </section>
  );
}

export function SkeletonRows() {
  return (
    <div className="space-y-2">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-16 animate-pulse rounded-[10px] border border-border bg-card" />
      ))}
    </div>
  );
}
