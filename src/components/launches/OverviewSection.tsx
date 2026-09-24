import { Users, Lightbulb, Wrench, Star, CheckCircle2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ShowcaseProject } from "@/types";
import { LaunchSection } from "./LaunchSection";

interface OverviewSectionProps {
  project: ShowcaseProject;
  /** Shown as rows when the listing has no structured overview yet. */
  useCases: string[];
}

interface Row {
  icon: LucideIcon;
  label?: string;
  content: string;
}

function OverviewRow({ icon: Icon, label, content }: Row) {
  return (
    <div
      className={`flex gap-4 border-b border-border px-5 last:border-b-0 md:px-8 ${label ? "py-6" : "items-center py-4"}`}
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-primary">
        <Icon className="h-4.5 w-4.5" aria-hidden="true" />
      </span>
      <div className={`min-w-0 ${label ? "pt-0.5" : ""}`}>
        {label && <h3 className="text-sm font-semibold text-foreground">{label}</h3>}
        <p className={`${label ? "mt-1.5 text-muted-foreground" : "text-foreground/85"} text-sm leading-7`}>{content}</p>
      </div>
    </div>
  );
}

export function OverviewSection({ project, useCases }: OverviewSectionProps) {
  const overview = project.overview;
  const rows: Row[] = [
    { icon: Users, label: "Who is it for?", content: overview?.audience ?? "" },
    { icon: Lightbulb, label: "Problem", content: overview?.problem ?? "" },
    { icon: Wrench, label: "Solution", content: overview?.solution ?? "" },
    { icon: Star, label: "What makes it unique", content: overview?.unique ?? "" },
  ].filter((row) => row.content.trim());

  if (rows.length) {
    return (
      <LaunchSection title="Overview" padded={false}>
        {rows.map((row) => (
          <OverviewRow key={row.label} {...row} />
        ))}
      </LaunchSection>
    );
  }

  if (!useCases.length) return null;

  return (
    <LaunchSection title="Use cases" padded={false}>
      {useCases.map((useCase) => (
        <OverviewRow key={useCase} icon={CheckCircle2} content={useCase} />
      ))}
    </LaunchSection>
  );
}
