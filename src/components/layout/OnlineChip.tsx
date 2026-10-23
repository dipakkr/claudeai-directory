"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Reach } from "@/components/advertise/SponsorReach";

type DailyReach = Reach & { rows?: { date: string; visitors: number }[] };

/** Shares Open Stats' daily visitor totals, counted since midnight UTC. */
export function OnlineChip() {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const update = () => setNow(Date.now());
    const initial = window.setTimeout(update, 0);
    const interval = window.setInterval(update, 30_000);
    return () => {
      window.clearTimeout(initial);
      window.clearInterval(interval);
    };
  }, []);
  const { data, isError } = useQuery({
    queryKey: ["stats", "open", 7],
    queryFn: () => api.get<DailyReach>("/stats/open?days=7"),
    staleTime: 60_000,
    refetchInterval: 60_000,
    retry: 1,
  });
  const today = now === null ? null : new Date(now).toISOString().slice(0, 10);
  const count = data?.rows?.find((row) => row.date === today)?.visitors;
  const generatedAt = Date.parse(data?.updated_at ?? "");
  const available = !isError && typeof count === "number" && Number.isSafeInteger(count) && count >= 0
    && now !== null && Number.isFinite(generatedAt) && now - generatedAt < 720_000;

  return (
    <div className="flex h-6 shrink-0 items-center">
      {available && (
        <Link
          href="/stats"
          title="Visitors recorded today, since midnight UTC. Counted once per IP per day. Statistics refresh approximately every 10 minutes. View open stats."
          className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2 py-1 text-[10px] font-medium leading-3 tabular-nums transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 ${count > 0
            ? "border-emerald-600/20 bg-emerald-500/[0.06] text-emerald-700 hover:bg-emerald-500/10 dark:text-emerald-400"
            : "border-border text-muted-foreground hover:bg-muted"}`}
        >
          <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${count > 0 ? "bg-emerald-500" : "bg-muted-foreground/50"}`} />
          <span>{count.toLocaleString("en-US")} online today</span>
        </Link>
      )}
    </div>
  );
}
