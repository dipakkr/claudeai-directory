"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight } from "lucide-react";
import { api } from "@/lib/api";
import { Stat } from "@/components/stats/Stat";

type Metric = { range: number; prev?: number; source?: string };
export interface Reach {
  updated_at?: string;
  tracking_since: string | null;
  summary: { visitors: Metric; page_views: Metric };
  countries: { code: string; share: number }[];
}
function countryName(code: string) {
  try { return new Intl.DisplayNames(["en"], { type: "region" }).of(code) ?? code; }
  catch { return code; }
}
function flag(code: string) {
  return /^[A-Z]{2}$/.test(code) ? String.fromCodePoint(...[...code].map(char => 0x1f1a5 + char.charCodeAt(0))) : "";
}
// Ahrefs score supplied by the site owner on 2026-10-16; not a live API response.
const DOMAIN_RATING = 26;

export function SponsorReach() {
  const { data, isPending } = useQuery({
    queryKey: ["stats", "open", 7],
    queryFn: () => api.get<Reach>("/stats/open?days=7"),
    staleTime: 600_000, gcTime: 86_400_000, retry: false,
  });
  const hasTraffic = data && (data.summary.visitors.source === "openpanel" || Boolean(data.tracking_since));
  return <section aria-label="Audience reach" className="flex flex-1 flex-col">
    <div className="flex items-baseline justify-between gap-2"><h3 className="text-[13px] font-medium">Audience reach</h3><span className="text-[10px] text-muted-foreground">Last 7 days</span></div>
    {data ? <>
      <div className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-[4px] border border-border bg-border [&>div]:bg-background [&>div]:p-3 [&>div>div]:flex-col [&>div>div]:items-start [&>div>div]:gap-1 [&>div>div>p]:whitespace-nowrap [&_span]:whitespace-nowrap [&>div>p]:text-[18px] [&_span]:text-[9px] [&_p.font-mono]:text-[10px]">
        <Stat label="Visitors" value={hasTraffic ? data.summary.visitors.range.toLocaleString("en-US") : "—"} now={hasTraffic ? data.summary.visitors.range : undefined} prev={data.summary.visitors.prev} />
        <Stat label="Page views" value={hasTraffic ? data.summary.page_views.range.toLocaleString("en-US") : "—"} now={hasTraffic ? data.summary.page_views.range : undefined} prev={data.summary.page_views.prev} />
      </div>
      <h4 className="mb-3 mt-6 text-[11px] font-medium">Top visitor countries</h4>
      {data.countries.length ? <ul className="space-y-2">
        {[...data.countries].sort((a, b) => b.share - a.share).slice(0, 5).map(country => <li key={country.code}>
          <div className="flex items-center justify-between gap-2 text-[11px]"><span className="flex min-w-0 items-center gap-2"><span aria-hidden="true">{flag(country.code)}</span><span className="truncate">{countryName(country.code)}</span></span><span className="text-[10px] tabular-nums text-muted-foreground">{(country.share * 100).toFixed(1)}%</span></div>
          <div aria-hidden="true" className="mt-1.5 h-1 overflow-hidden rounded-[2px] bg-foreground/5"><div className="h-full bg-primary/50" style={{width: `${Math.min(100, Math.max(0, country.share * 100))}%`}} /></div>
        </li>)}
      </ul> : <p className="text-[11px] text-muted-foreground">Country data is not available yet.</p>}
    </> : <p role="status" className="py-5 text-xs leading-5 text-muted-foreground">{isPending ? "Loading audience statistics…" : "Audience statistics are temporarily unavailable."}</p>}
    <div className="mt-5 flex min-h-24 flex-1 items-center justify-center gap-3 border-t border-border py-4" aria-label={`Ahrefs Domain Rating: ${DOMAIN_RATING} out of 100`}>
      <svg viewBox="0 0 44 44" className="h-14 w-14 shrink-0 -rotate-90" aria-hidden="true">
        <circle cx="22" cy="22" r="17" fill="none" stroke="currentColor" strokeWidth="8" className="text-foreground/10" />
        <circle cx="22" cy="22" r="17" fill="none" stroke="currentColor" strokeWidth="8" pathLength="100" strokeDasharray={`${DOMAIN_RATING} ${100 - DOMAIN_RATING}`} className="text-primary" />
      </svg>
      <div>
        <p className="text-[12px] font-medium">Domain Rating <span className="font-normal text-muted-foreground">· Ahrefs</span></p>
        <p className="mt-1 text-[28px] font-medium leading-none tabular-nums">{DOMAIN_RATING}<span className="ml-1 text-[10px] font-normal text-muted-foreground">/ 100</span></p>
      </div>
    </div>
    <a href="/stats" target="_blank" rel="noopener noreferrer" className="inline-flex self-center items-center justify-center gap-1 text-[11px] text-muted-foreground hover:text-foreground">View full stats<ArrowUpRight className="h-3 w-3" /><span className="sr-only"> (opens in a new tab)</span></a>
  </section>;
}
