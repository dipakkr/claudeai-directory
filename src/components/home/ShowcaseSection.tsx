import Link from "next/link";
import { ArrowUpRight, ChevronUp, Github, Rocket } from "lucide-react";

import type { ShowcaseProject } from "@/types";

const ShowcaseSection = ({
  initialProjects = [],
}: {
  initialProjects?: ShowcaseProject[];
}) => {
  return (
    <section className="cad-section cad-section-rule">
      <div className="container">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2 text-base font-medium text-foreground">
              <Rocket className="h-4 w-4 text-primary" />
              Built an app with Claude?
            </h2>
            <p className="mt-1 max-w-[62ch] text-sm text-muted-foreground">
              Show it to people who actually use Claude. Listed apps get a page, a
              backlink, and a spot in the directory — free.
            </p>
          </div>
          <Link
            href="/submit"
            className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Submit your app
          </Link>
        </div>

        {initialProjects.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-8 text-center">
            <p className="text-sm text-foreground">No apps listed yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Be the first — submissions are reviewed and usually live the same week.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {initialProjects.slice(0, 6).map((project) => (
              <Link
                key={project.id}
                href={`/showcase/${project.id}`}
                className="cad-card group flex flex-col p-4"
              >
                <div className="mb-2 flex items-start justify-between gap-2">
                  <h3 className="truncate text-sm font-medium text-foreground">
                    {project.title}
                  </h3>
                  <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </div>

                <p className="mb-3 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                  {project.description}
                </p>

                {project.tech_stack?.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-1">
                    {project.tech_stack.slice(0, 3).map((tech) => (
                      <span
                        key={tech}
                        className="rounded-md border border-border px-1.5 py-0.5 text-[11px] text-muted-foreground"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-auto flex items-center gap-3 border-t border-border pt-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <ChevronUp className="h-3 w-3 text-primary" />
                    {project.upvotes ?? 0}
                  </span>
                  {project.github_url && (
                    <span className="flex items-center gap-1">
                      <Github className="h-3 w-3" />
                      Source
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ShowcaseSection;
