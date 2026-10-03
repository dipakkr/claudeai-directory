import { LaunchLineRow } from "./LaunchListRow";
import { UpvotePill } from "./UpvotePill";
import type { ShowcaseProject } from "@/types";
import { LaunchSection } from "./LaunchSection";

interface SimilarProductsCarouselProps {
  currentProject: ShowcaseProject;
  projects: ShowcaseProject[];
  upvotesToday?: Record<string, number>;
}

export function SimilarProductsCarousel({
  currentProject,
  projects,
  upvotesToday = {},
}: SimilarProductsCarouselProps) {
  // Filter similar products: same category or overlapping tech stack.
  // Dedupe by title so near-identical listings (e.g. resubmissions) don't
  // show up twice in the same grid.
  const seenTitles = new Set<string>([currentProject.title.trim().toLowerCase()]);
  const similar = projects
    .filter((p) => p.id !== currentProject.id)
    .filter(
      (p) =>
        p.category === currentProject.category ||
        (currentProject.tech_stack?.some((tech) => p.tech_stack?.includes(tech)) ?? false)
    )
    .filter((p) => {
      const key = p.title.trim().toLowerCase();
      if (seenTitles.has(key)) return false;
      seenTitles.add(key);
      return true;
    })
    .slice(0, 6);

  if (similar.length === 0) {
    return null;
  }

  return (
    <LaunchSection title="Related launches">
      <ol className="divide-y divide-border/70">
        {similar.map((project, index) => (
          <LaunchLineRow
            key={project.id}
            project={project}
            rank={index + 1}
            surface="similar"
            upvotesToday={upvotesToday[project.id]}
            right={<UpvotePill count={project.upvotes ?? 0} />}
          />
        ))}
      </ol>
    </LaunchSection>
  );
}
