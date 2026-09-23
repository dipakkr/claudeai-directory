import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { faviconFor } from "@/lib/directory";
import { FaviconBox } from "./FaviconBox";
import type { ShowcaseProject } from "@/types";

interface SimilarProductsCarouselProps {
  currentProject: ShowcaseProject;
  projects: ShowcaseProject[];
}

export function SimilarProductsCarousel({
  currentProject,
  projects,
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
    <section className="space-y-4">
      <h2 className="font-mono text-[11px] font-normal uppercase tracking-[0.18em] text-muted-foreground">
        Related Launches
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {similar.map((project) => {
          const logo = faviconFor(project.app_url || project.demo_url);
          return (
            <Link
              key={project.id}
              href={`/launches/${project.id}`}
              className="group rounded-2xl border border-border bg-card/40 p-4 transition-all hover:border-primary/50 hover:bg-card/60"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <FaviconBox
                  src={logo}
                  name={project.title}
                  className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-background text-sm font-semibold text-muted-foreground"
                />
                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <h3 className="font-semibold text-sm text-foreground truncate">
                {project.title}
              </h3>
              <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                {project.tagline || project.description}
              </p>
              {project.tech_stack?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {project.tech_stack.slice(0, 2).map((tech) => (
                    <span
                      key={tech}
                      className="inline-block rounded-full bg-foreground/5 px-2 py-0.5 text-xs text-muted-foreground"
                    >
                      {tech}
                    </span>
                  ))}
                  {project.tech_stack.length > 2 && (
                    <span className="inline-block text-xs text-muted-foreground">
                      +{project.tech_stack.length - 2}
                    </span>
                  )}
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
