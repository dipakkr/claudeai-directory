import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PageBreadcrumb from "@/components/layout/PageBreadcrumb";
import { fetchApi } from "@/lib/api-server";

const TITLE = "Open Stats: Claude AI Directory in Numbers";
const DESCRIPTION =
  "Live traffic, members, launches and install activity on Claude AI Directory for the last 30 days, from our own first-party counters.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/stats" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/stats" },
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
    visitors: { range: number };
    page_views: { range: number };
    listing_views: { range: number; all_time: number };
    installs: { range: number; all_time: number };
    members: { range: number; all_time: number };
    launches: { range: number; all_time: number };
    posts: { range: number; all_time: number };
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

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-card p-4">
      <p className="font-mono text-[11px] text-muted-foreground">{label}</p>
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

export default async function StatsPage() {
  const data = await fetchApi<OpenStats>("/stats/open", { revalidate: 600 });

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-[920px] px-4 pb-20 pt-8 md:px-8">
          <PageBreadcrumb items={[{ label: "Stats" }]} />
          <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.16em] text-primary">Open stats</p>
          <h1 className="mt-2 text-[clamp(30px,4.5vw,44px)] font-semibold leading-tight tracking-tight text-foreground">Claude AI Directory in numbers</h1>
          <p className="mt-3 max-w-[64ch] text-[15px] leading-7 text-muted-foreground">
            Live numbers from our own first-party counters for the last 30 days, refreshed every 10 minutes. Visits are counted without cookies, and bots
            and automated browsers are skipped.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link href="/launches/submit" className="inline-flex h-10 items-center rounded-[6px] bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90">
              Launch your app
            </Link>
            <Link href="/?advertise=1" className="inline-flex h-10 items-center rounded-[6px] border border-border px-4 text-sm font-medium text-foreground hover:bg-card">
              Advertise to Claude builders
            </Link>
          </div>

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

function Body({ data }: { data: OpenStats }) {
  const { summary: s, rows, tracking_since: since } = data;
  const counting = since ? `counted since ${shortDate(since)}` : "counting starts today";
  const listings = s.resources.skills + s.resources.mcp + s.resources.agents + s.resources.plugins;

  return (
    <>
      <div className="mt-12">
        <SectionLabel aside={`Last ${data.days} days · all time`}>In numbers</SectionLabel>
        <div className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-[6px] border border-border bg-border md:grid-cols-4">
          <Stat label="visitors" value={since ? fmt(s.visitors.range) : "-"} sub={counting} />
          <Stat label="page_views" value={since ? fmt(s.page_views.range) : "-"} sub={counting} />
          <Stat label="listing_views" value={fmt(s.listing_views.range)} sub={`${fmt(s.listing_views.all_time)} all time`} />
          <Stat label="install_actions" value={fmt(s.installs.range)} sub={`${fmt(s.installs.all_time)} all time`} />
          <Stat label="new_members" value={`+${fmt(s.members.range)}`} sub={`${fmt(s.members.all_time)} all time`} />
          <Stat label="apps_launched" value={fmt(s.launches.range)} sub={`${fmt(s.launches.all_time)} all time`} />
          <Stat label="posts_and_comments" value={fmt(s.posts.range)} sub={`${fmt(s.posts.all_time)} all time`} />
          <Stat label="listings" value={fmt(listings)} sub={`${s.resources.mcp} MCP · ${s.resources.plugins} plugins`} />
        </div>
      </div>

      <div className="mt-12">
        <Chart title="Unique visitors per day" aside={since ? undefined : "Counter started today"}>
          <Bars rows={rows} value={(r) => r.visitors} from={since} />
        </Chart>
      </div>

      <div className="mt-12 grid gap-12 md:grid-cols-2">
        <Chart title="Listing and launch views" aside={`${fmt(s.listing_views.range)} in 30 days`}>
          <Bars rows={rows} value={(r) => r.listing_views + r.launch_views} />
        </Chart>
        <Chart title="Install actions per day" aside={`${fmt(s.installs.range)} in 30 days`}>
          <Bars rows={rows} value={(r) => r.installs} />
        </Chart>
        <Chart title="Registered members" aside={`+${fmt(s.members.range)} in 30 days`}>
          <Area rows={rows} />
        </Chart>
        <Chart title="Posts and comments per day" aside={`${fmt(s.posts.range)} in 30 days`}>
          <Bars rows={rows} value={(r) => r.posts} />
        </Chart>
      </div>

      <div className="mt-12 grid gap-12 md:grid-cols-2">
        <section>
          <SectionLabel aside="share of visitors, 30 days">Countries</SectionLabel>
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
