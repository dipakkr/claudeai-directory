import Link from "next/link";
import type { ReactNode } from "react";
import { BadgeCheck } from "lucide-react";

import { faviconFor } from "@/lib/directory";
import type { ShowcaseProject } from "@/types";

/** One look for launch lists everywhere (homepage, /launches, related): DevHunt-style plain rows. */

export const launchCategory = (p: ShowcaseProject) => p.category?.trim() || p.tech_stack?.[0]?.trim() || "Claude app";
const pitch = (p: ShowcaseProject) => p.tagline?.trim() || p.description.trim();

export function LaunchLogo({ project, size = "md" }: { project: ShowcaseProject; size?: "sm" | "md" }) {
  const src = project.logo_url || faviconFor(project.app_url || project.demo_url) || project.images?.[0];
  const box = size === "sm" ? "h-7 w-7 rounded-[6px] text-xs" : "h-11 w-11 rounded-[10px] text-base";
  return (
    <span className={`flex shrink-0 items-center justify-center overflow-hidden border border-border bg-background font-semibold text-muted-foreground ${box}`}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- maker's logo or site favicon
        <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" referrerPolicy="no-referrer" />
      ) : (
        project.title.trim()[0]?.toUpperCase() || "L"
      )}
    </span>
  );
}

function Rank({ n }: { n: number }) {
  return <span className={`w-5 shrink-0 text-center font-mono text-sm tabular-nums ${n <= 3 ? "text-primary" : "text-muted-foreground"}`}>{n}</span>;
}

/** Full row: rank, logo, name, pitch, a mono meta line, "by maker", and an action on the right (upvote). */
export function LaunchListRow({
  project,
  rank,
  impressions = 0,
  upvotesToday = 0,
  right,
  surface,
}: {
  project: ShowcaseProject;
  rank: number;
  impressions?: number;
  upvotesToday?: number;
  right: ReactNode;
  surface: string;
}) {
  const maker = project.author_name || project.author_username;
  const meta = [impressions > 0 ? `${impressions.toLocaleString("en-US")} impressions` : null, launchCategory(project)].filter(Boolean) as string[];
  return (
    <li data-launch-impression={project.id} data-surface={surface} className="border-b border-border last:border-b-0">
      <div className="flex items-center gap-4 py-5">
        <Rank n={rank} />
        <Link href={`/launches/${encodeURIComponent(project.id)}`} className="group flex min-w-0 flex-1 items-center gap-4">
          <LaunchLogo project={project} />
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-center gap-1.5">
              <h3 className="truncate font-sans text-[16px] font-medium leading-tight text-foreground group-hover:underline">{project.title}</h3>
              {project.badge_verified && <BadgeCheck className="h-4 w-4 shrink-0 fill-amber-400 text-background" aria-label="Badge verified" />}
            </div>
            <p className="mt-1 line-clamp-1 text-[15px] leading-6 text-muted-foreground">{pitch(project)}</p>
            <p className="mt-1 flex flex-wrap items-center gap-x-2 font-mono text-[12px] text-muted-foreground/80">
              {meta.map((item, i) => (
                <span key={item} className="inline-flex items-center gap-2">
                  {i > 0 && <span aria-hidden>·</span>}
                  {item}
                </span>
              ))}
              {upvotesToday > 0 && (
                <span className="inline-flex items-center gap-2">
                  <span aria-hidden>·</span>
                  <span className="text-green-600 dark:text-green-400">▲ +{upvotesToday} today</span>
                </span>
              )}
            </p>
            {maker && (
              <p className="mt-1.5 flex items-center gap-1.5 text-[13px] text-muted-foreground">
                by
                {project.author_avatar && (
                  // eslint-disable-next-line @next/next/no-img-element -- maker avatar
                  <img src={project.author_avatar} alt="" className="h-4 w-4 rounded-full object-cover" referrerPolicy="no-referrer" />
                )}
                <span className="text-foreground/90">{maker}</span>
              </p>
            )}
          </div>
        </Link>
        {right}
      </div>
    </li>
  );
}

/** Compact row for side lists like "Related launches": rank, small logo, "Name · pitch", action. */
export function LaunchCompactRow({ project, rank, right, surface }: { project: ShowcaseProject; rank: number; right: ReactNode; surface: string }) {
  return (
    <li data-launch-impression={project.id} data-surface={surface} className="flex items-center gap-3 py-2.5">
      <Rank n={rank} />
      <Link href={`/launches/${encodeURIComponent(project.id)}`} className="group flex min-w-0 flex-1 items-center gap-3">
        <LaunchLogo project={project} size="sm" />
        <span className="min-w-0 truncate text-[14px]">
          <span className="font-medium text-foreground group-hover:underline">{project.title}</span>
          <span className="text-muted-foreground"> · {pitch(project)}</span>
        </span>
      </Link>
      {right}
    </li>
  );
}
