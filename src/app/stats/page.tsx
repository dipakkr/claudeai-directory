import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PageBreadcrumb from "@/components/layout/PageBreadcrumb";
import { fetchApi } from "@/lib/api-server";
import { DEFAULT_OG_IMAGE } from "@/lib/seo";

const TITLE = "Open Stats: Claude AI Directory in Numbers";
const DESCRIPTION =
  "Live traffic, members, launches and install activity on Claude AI Directory, from our own first-party counters.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/stats" },
  openGraph: { images: [DEFAULT_OG_IMAGE], title: TITLE, description: DESCRIPTION, url: "/stats" },
};

interface Row {
  date: string;
  visitors: number;
  page_views: number;
  listing_views: number;
  launch_views: number;
  installs: number;
  signups: number;
  members: number;
  launches: number;
  posts: number;
}

interface OpenStats {
  updated_at: string;
  days: number;
  tracking_since: string | null;
  summary: {
    /** `prev` is the same-length window before this one; `source` says where visitors come from. */
    visitors: { range: number; prev?: number; source?: string };
    page_views: { range: number; prev?: number; source?: string };
    listing_views: { range: number; prev?: number; all_time: number };
    installs: { range: number; prev?: number; all_time: number };
    members: { range: number; prev?: number; all_time: number };
    launches: { range: number; prev?: number; all_time: number };
    posts: { range: number; prev?: number; all_time: number };
    subscribers: { all_time: number };
    resources: { skills: number; mcp: number; agents: number; plugins: number };
  };
  rows: Row[];
  countries: { code: string; share: number }[];
}

const fmt = (n: number) => (n >= 10_000 ? `${(n / 1000).toFixed(1)}K` : n.toLocaleString("en-US"));
const shortDate = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
const regionName = (code: string) => {
  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
};
const flag = (code: string) => String.fromCodePoint(...[...code].map((c) => 0x1f1a5 + c.charCodeAt(0)));

function SectionLabel({ children, aside }: { children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <h2 className="shrink-0 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{children}</h2>
      <span className="h-px flex-1 bg-border" />
      {aside && <span className="shrink-0 text-xs text-muted-foreground">{aside}</span>}
    </div>
  );
}

/** "▲ 32%" green / "▼ 12%" red against the previous period; "new" when there was nothing before. */
function Change({ now, prev }: { now: number; prev?: number }) {
  if (prev === undefined) return null;
  if (prev === 0) return now > 0 ? <span className="rounded-[4px] bg-green-500/10 px-1.5 py-0.5 font-mono text-[11px] text-green-600 dark:text-green-400">new</span> : null;
  const pct = Math.round(((now - prev) / prev) * 100);
  if (pct === 0) return <span className="font-mono text-[11px] text-muted-foreground">0%</span>;
  const up = pct > 0;
  return (
    <span
      className={`rounded-[4px] px-1.5 py-0.5 font-mono text-[11px] tabular-nums ${up ? "bg-green-500/10 text-green-600 dark:text-green-400" : "bg-red-500/10 text-red-600 dark:text-red-400"}`}
      title={`${prev.toLocaleString("en-US")} in the previous period`}
    >
      {up ? "▲" : "▼"} {Math.abs(pct) > 999 ? "999+" : Math.abs(pct)}%
    </span>
  );
}

function Stat({ label, value, sub, now, prev }: { label: string; value: string; sub?: string; now?: number; prev?: number }) {
  return (
    <div className="bg-card p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="font-mono text-[11px] text-muted-foreground">{label}</p>
        {now !== undefined && <Change now={now} prev={prev} />}
      </div>
      <p className="mt-1.5 text-[22px] font-semibold tabular-nums leading-none text-foreground">{value}</p>
      {sub && <p className="mt-1.5 font-mono text-[11px] text-muted-foreground">{sub}</p>}
    </div>
  );
}

