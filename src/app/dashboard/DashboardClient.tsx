"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowUpRight } from "lucide-react";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { AnalyticsPanel, SubmissionsPanel } from "@/components/dashboard/Panels";
import { SettingsPanel } from "@/components/dashboard/SettingsPanel";
import { useAuth } from "@/lib/auth";
import { countryName } from "@/lib/profile-options";
import { useDashboardSummary, useMySubmissions } from "@/hooks/use-dashboard";
import { useMyShowcaseProjects } from "@/hooks/use-showcase";
import type { User } from "@/types";

// Three sections only: how your work is doing, what you submitted, who you are.
const TABS = [
  { id: "analytics", label: "Analytics" },
  { id: "submissions", label: "Submissions" },
  { id: "profile", label: "Profile" },
] as const;

type TabId = (typeof TABS)[number]["id"];

// Old links (?tab=launches, ?tab=settings, ...) land on the nearest section.
const LEGACY_TABS: Record<string, TabId> = {
  overview: "analytics",
  notifications: "analytics",
  launches: "submissions",
  discussions: "submissions",
  saved: "submissions",
  settings: "profile",
};

function resolveTab(requested: string | null): TabId {
  if (requested && TABS.some((t) => t.id === requested)) return requested as TabId;
  return (requested && LEGACY_TABS[requested]) || "analytics";
}

function roleLabel(user: User) {
  if (user.profession === "Other" && user.profession_detail) return user.profession_detail;
  return user.profession;
}

export default function DashboardClient() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const tab = resolveTab(params.get("tab"));

  const enabled = !isLoading && isAuthenticated;
  const summary = useDashboardSummary(enabled);
  const launches = useMyShowcaseProjects({ enabled });
  const submissions = useMySubmissions(enabled && tab === "submissions");

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
    submissions: s ? s.launches.total + s.submissions.total : undefined,
  };

  const displayName = user.name || user.username;
  const role = roleLabel(user);
  const country = countryName(user.country);

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
              View profile
              <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
            </Link>
          </header>

          <nav aria-label="Dashboard sections" className="-mx-4 mt-8 overflow-x-auto px-4 md:mx-0 md:px-0">
            <ul className="flex gap-6 border-b border-border">
              {TABS.map(({ id, label }) => {
                const active = tab === id;
                const count = counts[id];
                return (
                  <li key={id} className="shrink-0">
                    <Link
                      href={id === "analytics" ? "/dashboard" : `/dashboard?tab=${id}`}
                      aria-current={active ? "page" : undefined}
                      className={`-mb-px inline-flex items-center gap-1.5 whitespace-nowrap border-b-2 pb-3 text-sm transition-colors ${
                        active ? "border-foreground font-medium text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {label}
                      {!!count && <span className="rounded-full px-1.5 font-mono text-[10.5px] tabular-nums text-muted-foreground">{count}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="mt-8 min-w-0">
            {tab === "analytics" && (
              <AnalyticsPanel summary={s} apps={launches.data ?? []} loading={summary.isLoading || launches.isLoading} />
            )}
            {tab === "submissions" && (
              <SubmissionsPanel
                apps={launches.data ?? []}
                items={submissions.data ?? []}
                loading={launches.isLoading || submissions.isLoading}
              />
            )}
            {tab === "profile" && <SettingsPanel key={user.username} user={user} />}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
