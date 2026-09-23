import { Users, AlertCircle, Lightbulb, Sparkles } from "lucide-react";
import type { ShowcaseProject } from "@/types";

interface OverviewSectionProps {
  project: ShowcaseProject;
}

export function OverviewSection({ project }: OverviewSectionProps) {
  const overview = project.overview;

  if (!overview?.audience && !overview?.problem && !overview?.solution && !overview?.unique) {
    return null;
  }

  const items = [
    {
      icon: Users,
      label: "Who is it for",
      content: overview?.audience,
    },
    {
      icon: AlertCircle,
      label: "The problem",
      content: overview?.problem,
    },
    {
      icon: Lightbulb,
      label: "The solution",
      content: overview?.solution,
    },
    {
      icon: Sparkles,
      label: "What makes it unique",
      content: overview?.unique,
    },
  ];

  return (
    <section className="space-y-4">
      <h2 className="font-mono text-[11px] font-normal uppercase tracking-[0.18em] text-muted-foreground">
        Overview
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {items.map((item) => {
          if (!item.content) return null;
          const Icon = item.icon;
          return (
            <div key={item.label} className="rounded-2xl border border-border bg-card/40 p-5">
              <div className="flex items-start gap-3">
                <Icon className="h-5 w-5 shrink-0 text-primary mt-0.5" />
                <div className="min-w-0">
                  <p className="font-mono text-[11px] font-normal uppercase tracking-[0.14em] text-muted-foreground">
                    {item.label}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-foreground">{item.content}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
