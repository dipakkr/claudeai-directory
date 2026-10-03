"use client";

import Link from "next/link";
import { ArrowRight, Megaphone } from "lucide-react";
import { LaunchLogo } from "@/components/launches/LaunchListRow";
import { UpvotePill } from "@/components/launches/UpvotePill";
import { SPONSOR_MONTHLY_PRICE, openAdvertiseDialog } from "@/lib/advertise";
import { track } from "@/lib/analytics";
import type { ShowcaseProject } from "@/types";

const pitch = (p: ShowcaseProject) => p.tagline?.trim() || p.description.trim();

/**
 * The homepage "MCP launches" tab: an open sponsor row on top, then MCP servers launched
 * by members, ranked like every launch list (paid "Promoted" launches first, then upvotes).
 */
export default function HomeMcpLaunches({ projects, limit = 25 }: { projects: ShowcaseProject[]; limit?: number }) {
  const shown = projects.slice(0, limit);
  return (
    <div>
      <button
        type="button"
        onClick={() => {
          track("ad_slot_clicked", { slot: "home_mcp_launches" });
          openAdvertiseDialog(undefined, "sidebar");
        }}
        className="grid w-full grid-cols-[2rem_2.25rem_minmax(0,1fr)_auto] items-center gap-3 border-b border-border/70 bg-primary/[0.04] py-3.5 text-left transition-colors hover:bg-primary/[0.07] sm:grid-cols-[3rem_2.25rem_minmax(0,1fr)_auto]"
      >
        <span className="font-mono text-[13px] text-primary">AD</span>
        <span className="flex h-9 w-9 items-center justify-center rounded-md border border-dashed border-primary/40 text-primary">
          <Megaphone className="h-4 w-4" aria-hidden="true" />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-[15px] text-foreground">Your MCP here</span>
          <span className="mt-0.5 block truncate text-[13px] text-muted-foreground">
            Get in front of people looking for MCP servers. ${SPONSOR_MONTHLY_PRICE}/month.
          </span>
        </span>
        <span className="rounded border border-border px-1.5 py-px font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
          Sponsored
        </span>
      </button>

      {shown.length > 0 ? (
        <ol>
          {shown.map((project, index) => (
            <li
              key={project.id}
              data-launch-impression={project.id}
              data-surface="home_mcp_tab"
              className="border-b border-border/70"
            >
              <Link
                href={`/launches/${encodeURIComponent(project.id)}`}
                className="group grid grid-cols-[2rem_2.25rem_minmax(0,1fr)_auto] items-center gap-3 py-3.5 sm:grid-cols-[3rem_2.25rem_minmax(0,1fr)_auto]"
              >
                <span className={`font-mono text-[13px] ${index < 3 ? "text-primary" : "text-muted-foreground"}`}>{index + 1}</span>
                <span className="[&>span]:h-9 [&>span]:w-9 [&>span]:rounded-md">
                  <LaunchLogo project={project} />
                </span>
                <span className="min-w-0">
                  <span className="flex items-center gap-2">
                    <span className="truncate text-[15px] text-foreground transition-colors group-hover:text-primary">{project.title}</span>
                    {project.promoted && (
                      <span className="shrink-0 rounded border border-primary/40 px-1.5 py-px font-mono text-[10px] uppercase tracking-wide text-primary">
                        Promoted
                      </span>
                    )}
                  </span>
                  <span className="mt-0.5 block truncate text-[13px] text-muted-foreground">{pitch(project)}</span>
                </span>
                <UpvotePill count={project.upvotes ?? 0} />
              </Link>
            </li>
          ))}
        </ol>
      ) : (
        <p className="py-12 text-center text-sm text-muted-foreground">No MCP launches yet. Be the first.</p>
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
