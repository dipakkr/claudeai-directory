import Link from "next/link";
import { LaunchVoteButton } from "@/components/launches/LaunchVoteButton";
import { ArrowRight, Rocket } from "lucide-react";
import { LaunchListRow } from "@/components/launches/LaunchListRow";
import type { ShowcaseProject } from "@/types";
import { publicLaunches } from "@/lib/home-community";

export default function HomeLaunches({
  projects,
  unavailable,
  upvotesToday = {},
}: {
  projects: ShowcaseProject[];
  unavailable: boolean;
  upvotesToday?: Record<string, number>;
}) {
  const shownProjects = publicLaunches(projects).slice(0, 10);

  return (
    <section id="launches" aria-labelledby="launches-heading" className="mx-auto max-w-[1000px] scroll-mt-24 px-4 md:px-8">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border pb-4">
        <div>
          <h2 id="launches-heading" className="text-[24px] font-medium tracking-tight text-foreground">
            Latest launches
          </h2>
          <p className="mt-1 text-[13px] text-muted-foreground">Discover what builders are launching with Claude. Newest first.</p>
        </div>
        <Link href="/launches/submit" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
          <Rocket className="h-3.5 w-3.5" aria-hidden="true" />
          Launch your app
        </Link>
      </div>

      <ol className="mt-2">
        {shownProjects.map((project, index) => (
          <LaunchListRow
            key={project.id}
            project={project}
            rank={index + 1}
            upvotesToday={upvotesToday[project.id]}
            surface="home"
            right={<LaunchVoteButton project={project} placement="home_built_with_claude" />}
          />
        ))}
      </ol>
      {!shownProjects.length && (
        <p className="py-6 text-sm text-muted-foreground">
          {unavailable ? "Launches are temporarily unavailable." : "Member launches will appear here once listed. Submit your app to get started."}
        </p>
      )}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm">
        <Link href="/launches" className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground">
          All launches <ArrowRight className="h-3.5 w-3.5" />
        </Link>
        <span className="text-xs text-muted-foreground">Upvote your favorite products</span>
      </div>
    </section>
  );
}
