"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight } from "lucide-react";
import { api } from "@/lib/api";

interface Audience {
  tracking_since: string | null;
  summary: { page_views: { range: number; source?: string } };
}

export function SponsorAudience() {
  const { data } = useQuery({
    queryKey: ["stats", "open", 7],
    queryFn: () => api.get<Audience>("/stats/open?days=7"),
    staleTime: 600_000, retry: false,
  });
  const hasTraffic = data && (data.summary.page_views.source === "openpanel" || Boolean(data.tracking_since));
  return <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
    <p>{hasTraffic ? <><span className="font-medium tabular-nums text-foreground">{data.summary.page_views.range.toLocaleString("en-US")}</span> site page views in the last 7 days</> : "Explore our audience and traffic"}</p>
    <a href="/stats" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 text-foreground underline-offset-4 hover:underline">View stats<ArrowUpRight className="h-3 w-3" /><span className="sr-only"> (opens in a new tab)</span></a>
  </div>;
}
