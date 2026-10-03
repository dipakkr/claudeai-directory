import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { LaunchLineRow } from "@/components/launches/LaunchListRow";
import { UpvotePill } from "@/components/launches/UpvotePill";
import type { ShowcaseProject } from "@/types";

/**
 * MCP servers launched by their makers, on /mcp. They link to their launch pages (no install
 * command here: launches don't carry verified install metadata; a full listing comes via /submit).
 */
export default function McpLaunchesSection({ launches, upvotesToday = {} }: { launches: ShowcaseProject[]; upvotesToday?: Record<string, number> }) {
  if (!launches.length) return null;
  return (
    <section className="mt-14">
      <div className="mb-2 flex items-end justify-between gap-4">
        <div>
          <h2 className="font-sans text-[22px] font-normal leading-tight text-foreground">Launched by makers</h2>
          <p className="mt-1 text-sm text-muted-foreground">New MCP servers, launched on Claude AI Directory and upvoted by builders.</p>
        </div>
        <Link href="/launches/submit" className="hidden shrink-0 items-center gap-1 text-sm text-muted-foreground hover:text-foreground sm:inline-flex">
          Launch your MCP <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      <ol className="divide-y divide-border/70">
        {launches.slice(0, 6).map((project, index) => (
          <LaunchLineRow
            key={project.id}
            project={project}
            rank={index + 1}
            surface="mcp_page"
            upvotesToday={upvotesToday[project.id]}
            right={<UpvotePill count={project.upvotes ?? 0} />}
          />
        ))}
      </ol>
    </section>
  );
}
