import Link from "next/link";
import { ArrowRight, ArrowUp, BadgeCheck, MessageCircle, Rocket, Tag } from "lucide-react";
import { faviconFor } from "@/lib/directory";
import type { ShowcaseProject } from "@/types";

function normalizeCategory(project: ShowcaseProject) {
  return project.category?.trim() || project.tech_stack?.[0]?.trim() || "Claude app";
}

function shortPitch(project: ShowcaseProject) {
  return project.tagline?.trim() || project.description.trim();
}

function LaunchIcon({ project }: { project: ShowcaseProject }) {
  const src = project.logo_url || faviconFor(project.app_url || project.demo_url) || project.images?.[0];
  const fallback = project.title.trim()[0]?.toUpperCase() || "L";

  return (
    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-background shadow-sm sm:h-16 sm:w-16">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- dynamic favicon for submitted launch URLs
        <img
          src={src}
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      ) : (
        <span className="text-xl font-semibold text-muted-foreground">{fallback}</span>
      )}
    </div>
  );
}

export default function HomeLaunches({ projects, unavailable }: { projects: ShowcaseProject[]; unavailable: boolean }) {
  const shownProjects = projects.slice(0, 3);

  return (
    <section id="launches" aria-labelledby="launches-heading" className="mx-auto mt-16 max-w-[840px] scroll-mt-24 px-4 md:px-8">
      <h2 id="launches-heading" className="text-2xl leading-tight text-foreground">Built with Claude</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">Top apps launched by the community. Try them, meet the makers and share feedback.</p>
      <div className="mt-5 border-y border-border">
        {shownProjects.map((project, index) => {
          const category = normalizeCategory(project);
          const tags = [category, ...(project.tech_stack ?? []).filter((tag) => tag !== category)].slice(0, 3);

          return (
            <article key={project.id} className={`border-b border-border last:border-b-0 ${index < 3 ? "bg-primary/[0.035]" : "bg-background"}`}>
              <div className="flex items-center gap-3 py-4">
                <div className="flex w-10 shrink-0 items-center justify-center text-primary">
                  <span className="text-base font-semibold leading-none">#{index + 1}</span>
                </div>
                <Link href={`/launches/${encodeURIComponent(project.id)}`} className="flex min-w-0 flex-1 items-center gap-4">
                  <LaunchIcon project={project} />
                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 items-center gap-2">
                      <h3 className="truncate text-base font-semibold leading-tight text-foreground sm:text-lg">{project.title}</h3>
                      {project.badge_verified && <BadgeCheck className="h-4 w-4 shrink-0 fill-amber-400 text-amber-400" aria-hidden="true" />}
                    </div>
                    <p className="mt-1.5 line-clamp-1 text-sm leading-5 text-muted-foreground">{shortPitch(project)}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
                        Feedback
                      </span>
                      <span className="inline-flex min-w-0 items-center gap-1.5">
                        <Tag className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        <span className="truncate">{tags.join(", ")}</span>
                      </span>
                    </div>
                  </div>
                </Link>
                <Link
                  href={`/launches/${encodeURIComponent(project.id)}`}
                  aria-label={`View ${project.title}`}
                  className="flex h-14 w-12 shrink-0 flex-col items-center justify-center gap-0.5 rounded-xl border border-border bg-background text-foreground shadow-sm transition hover:border-[var(--cad-line-hover)] hover:bg-card sm:h-16 sm:w-14"
                >
                  <ArrowUp className="h-4 w-4" aria-hidden="true" />
                  <span className="text-base font-semibold leading-none">{project.upvotes ?? 0}</span>
                </Link>
              </div>
            </article>
          );
        })}
        {!projects.length && <p className="py-6 text-sm text-muted-foreground">{unavailable ? "Launches are temporarily unavailable. Browse the showcase or submit your app." : "Member launches will appear here once listed. Submit your app to get started."}</p>}
      </div>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-[52ch] text-xs leading-5 text-muted-foreground">Free to submit. Add the launch badge to your site, then verify it to publish.</p>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <Link href="/launches" className="inline-flex items-center gap-1 py-2 text-sm text-foreground hover:underline">All launches <ArrowRight className="h-4 w-4" /></Link>
          <Link href="/launches/submit" className="inline-flex items-center gap-2 py-2 text-sm font-medium text-foreground underline underline-offset-4"><Rocket className="h-4 w-4" />Launch your app</Link>
        </div>
      </div>
    </section>
  );
}
