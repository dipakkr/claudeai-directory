"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, ArrowUpRight, MessageSquare, Package, Rocket } from "lucide-react";
import type { ReactNode } from "react";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import {
  DiscussionsPanel,
  LaunchesPanel,
  LaunchRows,
  NotificationsPanel,
  SavedPanel,
  SubmissionsPanel,
} from "@/components/dashboard/Panels";
import { SettingsPanel } from "@/components/dashboard/SettingsPanel";
import { useAuth } from "@/lib/auth";
import { countryName } from "@/lib/profile-options";
import { useDashboardSummary, useMySubmissions, useSavedItems } from "@/hooks/use-dashboard";
import { useMyShowcaseProjects } from "@/hooks/use-showcase";
import { useMarkNotificationsRead, useNotifications } from "@/hooks/use-notifications";
import type { User } from "@/types";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "launches", label: "Launches" },
  { id: "submissions", label: "Resources" },
  { id: "discussions", label: "Posts" },
  { id: "saved", label: "Saved" },
  { id: "notifications", label: "Notifications" },
  { id: "settings", label: "Settings" },
] as const;

type TabId = (typeof TABS)[number]["id"];

function roleLabel(user: User) {
  if (user.profession === "Other" && user.profession_detail) return user.profession_detail;
  return user.profession;
}

/* ---------- overview pieces ---------- */

/** Quiet mono label with a rule, like the launch pages. */
function SectionLabel({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="mb-3 flex items-center gap-3">
      <h2 className="shrink-0 font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-foreground">{title}</h2>
      <span className="h-px flex-1 bg-border" aria-hidden="true" />
      {action}
    </div>
  );
}

function Stat({ label, value, sub, href }: { label: string; value: number | string; sub?: string; href: string }) {
  return (
    <Link href={href} className="bg-card px-4 py-3.5 transition-colors hover:bg-background">
      <p className="font-mono text-[11px] text-muted-foreground">{label}</p>
      <p className="mt-1 font-mono text-[20px] font-medium tabular-nums text-foreground">{typeof value === "number" ? value.toLocaleString("en-US") : value}</p>
      {sub && <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{sub}</p>}
    </Link>
  );
}

