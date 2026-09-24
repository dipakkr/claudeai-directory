"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  ArrowUp,
  Bell,
  Bookmark,
  LayoutDashboard,
  MessageSquare,
  Package,
  Rocket,
  Settings,
  Twitter,
} from "lucide-react";
import type { ReactNode } from "react";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import {
  DiscussionsPanel,
  LaunchesPanel,
  NotificationsPanel,
  SavedPanel,
  SubmissionsPanel,
  timeAgo,
} from "@/components/dashboard/Panels";
import { SettingsPanel } from "@/components/dashboard/SettingsPanel";
import { useAuth } from "@/lib/auth";
import { countryName } from "@/lib/profile-options";
import { useDashboardSummary, useMySubmissions, useSavedItems } from "@/hooks/use-dashboard";
import { useMyShowcaseProjects } from "@/hooks/use-showcase";
import { useMarkNotificationsRead, useNotifications } from "@/hooks/use-notifications";
import type { User } from "@/types";

const TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "launches", label: "Launches", icon: Rocket },
  { id: "submissions", label: "Submissions", icon: Package },
  { id: "discussions", label: "Discussions", icon: MessageSquare },
  { id: "saved", label: "Saved", icon: Bookmark },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "settings", label: "Settings", icon: Settings },
] as const;

type TabId = (typeof TABS)[number]["id"];

function roleLabel(user: User) {
  if (user.profession === "Other" && user.profession_detail) return user.profession_detail;
  return user.profession;
}

/* ---------- overview pieces ---------- */

