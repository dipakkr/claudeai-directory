import Link from "next/link";
import type { ReactNode } from "react";
import { BadgeCheck } from "lucide-react";

import { faviconFor } from "@/lib/directory";
import { launchTheme } from "@/lib/launch-theme";
import type { ShowcaseProject } from "@/types";

/** One look for launch lists everywhere (homepage, /launches, related): DevHunt-style plain rows. */

export const launchCategory = (p: ShowcaseProject) => p.category?.trim() || p.tech_stack?.[0]?.trim() || "Claude app";
const pitch = (p: ShowcaseProject) => p.tagline?.trim() || p.description.trim();

/** The launch's logo on a tile tinted with its theme colour (same colour as its share card). */
export function LaunchLogo({ project, size = "md" }: { project: ShowcaseProject; size?: "sm" | "md" | "row" }) {
  const src = project.logo_url || faviconFor(project.app_url || project.demo_url) || project.images?.[0];
  const box = size === "sm" ? "h-7 w-7 rounded-[6px] text-xs" : size === "row" ? "h-10 w-10 rounded-[10px] text-sm" : "h-11 w-11 rounded-[10px] text-base";
  const theme = launchTheme(project.id);
  return (
    <span
      className={`flex shrink-0 items-center justify-center overflow-hidden border font-semibold ${box}`}
      style={{ background: `linear-gradient(180deg, ${theme.top}, ${theme.bottom})`, borderColor: `${theme.accent}40`, color: theme.accent }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- maker's logo or site favicon
        <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" referrerPolicy="no-referrer" />
      ) : (
        project.title.trim()[0]?.toUpperCase() || "L"
      )}
    </span>
  );
}

/** Green "▲ +N today": upvotes the launch got today. Nothing when there are none. */
export function TodayDelta({ upvotes = 0, className = "" }: { upvotes?: number; className?: string }) {
  if (upvotes <= 0) return null;
  return <span className={`inline-flex items-center font-mono text-[12px] text-green-600 dark:text-green-400 ${className}`}>▲ +{upvotes} today</span>;
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
  const meta = [impressions > 0 ? `${impressions.toLocaleString("en-US")} impressions` : null, launchCategory(project), project.topics?.[0]].filter(Boolean) as string[];
  return (
    <li data-launch-impression={project.id} data-surface={surface} className="border-b border-border last:border-b-0">
      <div className="-mx-3 flex items-center gap-4 rounded-[8px] px-3 py-5 transition-colors hover:bg-foreground/[0.05]">
        <Rank n={rank} />
        <Link href={`/launches/${encodeURIComponent(project.id)}`} className="group flex min-w-0 flex-1 items-center gap-4">
          <LaunchLogo project={project} />
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-center gap-1.5">
              <h3 className="truncate font-sans text-[16px] font-medium leading-tight text-foreground group-hover:underline">{project.title}</h3>
              {project.badge_verified && <BadgeCheck className="h-4 w-4 shrink-0 fill-amber-400 text-background" aria-label="Badge verified" />}
              {project.promoted && (
                <span className="shrink-0 rounded-[4px] border border-primary/40 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-primary">Promoted</span>
              )}
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
                  <TodayDelta upvotes={upvotesToday} />
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

/**
 * One-line launch row (DevHunt-style), shared by the homepage MCP launches tab and Related launches:
 * rank, logo, "Name · pitch", today's activity, and an action on the right. The whole row links.
 */
export function LaunchLineRow({
  project,
  rank,
  surface,
  right,
  upvotesToday = 0,
}: {
  project: ShowcaseProject;
  rank: number;
  surface: string;
  right: ReactNode;
  upvotesToday?: number;
}) {
  return (
    <li data-launch-impression={project.id} data-surface={surface} className="group -mx-3 flex items-center gap-4 rounded-[8px] px-3 py-3.5 transition-colors hover:bg-foreground/[0.05]">
      <Link href={`/launches/${encodeURIComponent(project.id)}`} className="flex min-w-0 flex-1 items-center gap-4">
        <span className={`hidden w-6 shrink-0 font-mono text-[13px] tabular-nums sm:block ${rank <= 3 ? "text-primary" : "text-muted-foreground"}`}>{rank}</span>
        <LaunchLogo project={project} size="row" />
        <span className="flex min-w-0 flex-1 items-center gap-2">
          <span className="min-w-0 truncate text-[15px]">
            <span className="text-foreground transition-colors group-hover:text-primary">{project.title}</span>
            <span className="text-muted-foreground"> · {pitch(project)}</span>
          </span>
          {project.promoted && (
            <span className="shrink-0 rounded-[4px] border border-primary/40 px-1.5 py-px font-mono text-[10px] uppercase tracking-[0.1em] text-primary">Promoted</span>
          )}
        </span>
        <TodayDelta upvotes={upvotesToday} className="hidden shrink-0 sm:inline-flex" />
      </Link>
      {right}
    </li>
  );
}