function Attention({ items }: { items: { key: string; text: ReactNode; href: string; cta: string }[] }) {
  if (!items.length) return null;
  return (
    <ul className="divide-y divide-primary/15 rounded-[10px] border border-primary/25 bg-primary/[0.05]">
      {items.map((item) => (
        <li key={item.key} className="flex items-center gap-3 px-4 py-3 text-sm">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
          <span className="min-w-0 flex-1 text-foreground/90">{item.text}</span>
          <Link href={item.href} className="inline-flex shrink-0 items-center gap-1 font-medium text-primary hover:underline">
            {item.cta}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** One line: what is missing from the profile, and a link to fix it. */
function ProfileNudge({ user }: { user: User }) {
  const checks = [
    { done: !!user.avatar, label: "photo" },
    { done: !!user.bio, label: "intro" },
    { done: !!user.profession, label: "role" },
    { done: !!user.country, label: "country" },
    { done: !!(user.twitter || user.github || user.linkedin || user.website), label: "a link" },
  ];
  const missing = checks.filter((c) => !c.done).map((c) => c.label);
  if (!missing.length) return null;
  const percent = Math.round(((checks.length - missing.length) / checks.length) * 100);
  return (
    <Link
      href="/dashboard?tab=settings"
      className="group flex items-center gap-3 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
    >
      <span className="relative h-1 w-12 shrink-0 overflow-hidden rounded-full bg-border">
        <span className="absolute inset-y-0 left-0 rounded-full bg-primary" style={{ width: `${percent}%` }} />
      </span>
      <span className="min-w-0 truncate">
        Profile {percent}% done. Add your {missing.join(", ")}.
      </span>
    </Link>
  );
}

const QUICK_ACTIONS = [
  { href: "/launches/submit", icon: Rocket, label: "Launch an app" },
  { href: "/submit", icon: Package, label: "Submit a resource" },
  { href: "/feed#compose", icon: MessageSquare, label: "Write a post" },
] as const;

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
        <div className="mx-auto max-w-[880px] px-4 pt-8 md:px-8 md:pt-12">
          {/* Who you are, in one line. */}
          <header className="flex items-center gap-4">
            {user.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatar} alt="" referrerPolicy="no-referrer" className="h-12 w-12 shrink-0 rounded-full border border-border object-cover" />
            ) : (
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-border bg-card text-lg font-semibold text-muted-foreground">
                {displayName.slice(0, 1).toUpperCase()}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <h1 className="truncate font-sans text-[22px] font-semibold tracking-tight text-foreground">{displayName}</h1>
              <p className="truncate text-[13px] text-muted-foreground">
                @{user.username}
                {role && ` · ${role}`}
                {country && ` · ${country}`}
              </p>
            </div>
            <Link
              href={`/u/${user.username}`}
              className="inline-flex h-9 shrink-0 items-center gap-1 rounded-full border border-border px-4 text-sm text-foreground transition-colors hover:border-[var(--cad-line-hover)]"
            >
              Profile
              <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
            </Link>
          </header>

          {/* Sections as tabs, same as the edit launch page. */}
          <nav aria-label="Dashboard sections" className="-mx-4 mt-8 overflow-x-auto px-4 md:mx-0 md:px-0">
            <ul className="flex gap-6 border-b border-border">
              {TABS.map(({ id, label }) => {
                const active = tab === id;
                const count = counts[id];
                return (
                  <li key={id} className="shrink-0">
                    <Link
                      href={id === "overview" ? "/dashboard" : `/dashboard?tab=${id}`}
                      aria-current={active ? "page" : undefined}
                      className={`-mb-px inline-flex items-center gap-1.5 whitespace-nowrap border-b-2 pb-3 text-sm transition-colors ${
                        active ? "border-foreground font-medium text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {label}
                      {!!count && (
                        <span
                          className={`rounded-full px-1.5 font-mono text-[10.5px] tabular-nums ${
                            id === "notifications" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
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

          <div className="mt-8 min-w-0">
            {tab === "overview" && (
              <div className="space-y-10">
                <Attention items={attention} />

                {s && (s.launches.live > 0 || s.submissions.published > 0) && (
                <section>
                  <SectionLabel title="Your numbers" />
                  <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[10px] border border-border bg-border sm:grid-cols-4">
                    <Stat label="live_launches" value={s?.launches.live ?? "-"} sub={s?.launches.pending ? `${s.launches.pending} ${s.launches.pending === 1 ? "draft" : "drafts"}` : undefined} href="/dashboard?tab=launches" />
                    <Stat label="upvotes" value={s?.launches.upvotes ?? "-"} sub="on live launches" href="/dashboard?tab=launches" />
                    <Stat label="launch_views" value={s?.launches.views ?? "-"} sub="all time" href="/dashboard?tab=launches" />
                    <Stat label="resources" value={s?.submissions.published ?? "-"} sub={s?.submissions.pending ? `${s.submissions.pending} in review` : "published"} href="/dashboard?tab=submissions" />
                  </div>
                </section>
                )}

                <section>
                  <SectionLabel
                    title="Your launches"
                    action={
                      (launches.data?.length ?? 0) > 3 ? (
                        <Link href="/dashboard?tab=launches" className="shrink-0 text-xs text-muted-foreground hover:text-foreground">
                          See all {launches.data?.length}
                        </Link>
                      ) : undefined
                    }
                  />
                  <LaunchRows apps={(launches.data ?? []).slice(0, 3)} loading={launches.isLoading} />
                </section>

                {/* Quiet footer: what else you can do, and the profile reminder. */}
                <div className="space-y-3 border-t border-border pt-6">
                  <p className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                    {QUICK_ACTIONS.map(({ href, icon: Icon, label }) => (
                      <Link key={href} href={href} className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground">
                        <Icon className="h-3.5 w-3.5 text-primary" />
                        {label}
                      </Link>
                    ))}
                  </p>
                  <ProfileNudge user={user} />
                </div>
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
      </main>
      <Footer />
    </div>
  );
}
