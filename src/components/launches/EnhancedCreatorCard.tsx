import Link from "next/link";
import { Github, Linkedin, Twitter, ArrowRight, UserRound } from "lucide-react";
import type { ShowcaseProject } from "@/types";

interface EnhancedCreatorCardProps {
  project: ShowcaseProject;
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function EnhancedCreatorCard({ project }: EnhancedCreatorCardProps) {
  const authorHref = project.author_username ? `/u/${project.author_username}` : null;
  const builderName = project.author_name || project.author_username || "Claude AI community member";
  const socials = project.creator_socials ?? {};

  return (
    <section className="rounded-2xl border border-border bg-card/40 p-6">
      <h2 className="font-mono text-[11px] font-normal uppercase tracking-[0.18em] text-muted-foreground mb-4">
        Creator
      </h2>
      <div className="space-y-4">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-border bg-background text-xl font-semibold text-muted-foreground">
            {project.author_name ? initials(project.author_name) : <UserRound className="h-8 w-8" />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-base text-foreground truncate">
              {builderName}
            </p>
            {project.author_username && (
              <p className="mt-0.5 text-sm text-muted-foreground">@{project.author_username}</p>
            )}
          </div>
        </div>

        {(socials.twitter || socials.github || socials.linkedin) && (
          <div className="flex gap-2">
            {socials.twitter && (
              <a
                href={socials.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background transition-colors hover:border-primary hover:text-primary"
                aria-label="Twitter"
              >
                <Twitter className="h-4 w-4" />
              </a>
            )}
            {socials.github && (
              <a
                href={socials.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background transition-colors hover:border-primary hover:text-primary"
                aria-label="GitHub"
              >
                <Github className="h-4 w-4" />
              </a>
            )}
            {socials.linkedin && (
              <a
                href={socials.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background transition-colors hover:border-primary hover:text-primary"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-4 w-4" />
              </a>
            )}
          </div>
        )}

        {authorHref && (
          <Link
            href={authorHref}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-full border border-border px-4 text-sm text-foreground transition-colors hover:border-primary hover:text-primary"
          >
            View profile
            <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>
    </section>
  );
}
