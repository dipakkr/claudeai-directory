"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { readRecent, subscribeRecent, type RecentItem } from "@/lib/recent";

const EMPTY: RecentItem[] = [];

/** Per-browser list of recently opened resources. A UI convenience only. */
export default function RecentlyViewed() {
  const items = useSyncExternalStore(subscribeRecent, readRecent, () => EMPTY);
  if (items.length === 0) return null;

  return (
    <div>
      <h2 className="mb-3 font-mono text-[11px] font-normal uppercase tracking-[0.14em] text-muted-foreground">
        Recently viewed
      </h2>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="inline-flex h-8 items-center gap-2 rounded-full border border-border px-3 text-[13px] text-foreground transition-colors hover:border-[var(--cad-line-hover)]"
          >
            <span className="font-mono text-[10px] uppercase text-muted-foreground">{item.kind}</span>
            {item.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
