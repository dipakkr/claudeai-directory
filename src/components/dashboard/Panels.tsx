"use client";

import Link from "next/link";
import { ArrowUp, Bell, Bookmark, MessageSquare, Package, Rocket } from "lucide-react";
import type { ReactNode } from "react";

import { faviconFor } from "@/lib/directory";
import type { MySubmission, SavedItem } from "@/hooks/use-dashboard";
import type { AppNotification } from "@/hooks/use-notifications";
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

export function PanelHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
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
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-border px-6 py-14 text-center">
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
  return <span className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium ${tones[tone]}`}>{children}</span>;
}

const listClass = "divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card";

/* ---------- launches ---------- */

export function LaunchesPanel({ apps, loading }: { apps: ShowcaseProject[]; loading: boolean }) {
  return (
    <section>
      <PanelHeader
        title="Your launches"
        description="Apps you launched. They go public once the badge is verified."
        action={<PrimaryAction href="/launches/submit"><Rocket className="h-4 w-4" />Launch an app</PrimaryAction>}
      />
      {loading ? (
        <SkeletonRows />
      ) : apps.length === 0 ? (
        <EmptyState
          icon={Rocket}
          title="No launches yet"
          body="Launch what you built with Claude to get a public page, upvotes and feedback from builders."
          action={<PrimaryAction href="/launches/submit">Launch your first app</PrimaryAction>}
        />
      ) : (
        <ul className={listClass}>
          {apps.map((app) => {
            const logo = app.logo_url || faviconFor(app.app_url || app.demo_url);
            const rejected = app.status === "rejected";
            return (
              <li key={app.id} className="flex items-center gap-4 p-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-background text-sm font-semibold text-muted-foreground">
                  {logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={logo} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    app.title.slice(0, 1).toUpperCase()
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-semibold text-foreground">{app.title}</p>
                    {app.badge_verified ? (
                      <StatusPill tone="live">Live</StatusPill>
                    ) : rejected ? (
                      <StatusPill tone="bad">Not approved</StatusPill>
                    ) : (
                      <StatusPill tone="wait">Waiting for badge</StatusPill>
                    )}
                  </div>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {app.tagline || app.category || "Launch"} · {timeAgo(app.listed_at || app.created_at)}
                  </p>
                </div>
                {app.badge_verified && (
                  <span className="hidden items-center gap-1 text-sm font-medium tabular-nums text-foreground sm:inline-flex" title="Upvotes">
                    <ArrowUp className="h-3.5 w-3.5" />
                    {app.upvotes ?? 0}
                  </span>
                )}
                {app.badge_verified ? (
                  <Link href={`/launches/${app.id}`} className="shrink-0 text-sm font-medium text-foreground hover:text-primary">
                    View
                  </Link>
                ) : !rejected ? (
                  <Link href="/launches/submit" className="shrink-0 rounded-full border border-border px-3 py-1 text-xs font-medium text-foreground hover:border-primary/50">
                    Add badge
                  </Link>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

/* ---------- submissions ---------- */

const RESOURCE_PATH: Record<string, string> = { skill: "/skills/", agent: "/agents/", mcp: "/mcp/" };
const RESOURCE_LABEL: Record<string, string> = { skill: "Skill", agent: "Agent", mcp: "MCP server" };

export function SubmissionsPanel({ items, loading }: { items: MySubmission[]; loading: boolean }) {
  return (
    <section>
      <PanelHeader
        title="Your submissions"
        description="Skills, agents and MCP servers you submitted to the directory."
        action={<PrimaryAction href="/submit"><Package className="h-4 w-4" />Submit a resource</PrimaryAction>}
      />
      {loading ? (
        <SkeletonRows />
      ) : items.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Nothing submitted yet"
          body="Built a Skill, Agent or MCP server? Paste the GitHub link and we read the rest."
          action={<PrimaryAction href="/submit">Submit a resource</PrimaryAction>}
        />
      ) : (
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
      )}
    </section>
  );
}

/* ---------- discussions ---------- */

export function DiscussionsPanel({
  threads,
  replies,
  loading,
}: {
  threads: { id: string; title: string; replies: number; created_at: string }[];
  replies: number;
  loading: boolean;
}) {
  return (
    <section>
      <PanelHeader
        title="Your discussions"
        description={`Threads you started. You have also written ${replies} ${replies === 1 ? "reply" : "replies"}.`}
        action={<PrimaryAction href="/community"><MessageSquare className="h-4 w-4" />Start a discussion</PrimaryAction>}
      />
      {loading ? (
        <SkeletonRows />
      ) : threads.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No discussions yet"
          body="Ask a question or share what you are building. Builders reply fast."
          action={<PrimaryAction href="/community">Go to discussions</PrimaryAction>}
        />
      ) : (
        <ul className={listClass}>
          {threads.map((thread) => (
            <li key={thread.id}>
              <Link href={`/community/${thread.id}`} className="flex items-center gap-3 p-4 hover:bg-background/60">
                <p className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">{thread.title}</p>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {thread.replies} {thread.replies === 1 ? "reply" : "replies"} · {timeAgo(thread.created_at)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/* ---------- saved ---------- */

export function SavedPanel({ items, loading }: { items: SavedItem[]; loading: boolean }) {
  return (
    <section>
      <PanelHeader title="Saved" description="Skills, MCP servers, launches and more you saved for later." />
      {loading ? (
        <SkeletonRows />
      ) : items.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="Nothing saved yet"
          body="Tap Favorite on any Skill, MCP server or launch to keep it here."
          action={<PrimaryAction href="/skills">Browse Skills</PrimaryAction>}
        />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                href={item.href}
                className="flex h-full flex-col rounded-2xl border border-border bg-card p-4 transition-colors hover:border-[var(--cad-line-hover)]"
              >
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{item.type_label}</span>
                <span className="mt-1.5 text-sm font-semibold text-foreground">{item.title}</span>
                {item.summary && <span className="mt-1 line-clamp-2 text-sm text-muted-foreground">{item.summary}</span>}
                <span className="mt-auto pt-3 text-xs text-muted-foreground">Saved {timeAgo(item.saved_at)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/* ---------- notifications ---------- */

export function NotificationsPanel({
  items,
  unread,
  loading,
  onMarkAll,
  marking,
}: {
  items: AppNotification[];
  unread: number;
  loading: boolean;
  onMarkAll: () => void;
  marking: boolean;
}) {
  return (
    <section>
      <PanelHeader
        title="Notifications"
        description={unread ? `${unread} unread` : "You are all caught up."}
        action={
          unread > 0 ? (
            <button
              type="button"
              onClick={onMarkAll}
              disabled={marking}
              className="inline-flex h-9 items-center rounded-full border border-border px-4 text-sm font-medium text-foreground hover:border-[var(--cad-line-hover)] disabled:opacity-60"
            >
              Mark all as read
            </button>
          ) : undefined
        }
      />
      {loading ? (
        <SkeletonRows />
      ) : items.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications yet" body="Replies to your discussions and updates on your launches show up here." />
      ) : (
        <ul className={listClass}>
          {items.map((item) => (
            <li key={item.id}>
              <Link href={item.link || "/dashboard"} className="flex gap-3 p-4 hover:bg-background/60">
                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${item.read ? "bg-transparent" : "bg-primary"}`} aria-hidden="true" />
                <span className="min-w-0 flex-1">
                  <span className={`block text-sm ${item.read ? "text-muted-foreground" : "font-medium text-foreground"}`}>{item.title}</span>
                  {item.body && <span className="mt-0.5 block truncate text-sm text-muted-foreground">{item.body}</span>}
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">{timeAgo(item.created_at)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function SkeletonRows() {
  return (
    <div className="space-y-2">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-16 animate-pulse rounded-2xl border border-border bg-card" />
      ))}
    </div>
  );
}

