"use client";

import { Fragment } from "react";
import Link from "next/link";
import { ArrowRight, Megaphone } from "lucide-react";
import { LaunchLineRow } from "@/components/launches/LaunchListRow";
import { UpvotePill } from "@/components/launches/UpvotePill";
import { SPONSOR_MONTHLY_PRICE, openAdvertiseDialog } from "@/lib/advertise";
import { track } from "@/lib/analytics";
import type { ShowcaseProject } from "@/types";

/** Sponsored rows sit inside the list, DevHunt-style: after the 3rd launch, then every 8. */
const sponsorAfter = (index: number, total: number) => index === Math.min(2, total - 1) || (index > 2 && (index - 2) % 8 === 0);

/** An open sponsor slot, styled like a launch row in an outlined box. Replaced by a real sponsor once one pays. */
function SponsorRow() {
  return (
    <li className="py-1.5">
      <button
        type="button"
        onClick={() => {
          track("ad_slot_clicked", { slot: "home_mcp_launches" });
          openAdvertiseDialog(undefined, "sidebar");
        }}
        className="flex w-full items-center gap-4 rounded-[10px] border border-primary/40 bg-primary/[0.04] px-3 py-3 text-left transition-colors hover:border-primary/70 sm:-mx-3 sm:w-[calc(100%+1.5rem)]"
      >
        <span className="hidden w-6 shrink-0 sm:block" aria-hidden="true" />
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] border border-dashed border-primary/50 text-primary">
          <Megaphone className="h-4 w-4" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1 truncate text-[15px]">
          <span className="text-foreground">Your MCP here</span>
          <span className="text-muted-foreground"> · Reach people looking for MCP servers. ${SPONSOR_MONTHLY_PRICE}/mo</span>
        </span>
        <span className="shrink-0 rounded-[6px] border border-border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
          Sponsored
        </span>
      </button>
    </li>
  );
}

/**
 * The homepage "MCP launches" tab, laid out like DevHunt's list: one line per launch
 * ("Name · pitch"), today's upvotes, the upvote count, and sponsored rows in between.
 * Ranked like every launch list (paid "Promoted" launches first, then upvotes).
 */
export default function HomeMcpLaunches({
  projects,
  upvotesToday = {},
  viewsToday = {},
  limit = 25,
}: {
  projects: ShowcaseProject[];
  upvotesToday?: Record<string, number>;
  viewsToday?: Record<string, number>;
  limit?: number;
}) {
  const shown = projects.slice(0, limit);
  return (
    <div>
      {shown.length > 0 ? (
        <ol className="divide-y divide-border/70">
          {shown.map((project, index) => {
            const today = upvotesToday[project.id] ?? 0;
            return (
              <Fragment key={project.id}>
                <LaunchLineRow
                  project={project}
                  rank={index + 1}
                  surface="home_mcp_tab"
                  upvotesToday={today}
                  viewsToday={viewsToday[project.id]}
                  right={<UpvotePill count={project.upvotes ?? 0} />}
                />
                {sponsorAfter(index, shown.length) && <SponsorRow />}
              </Fragment>
            );
          })}
        </ol>
      ) : (
        <ol>
          <SponsorRow />
          <li className="py-12 text-center text-sm text-muted-foreground">No MCP launches yet. Be the first.</li>
        </ol>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
        <Link href="/launches" className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground">
          All launches <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
        <Link href="/launches/submit" className="inline-flex items-center gap-1 text-foreground hover:underline hover:underline-offset-4">
          Launch your MCP <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