function StatTile({ label, value, sub, href }: { label: string; value: number | string; sub?: string; href: string }) {
  return (
    <Link href={href} className="group rounded-2xl border border-border bg-card p-4 transition-colors hover:border-[var(--cad-line-hover)]">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold tabular-nums text-foreground">{value}</p>
      {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
    </Link>
  );
}

function ActionCard({ href, icon: Icon, title, body }: { href: string; icon: typeof Rocket; title: string; body: string }) {
  return (
    <Link href={href} className="group flex gap-3 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-[var(--cad-line-hover)]">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0">
        <span className="flex items-center gap-1 text-sm font-medium text-foreground">
          {title}
          <ArrowRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
        </span>
        <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">{body}</span>
      </span>
    </Link>
  );
}

function Attention({ items }: { items: { key: string; text: ReactNode; href: string; cta: string }[] }) {
  if (!items.length) return null;
  return (
    <section className="rounded-2xl border border-primary/25 bg-primary/[0.06] p-4">
      <p className="text-sm font-semibold text-foreground">Needs your attention</p>
      <ul className="mt-2 divide-y divide-primary/15">
        {items.map((item) => (
          <li key={item.key} className="flex items-center justify-between gap-3 py-2.5 text-sm">
            <span className="text-foreground/85">{item.text}</span>
            <Link href={item.href} className="shrink-0 font-medium text-primary hover:underline">
              {item.cta}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ProfileStrength({ user }: { user: User }) {
  const checks = [
    { done: !!user.avatar, label: "Photo" },
    { done: !!user.bio, label: "One-line intro" },
    { done: !!user.profession, label: "Role" },
    { done: !!user.country, label: "Country" },
    { done: !!(user.twitter || user.github || user.linkedin || user.website), label: "A link" },
  ];
  const done = checks.filter((c) => c.done).length;
  const percent = Math.round((done / checks.length) * 100);
  if (percent === 100) return null;
  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">Complete your profile</p>
        <span className="text-xs tabular-nums text-muted-foreground">{percent}%</span>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-border">
        <div className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} />
      </div>
      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs">
        {checks.map((c) => (
          <li key={c.label} className={c.done ? "text-muted-foreground line-through" : "text-foreground"}>
            {c.label}
          </li>
        ))}
      </ul>
      <Link href="/dashboard?tab=settings" className="mt-3 inline-block text-sm font-medium text-primary hover:underline">
        Finish profile
      </Link>
    </section>
  );
}

/* ---------- page ---------- */

export default function DashboardClient() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const requested = params.get("tab");
  const tab: TabId = TABS.some((t) => t.id === requested) ? (requested as TabId) : "overview";

  const enabled = !isLoading && isAuthenticated;
  const summary = useDashboardSummary(enabled);
  const launches = useMyShowcaseProjects({ enabled });
  const submissions = useMySubmissions(enabled && tab === "submissions");
  const saved = useSavedItems(enabled && tab === "saved");
  const notifications = useNotifications(enabled);
  const markRead = useMarkNotificationsRead();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push("/login");
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex flex-1 items-center justify-center">
          <p className="text-sm text-muted-foreground">Loading your dashboard...</p>
        </main>
      </div>
    );
  }

  const s = summary.data;
  const counts: Partial<Record<TabId, number>> = {
    launches: s?.launches.total,
    submissions: s?.submissions.total,
    discussions: s?.discussions.threads,
    saved: s?.saved,
    notifications: notifications.data?.unread,
  };

  const displayName = user.name || user.username;
  const role = roleLabel(user);
  const country = countryName(user.country);

  const attention = [
    ...(s && s.launches.pending
      ? [{ key: "badge", text: `${s.launches.pending} ${s.launches.pending === 1 ? "launch is" : "launches are"} waiting for the badge`, href: "/launches/submit", cta: "Add badge" }]
      : []),
    ...(s && s.submissions.rejected
      ? [{ key: "rejected", text: `${s.submissions.rejected} ${s.submissions.rejected === 1 ? "submission needs" : "submissions need"} changes`, href: "/dashboard?tab=submissions", cta: "See notes" }]
      : []),
    ...(notifications.data?.unread
      ? [{ key: "unread", text: `${notifications.data.unread} unread ${notifications.data.unread === 1 ? "notification" : "notifications"}`, href: "/dashboard?tab=notifications", cta: "Open" }]
      : []),
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 pb-16">
        <div className="mx-auto max-w-[1120px] px-4 pt-8 md:px-8 md:pt-10">
          {/* Profile header */}
          <header className="flex flex-wrap items-center gap-4 border-b border-border pb-6">
            {user.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatar} alt="" referrerPolicy="no-referrer" className="h-16 w-16 rounded-full border border-border object-cover" />
            ) : (
              <span className="flex h-16 w-16 items-center justify-center rounded-full border border-border bg-card text-xl font-semibold text-muted-foreground">
                {displayName.slice(0, 1).toUpperCase()}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-2xl font-semibold text-foreground">{displayName}</h1>
              <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground">
                <span>@{user.username}</span>
                {role && <span>· {role}</span>}
                {country && <span>· {country}</span>}
                <span>· Joined {new Date(user.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</span>
              </p>
              {user.bio && <p className="mt-1.5 truncate text-sm text-foreground/85">{user.bio}</p>}
            </div>
            <div className="flex basis-full gap-2 sm:basis-auto">
              <Link href={`/u/${user.username}`} className="inline-flex h-9 items-center rounded-full border border-border px-4 text-sm font-medium text-foreground hover:border-[var(--cad-line-hover)]">
                View profile
              </Link>
              <Link href="/dashboard?tab=settings" className="inline-flex h-9 items-center rounded-full bg-foreground px-4 text-sm font-medium text-background hover:bg-foreground/85">
                Edit profile
              </Link>
            </div>
          </header>

          <div className="mt-6 grid gap-8 lg:grid-cols-[210px_minmax(0,1fr)]">
            {/* Section nav: sidebar on desktop, scrollable tabs on mobile */}
            <nav aria-label="Dashboard sections" className="-mx-4 overflow-x-auto px-4 lg:mx-0 lg:overflow-visible lg:px-0">
              <ul className="flex gap-1 lg:sticky lg:top-24 lg:flex-col">
                {TABS.map(({ id, label, icon: Icon }) => {
                  const active = tab === id;
                  const count = counts[id];
                  return (
                    <li key={id} className="shrink-0">
                      <Link
                        href={id === "overview" ? "/dashboard" : `/dashboard?tab=${id}`}
                        aria-current={active ? "page" : undefined}
                        className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                          active ? "bg-card font-medium text-foreground shadow-sm ring-1 ring-border" : "text-muted-foreground hover:bg-card/60 hover:text-foreground"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {label}
                        {!!count && (
                          <span
                            className={`ml-auto rounded-full px-1.5 text-[11px] tabular-nums ${
                              id === "notifications" ? "bg-primary text-primary-foreground" : "bg-border/70 text-muted-foreground"
                            }`}
                          >
                            {count}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="min-w-0">
              {tab === "overview" && (
                <div className="space-y-6">
                  <Attention items={attention} />

                  <section>
                    <h2 className="mb-3 text-sm font-semibold text-foreground">Your activity</h2>
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                      <StatTile label="Live launches" value={s?.launches.live ?? "-"} sub={s?.launches.pending ? `${s.launches.pending} waiting for badge` : undefined} href="/dashboard?tab=launches" />
                      <StatTile label="Upvotes received" value={s?.launches.upvotes ?? "-"} sub="On your live launches" href="/dashboard?tab=launches" />
                      <StatTile label="Resources published" value={s?.submissions.published ?? "-"} sub={s?.submissions.pending ? `${s.submissions.pending} in review` : undefined} href="/dashboard?tab=submissions" />
                      <StatTile label="Discussions" value={s?.discussions.threads ?? "-"} sub={s ? `${s.discussions.replies} replies written` : undefined} href="/dashboard?tab=discussions" />
                      <StatTile label="Saved" value={s?.saved ?? "-"} href="/dashboard?tab=saved" />
                      <StatTile label="Tweets added" value={s?.tweets_added ?? "-"} sub="To the community feed" href="/feed" />
                    </div>
                  </section>

                  <ProfileStrength user={user} />

                  <section>
                    <h2 className="mb-3 text-sm font-semibold text-foreground">Share something</h2>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <ActionCard href="/launches/submit" icon={Rocket} title="Launch an app" body="Get a public page, upvotes and feedback." />
                      <ActionCard href="/submit" icon={Package} title="Submit a resource" body="Publish a Skill, Agent or MCP server from GitHub." />
                      <ActionCard href="/community" icon={MessageSquare} title="Start a discussion" body="Ask a question or share what you are building." />
                      <ActionCard href="/feed" icon={Twitter} title="Add a tweet to the feed" body="Share a great post about Claude." />
                    </div>
                  </section>

                  {s && s.discussions.recent.length > 0 && (
                    <section>
                      <div className="mb-3 flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-foreground">Recent discussions</h2>
                        <Link href="/dashboard?tab=discussions" className="text-xs text-muted-foreground hover:text-foreground">
                          See all
                        </Link>
                      </div>
                      <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
                        {s.discussions.recent.slice(0, 3).map((thread) => (
                          <li key={thread.id}>
                            <Link href={`/community/${thread.id}`} className="flex items-center gap-3 p-3.5 text-sm hover:bg-background/60">
                              <span className="min-w-0 flex-1 truncate text-foreground">{thread.title}</span>
                              <span className="shrink-0 text-xs text-muted-foreground">
                                {thread.replies} {thread.replies === 1 ? "reply" : "replies"} · {timeAgo(thread.created_at)}
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}

                  {s && s.launches.live > 0 && (
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <ArrowUp className="h-3 w-3" />
                      Share your launch page to collect more upvotes.
                    </p>
                  )}
                </div>
              )}

              {tab === "launches" && <LaunchesPanel apps={launches.data ?? []} loading={launches.isLoading} />}
              {tab === "submissions" && <SubmissionsPanel items={submissions.data ?? []} loading={submissions.isLoading} />}
              {tab === "discussions" && (
                <DiscussionsPanel threads={s?.discussions.recent ?? []} replies={s?.discussions.replies ?? 0} loading={summary.isLoading} />
              )}
              {tab === "saved" && <SavedPanel items={saved.data?.items ?? []} loading={saved.isLoading} />}
              {tab === "notifications" && (
                <NotificationsPanel
                  items={notifications.data?.notifications ?? []}
                  unread={notifications.data?.unread ?? 0}
                  loading={notifications.isLoading}
                  onMarkAll={() => markRead.mutate(undefined)}
                  marking={markRead.isPending}
                />
              )}
              {tab === "settings" && <SettingsPanel key={user.username} user={user} />}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
