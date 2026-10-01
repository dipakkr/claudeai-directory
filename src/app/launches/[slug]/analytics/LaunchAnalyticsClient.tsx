"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ExternalLink } from "lucide-react";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { ShowcaseProject } from "@/types";

interface Row {
  date: string;
  impressions: number;
  views: number;
  clicks: number;
}

interface LaunchReport {
  launch_id: string;
  days: number;
  tracked_since: string | null;
  totals: { impressions: number; views: number; clicks: number; upvotes: number; comments: number; view_rate: number | null; click_rate: number | null };
  range: { impressions: number; views: number; clicks: number };
  rows: Row[];
  surfaces: { surface: string; impressions: number }[];
}

const SURFACE_LABELS: Record<string, string> = {
  launches_list: "Launches page",
  home: "Homepage",
  feed_sidebar: "Community feed sidebar",
  similar: "Related launches on other launch pages",
  profile: "Maker profiles",
  sponsored: "Sponsored spots",
  other: "Other pages",
};

const pct = (n: number | null) => (n === null ? "-" : `${(n * 100).toFixed(n < 0.1 ? 1 : 0)}%`);
const shortDate = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

function Stat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1.5 text-2xl font-semibold tabular-nums leading-none text-foreground">{value}</p>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">{hint}</p>
    </div>
  );
}

function Bars({ rows, metric, label }: { rows: Row[]; metric: keyof Omit<Row, "date">; label: string }) {
  const max = Math.max(1, ...rows.map((r) => r[metric]));
  const total = rows.reduce((sum, r) => sum + r[metric], 0);
  return (
    <section className="rounded-[6px] border border-border bg-card p-4">
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-semibold text-foreground">{label}</h2>
        <span className="text-xs tabular-nums text-muted-foreground">{total.toLocaleString("en-US")} in {rows.length} days</span>
      </div>
      <div className="mt-4 flex h-28 items-end gap-[3px]">
        {rows.map((r) => (
          <div key={r.date} className="group flex h-full flex-1 items-end" title={`${shortDate(r.date)}: ${r[metric].toLocaleString("en-US")}`}>
            <div className="w-full rounded-[2px] bg-primary/80 group-hover:bg-primary" style={{ height: `${r[metric] ? Math.max(4, (r[metric] / max) * 100) : 1}%` }} />
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
        <span>{shortDate(rows[0].date)}</span>
        <span>{shortDate(rows[rows.length - 1].date)}</span>
      </div>
    </section>
  );
}

export default function LaunchAnalyticsClient({ slug }: { slug: string }) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const enabled = !isLoading && isAuthenticated;

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push("/login");
  }, [isLoading, isAuthenticated, router]);

  const report = useQuery({
    queryKey: ["launch-metrics", slug],
    queryFn: () => api.get<LaunchReport>(`/metrics/launches/${slug}`),
    enabled,
    retry: false,
  });
  const launch = useQuery({ queryKey: ["showcase", slug], queryFn: () => api.get<ShowcaseProject>(`/showcase/${slug}`), enabled });

  const forbidden = report.error instanceof ApiError && (report.error.status === 403 || report.error.status === 404);
  const r = report.data;
  const t = r?.totals;
  const surfaceTotal = r?.surfaces.reduce((sum, s) => sum + s.impressions, 0) ?? 0;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-[920px] px-4 pb-20 pt-8 md:px-8">
          <Link href="/dashboard?tab=launches" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" />
            Your launches
          </Link>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-primary">Launch analytics</p>
              <h1 className="mt-1 text-2xl font-semibold text-foreground">{launch.data?.title ?? slug}</h1>
            </div>
            <Link href={`/launches/${slug}`} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
              View launch page <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>

          {forbidden ? (
            <p className="mt-8 rounded-[6px] border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              Only the maker of this launch can see its analytics.
            </p>
          ) : !r || !t ? (
            <div className="mt-8 space-y-4">
              <Skeleton className="h-28 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          ) : (
            <>
              <div className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-[6px] border border-border bg-border md:grid-cols-4">
                <Stat label="Impressions" value={t.impressions.toLocaleString("en-US")} hint="Times your card was seen on the site" />
                <Stat label="Page views" value={t.views.toLocaleString("en-US")} hint="Visits to your launch page" />
                <Stat label="View rate" value={pct(t.view_rate)} hint="Page views per impression" />
                <Stat label="Website clicks" value={t.clicks.toLocaleString("en-US")} hint={`${pct(t.click_rate)} of page views`} />
                <Stat label="Upvotes" value={t.upvotes.toLocaleString("en-US")} hint="From signed-in members" />
                <Stat label="Comments" value={t.comments.toLocaleString("en-US")} hint="On your launch page" />
                <Stat label={`Impressions, ${r.days} days`} value={r.range.impressions.toLocaleString("en-US")} hint={r.tracked_since ? `Tracked since ${shortDate(r.tracked_since)}` : "Tracking starts with your next visitor"} />
                <Stat label={`Clicks, ${r.days} days`} value={r.range.clicks.toLocaleString("en-US")} hint="Visitors sent to your website" />
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <Bars rows={r.rows} metric="impressions" label="Impressions" />
                <Bars rows={r.rows} metric="views" label="Page views" />
                <Bars rows={r.rows} metric="clicks" label="Website clicks" />
              </div>

              <section className="mt-6 rounded-[6px] border border-border bg-card p-4">
                <h2 className="text-sm font-semibold text-foreground">Where people saw your launch</h2>
                {r.surfaces.length ? (
                  <ul className="mt-3 space-y-1.5">
                    {r.surfaces.map((s) => (
                      <li key={s.surface} className="relative flex items-center justify-between overflow-hidden rounded-[4px] px-2 py-1.5 text-sm">
                        <span className="absolute inset-y-0 left-0 bg-primary/10" style={{ width: `${(s.impressions / surfaceTotal) * 100}%` }} />
                        <span className="relative text-foreground">{SURFACE_LABELS[s.surface] ?? s.surface}</span>
                        <span className="relative tabular-nums text-muted-foreground">{s.impressions.toLocaleString("en-US")}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm text-muted-foreground">No impressions yet. They appear as people browse the launches page, homepage and feed.</p>
                )}
              </section>

              <p className="mt-6 text-xs leading-5 text-muted-foreground">
                An impression is your launch card being at least half on screen for one second. Impressions, page views and website clicks each count once per
                visitor per day, and bots are skipped. Page views include visits from before daily tracking started.
              </p>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