/** Server-rendered bar chart: one bar per day; days with no counter yet are dashed. */
function Bars({ rows, value, from }: { rows: Row[]; value: (r: Row) => number; from?: string | null }) {
  const max = Math.max(1, ...rows.map(value));
  const ticks = [0, 7, 14, 21, rows.length - 1].filter((i) => i < rows.length);
  return (
    <div>
      <div className="flex h-36 items-end gap-[3px]">
        {rows.map((r) => {
          const v = value(r);
          const untracked = from !== undefined && (!from || r.date < from);
          return (
            <div key={r.date} className="group relative flex h-full flex-1 items-end" title={`${shortDate(r.date)}: ${untracked ? "not counted yet" : v.toLocaleString("en-US")}`}>
              {untracked ? (
                <div className="h-1/4 w-full rounded-[2px] border border-dashed border-border" />
              ) : (
                <div className="w-full rounded-[2px] bg-primary/85 transition-colors group-hover:bg-primary" style={{ height: `${Math.max(v ? 3 : 1, (v / max) * 100)}%` }} />
              )}
            </div>
          );
        })}
      </div>
      <div className="relative mt-2 h-4 font-mono text-[10px] text-muted-foreground">
        {ticks.map((i) => (
          <span key={i} className="absolute whitespace-nowrap -translate-x-1/2 first:translate-x-0 last:-translate-x-full" style={{ left: `${(i / (rows.length - 1)) * 100}%` }}>
            {shortDate(rows[i].date)}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Cumulative line (members) as a filled SVG area. */
function Area({ rows }: { rows: Row[] }) {
  const values = rows.map((r) => r.members);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = Math.max(1, max - min);
  const w = 600;
  const h = 144;
  const points = values.map((v, i) => [(i / (values.length - 1)) * w, h - 8 - ((v - min) / span) * (h - 24)] as const);
  const line = points.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  return (
    <div>
      <div className="relative">
        <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="h-36 w-full" aria-hidden>
          <defs>
            <linearGradient id="members-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="hsl(var(--primary))" stopOpacity="0.35" />
              <stop offset="1" stopColor="hsl(var(--primary))" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={`${line} L${w},${h} L0,${h} Z`} fill="url(#members-fill)" />
          <path d={line} fill="none" stroke="hsl(var(--primary))" strokeWidth="2" vectorEffect="non-scaling-stroke" />
        </svg>
        <span className="absolute left-0 top-0 font-mono text-[10px] text-muted-foreground">{max.toLocaleString("en-US")}</span>
        <span className="absolute bottom-1 left-0 font-mono text-[10px] text-muted-foreground">{min.toLocaleString("en-US")}</span>
      </div>
      <div className="mt-2 flex justify-between font-mono text-[10px] text-muted-foreground">
        <span>{shortDate(rows[0].date)}</span>
        <span>{shortDate(rows[rows.length - 1].date)}</span>
      </div>
    </div>
  );
}

function Chart({ title, aside, children }: { title: string; aside?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section>
      <SectionLabel aside={aside}>{title}</SectionLabel>
      <div className="mt-4">{children}</div>
    </section>
  );
}

/** Public, read-only OpenPanel dashboard for the site: real-time visitors, pages and sources. */
const LIVE_ANALYTICS_URL = "https://analytics.tooljunction.io/share/overview/iwlGOl";

function LiveAnalytics() {
  return (
    <section id="live" className="mt-12 scroll-mt-24">
      <SectionLabel aside="Public dashboard, updates in real time">Live traffic</SectionLabel>
      <div className="mt-4 overflow-hidden rounded-[6px] border border-border bg-card">
        {/* Cross-origin, so its header (OpenPanel's own nav links) can't be styled away:
            shift the frame up by the header's height (68px) and let the box clip it. */}
        <iframe
          src={LIVE_ANALYTICS_URL}
          title="Live traffic for Claude AI Directory"
          loading="lazy"
          referrerPolicy="no-referrer"
          className="-mt-[68px] block h-[788px] w-full md:h-[968px]"
        />
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Nothing hidden: this is the same analytics dashboard we use, shared read-only.{" "}
        <a href={LIVE_ANALYTICS_URL} target="_blank" rel="noopener noreferrer" className="text-foreground underline-offset-4 hover:underline">
          Open it full screen
        </a>
      </p>
    </section>
  );
}

export default async function StatsPage({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  // Last 7 days by default; ?range=30d for the month.
  const days = (await searchParams).range === "30d" ? 30 : 7;
  const data = await fetchApi<OpenStats>(`/stats/open?days=${days}`, { revalidate: 600 });

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-[920px] px-4 pb-20 pt-8 md:px-8">
          <PageBreadcrumb items={[{ label: "Stats" }]} />
          <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.16em] text-primary">Open stats</p>
          <h1 className="mt-3 font-sans text-3xl font-semibold tracking-tight text-foreground md:text-[40px] md:leading-[1.1]">Claude AI Directory in numbers</h1>
          <p className="mt-3 max-w-[64ch] text-[15px] leading-6 text-muted-foreground">
            Live numbers from our own first-party counters, refreshed every 10 minutes. Visits are counted without cookies, and bots
            and automated browsers are skipped.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link href="/launches/submit" className="inline-flex h-10 items-center rounded-[6px] bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90">
              Launch your app
            </Link>
            <Link href="/?advertise=1" className="inline-flex h-10 items-center rounded-[6px] border border-border px-4 text-sm font-medium text-foreground hover:bg-card">
              Advertise
            </Link>
            <a href="#live" className="inline-flex h-10 items-center gap-2 rounded-[6px] border border-border px-4 text-sm font-medium text-foreground hover:bg-card">
              <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" aria-hidden="true" />
              Live traffic
            </a>
          </div>

          <LiveAnalytics />

          {!data ? (
            <p className="mt-12 rounded-[6px] border border-dashed border-border p-8 text-center text-sm text-muted-foreground">Stats are temporarily unavailable. Try again in a minute.</p>
          ) : (
            <Body data={data} />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

/** 7d / 30d: plain links, so each range is its own server-rendered view. */
function RangeSwitch({ days }: { days: number }) {
  return (
    <span className="inline-flex items-center gap-0.5 rounded-[6px] bg-foreground/[0.06] p-0.5 font-mono text-[11px]">
      {[7, 30].map((d) => (
        <Link
          key={d}
          href={d === 7 ? "/stats" : "/stats?range=30d"}
          scroll={false}
          aria-current={days === d ? "true" : undefined}
          className={`rounded-[4px] px-2 py-0.5 transition-colors ${days === d ? "bg-background text-foreground" : "text-muted-foreground hover:text-foreground"}`}
        >
          {d}d
        </Link>
      ))}
    </span>
  );
}

function Body({ data }: { data: OpenStats }) {
  const { summary: s, rows, tracking_since: since } = data;
  const counting = since ? `counted since ${shortDate(since)}` : "counting starts today";
  // OpenPanel numbers exist from day one; our own counter only from `since`.
  const hasTraffic = s.visitors.source === "openpanel" || Boolean(since);
  const prevLabel = (prev?: number) => (prev !== undefined ? `${fmt(prev)} previous ${data.days} days` : counting);
  const listings = s.resources.skills + s.resources.mcp + s.resources.agents + s.resources.plugins;

  return (
    <>
      <div className="mt-12">
        <SectionLabel aside={<RangeSwitch days={data.days} />}>In numbers</SectionLabel>
        <div className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-[6px] border border-border bg-border md:grid-cols-4">
          <Stat label="visitors" value={hasTraffic ? fmt(s.visitors.range) : "-"} sub={hasTraffic ? prevLabel(s.visitors.prev) : counting} now={hasTraffic ? s.visitors.range : undefined} prev={s.visitors.prev} />
          <Stat label="page_views" value={hasTraffic ? fmt(s.page_views.range) : "-"} sub={hasTraffic ? prevLabel(s.page_views.prev) : counting} now={hasTraffic ? s.page_views.range : undefined} prev={s.page_views.prev} />
          <Stat label="listing_views" value={fmt(s.listing_views.range)} sub={`${fmt(s.listing_views.all_time)} all time`} now={s.listing_views.range} prev={s.listing_views.prev} />
          <Stat label="install_actions" value={fmt(s.installs.range)} sub={`${fmt(s.installs.all_time)} all time`} now={s.installs.range} prev={s.installs.prev} />
          <Stat label="new_members" value={`+${fmt(s.members.range)}`} sub={`${fmt(s.members.all_time)} all time`} now={s.members.range} prev={s.members.prev} />
          <Stat label="apps_launched" value={fmt(s.launches.range)} sub={`${fmt(s.launches.all_time)} all time`} now={s.launches.range} prev={s.launches.prev} />
          <Stat label="posts_and_comments" value={fmt(s.posts.range)} sub={`${fmt(s.posts.all_time)} all time`} now={s.posts.range} prev={s.posts.prev} />
          <Stat label="listings" value={fmt(listings)} sub={`${s.resources.mcp} MCP · ${s.resources.plugins} plugins`} />
        </div>
      </div>


      <div className="mt-12 grid gap-12 md:grid-cols-2">
        <Chart title="Listing and launch views" aside={`${fmt(s.listing_views.range)} in ${data.days} days`}>
          <Bars rows={rows} value={(r) => r.listing_views + r.launch_views} />
        </Chart>
        <Chart title="Install actions per day" aside={`${fmt(s.installs.range)} in ${data.days} days`}>
          <Bars rows={rows} value={(r) => r.installs} />
        </Chart>
        <Chart title="Registered members" aside={`+${fmt(s.members.range)} in ${data.days} days`}>
          <Area rows={rows} />
        </Chart>
        <Chart title="Posts and comments per day" aside={`${fmt(s.posts.range)} in ${data.days} days`}>
          <Bars rows={rows} value={(r) => r.posts} />
        </Chart>
      </div>

      <div className="mt-12 grid gap-12 md:grid-cols-2">
        <section>
          <SectionLabel aside={`share of visitors, ${data.days} days`}>Countries</SectionLabel>
          {data.countries.length ? (
            <ul className="mt-4 space-y-1">
              {data.countries.map((c) => (
                <li key={c.code} className="relative flex items-center justify-between overflow-hidden rounded-[4px] px-2 py-1.5 text-sm">
                  <span className="absolute inset-y-0 left-0 bg-card" style={{ width: `${Math.max(4, c.share * 100)}%` }} />
                  <span className="relative text-foreground">
                    {flag(c.code)} {regionName(c.code)}
                  </span>
                  <span className="relative font-mono text-xs tabular-nums text-muted-foreground">{(c.share * 100).toFixed(1)}%</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">Country shares appear once the visit counter has a few days of data.</p>
          )}
        </section>

        <section>
          <SectionLabel>What you get</SectionLabel>
          <div className="mt-4 space-y-3">
            <Link href="/launches/submit" className="group block rounded-[6px] border border-border bg-card p-4 hover:border-[var(--cad-line-hover)]">
              <span className="block text-sm font-semibold text-foreground">Launch your app</span>
              <span className="mt-1 block text-[13px] leading-6 text-muted-foreground">
                A public launch page with upvotes, comments and view counts, in front of {fmt(s.members.all_time)} members building with Claude. Badge-verified
                launches get a dofollow link.
              </span>
              <span className="mt-2 inline-flex items-center gap-1 text-[13px] font-medium text-primary">
                Launch your app <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
            <Link href="/?advertise=1" className="group block rounded-[6px] border border-border bg-card p-4 hover:border-[var(--cad-line-hover)]">
              <span className="block text-sm font-semibold text-foreground">Advertise</span>
              <span className="mt-1 block text-[13px] leading-6 text-muted-foreground">
                Sidebar and launch-list spots next to {fmt(listings)} Skills, MCP servers, Agents and Plugins. Monthly, cancel anytime.
              </span>
              <span className="mt-2 inline-flex items-center gap-1 text-[13px] font-medium text-primary">
                See ad spots <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          </div>
        </section>
      </div>

      <p className="mt-12 font-mono text-[11px] leading-5 text-muted-foreground">
        Visitors are unique per day, from a keyed hash of the IP address that is never stored; there are no cookies. Site-wide visit counting started
        {since ? ` on ${shortDate(since)}` : " today"}, and dashed bars are days before that. Listing views are opens of a Skill, MCP, Agent, Plugin or launch page.
        Install actions are copies of an install command or clicks on an install button, not confirmed installs. Updated{" "}
        {new Date(data.updated_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "UTC" })} UTC.
      </p>
    </>
  );
}
