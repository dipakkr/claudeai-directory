import { Code2 } from "lucide-react";
import type { ShowcaseProject } from "@/types";

interface TechStackCardProps {
  project: ShowcaseProject;
}

export function TechStackCard({ project }: TechStackCardProps) {
  const techStack = project.tech_stack ?? [];
  const platforms = project.platforms ?? [];
  const languages = techStack.filter((tech) => !platforms.includes(tech));

  if (!languages.length && !platforms.length) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-border bg-card/40 p-5">
      <div className="flex items-start gap-3">
        <Code2 className="h-5 w-5 shrink-0 text-primary mt-0.5" />
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[11px] font-normal uppercase tracking-[0.14em] text-muted-foreground">
            Built with
          </p>
          <div className="mt-4 space-y-4">
            {platforms.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                  Platforms
                </p>
                <div className="flex flex-wrap gap-2">
                  {platforms.map((platform) => (
                    <span
                      key={platform}
                      className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary font-medium"
                    >
                      {platform}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {languages.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                  {platforms.length > 0 ? "Other Technologies" : "Technologies"}
                </p>
                <div className="flex flex-wrap gap-2">
                  {languages.map((tech) => (
                    <span
                      key={tech}
                      className="rounded-full bg-foreground/5 px-3 py-1 text-xs text-muted-foreground border border-border/50"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
