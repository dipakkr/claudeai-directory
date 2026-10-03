"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export interface PulseEvent {
  type: "joined" | "launched" | "posted" | "upvoted" | "installed";
  who: string;
  what: string | null;
  href: string;
  at: string;
}

export interface Pulse {
  generated_at: string;
  stats: {
    members: { total: number; today: number };
    visitors_24h?: number;
    visitors_7d?: number;
    views?: { week: number; today: number };
    launches: { total: number; week: number };
    listings: { total: number };
    installs: { total: number; today: number };
  };
  events: PulseEvent[];
  upvotes_today: Record<string, number>;
  launch_impressions: Record<string, number>;
}

const VERB: Record<PulseEvent["type"], string> = {
  joined: "joined the community",
  launched: "launched",
  posted: "posted",
  upvoted: "upvoted",
  installed: "copied the install command for",
};

const clean = (s: string) => s.replace(/\s+[—–]\s+/g, ": ");

function ago(iso: string, now: number) {
  const s = Math.max(0, (now - Date.parse(iso)) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function Stat({ label, value, delta }: { label: string; value: number; delta?: string }) {
  return (
    <div className="bg-card px-4 py-3 text-left">
      <p className="font-mono text-[11px] text-muted-foreground">{label}</p>
      <p className="mt-1 font-mono text-[18px] font-medium tabular-nums text-foreground">{value.toLocaleString("en-US")}</p>
      {delta && <p className="mt-0.5 font-mono text-[11px] text-green-600 dark:text-green-400">▲ {delta}</p>}
    </div>
  );
}

/** Live headline numbers and a ticker of real recent activity under the hero. */
export function HomePulse({ pulse }: { pulse: Pulse }) {
  const events = pulse.events;
  const [index, setIndex] = useState(0);
  const [now, setNow] = useState(() => Date.parse(pulse.generated_at));

  useEffect(() => {
    if (events.length < 2) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % events.length);
      setNow(Date.now());
    }, 4000);
    return () => window.clearInterval(id);
  }, [events.length]);

  const s = pulse.stats;
  const e = events[index];
  return (
    <div className="mx-auto mt-8 max-w-[760px] overflow-hidden rounded-[10px] border border-border">
      <div className="grid grid-cols-2 gap-px bg-border sm:grid-cols-4">
        {/* Show that people are here and active: who visits, what they open, what gets launched. */}
        <Stat label="visitors_7d" value={s.visitors_7d ?? s.visitors_24h ?? 0} delta={s.visitors_24h ? `${s.visitors_24h} in 24h` : undefined} />
        <Stat label="page_views_7d" value={s.views?.week ?? 0} delta={s.views?.today ? `+${s.views.today} in 24h` : undefined} />
        <Stat label="apps_launched" value={s.launches.total} delta={s.launches.week ? `+${s.launches.week} this week` : undefined} />
        <Stat label="install_actions" value={s.installs.total} delta={s.installs.today ? `+${s.installs.today} today` : undefined} />
      </div>
      {e && (
        <div className="flex items-center gap-2 border-t border-border bg-card px-4 py-2.5 text-left font-mono text-[12.5px]" aria-live="polite">
          <span className="text-primary">&gt;</span>
          <Link key={index} href={e.href} className="min-w-0 flex-1 truncate text-muted-foreground animate-fade-in hover:text-foreground">
            <span className="text-foreground">{e.who}</span> {VERB[e.type]}
            {e.what && <span className="text-primary"> {clean(e.what)}</span>}
            <span className="text-muted-foreground/60"> · {ago(e.at, now)}</span>
          </Link>
          <span className="h-3.5 w-1.5 shrink-0 animate-pulse bg-muted-foreground/70" aria-hidden />
        </div>
      )}
    </div>
  );
}
