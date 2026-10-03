import Link from "next/link";
import { ArrowRight, Rocket } from "lucide-react";
import { LaunchListRow } from "@/components/launches/LaunchListRow";
import { UpvotePill } from "@/components/launches/UpvotePill";
import type { ShowcaseProject } from "@/types";

export default function HomeLaunches({
  projects,
  unavailable,
  impressions = {},
  upvotesToday = {},
}: {
  projects: ShowcaseProject[];
  unavailable: boolean;
  impressions?: Record<string, number>;
  upvotesToday?: Record<string, number>;
}) {
  // Every live launch, so each maker gets homepage traffic (ranked: promoted, then upvotes).
  const shownProjects = projects;

  return (
    <section id="launches" aria-labelledby="launches-heading" className="mx-auto max-w-[1000px] scroll-mt-24 px-4 md:px-8">
      {/* DevHunt-style: quiet label with a rule, then plain rows. */}
      <div className="flex items-center gap-3">
        <h2 id="launches-heading" className="shrink-0 font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-foreground">
          Built with Claude
          {projects.length > 0 && <span className="ml-2 text-muted-foreground">{projects.length}</span>}
        </h2>
        <span className="h-px flex-1 bg-border" aria-hidden="true" />
        <span className="shrink-0 text-xs text-muted-foreground">Upvote your favorite</span>
      </div>

      <ol className="mt-2">
        {shownProjects.map((project, index) => (
          <LaunchListRow
            key={project.id}
            project={project}
            rank={index + 1}
            impressions={impressions[project.id]}
            upvotesToday={upvotesToday[project.id]}
            surface="home"
            right={
              <Link href={`/launches/${encodeURIComponent(project.id)}`} aria-label={`Upvote ${project.title}`} className="shrink-0">
                <UpvotePill count={project.upvotes ?? 0} highlight={index === 0 && (project.upvotes ?? 0) > 0} />
              </Link>
            }
          />
        ))}
      </ol>
      {!projects.length && (
        <p className="py-6 text-sm text-muted-foreground">
          {unavailable ? "Launches are temporarily unavailable." : "Member launches will appear here once listed. Submit your app to get started."}
        </p>
      )}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm">
        <Link href="/launches" className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground">
          All launches <ArrowRight className="h-3.5 w-3.5" />
        </Link>
        <Link href="/launches/submit" className="inline-flex items-center gap-1.5 font-medium text-foreground hover:underline">
          <Rocket className="h-3.5 w-3.5" />
          Launch your app (free)
        </Link>
      </div>
    </section>
  );
}
