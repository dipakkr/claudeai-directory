import Link from "next/link";
import { ArrowRight, ChevronUp, Rocket } from "lucide-react";

import { DiscussionAvatar } from "@/components/discussion/Discussion";
import { faviconFor } from "@/lib/directory";
import type { PublicProfile, ShowcaseProject } from "@/types";

function Card({ title, href, linkLabel, children }: { title: string; href: string; linkLabel: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[6px] border border-border bg-card">
      <div className="flex items-center justify-between px-4 pt-4">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        <Link href={href} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
          {linkLabel}
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      <div className="px-2 pb-2 pt-2">{children}</div>
    </section>
  );
}

function LaunchLogo({ project }: { project: ShowcaseProject }) {
  const src = project.logo_url || faviconFor(project.app_url || project.demo_url);
  return src ? (
    // eslint-disable-next-line @next/next/no-img-element -- remote maker logo
    <img src={src} alt="" loading="lazy" className="h-9 w-9 shrink-0 rounded-[4px] border border-border bg-background object-contain p-1" />
  ) : (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[4px] border border-border bg-background text-sm font-medium text-muted-foreground">
      {project.title[0]?.toUpperCase()}
    </span>
  );
}

/** Right column of /feed: live launches and members, so the page always has something to explore. */
export function FeedSidebar({ launches, members, memberTotal }: { launches: ShowcaseProject[]; members: PublicProfile[]; memberTotal: number }) {
  const named = members.filter((m) => m.name || m.username).slice(0, 2);
  const others = Math.max(0, memberTotal - named.length);

  return (
    <aside className="hidden space-y-3 xl:sticky xl:top-24 xl:block">
      {launches.length > 0 && (
        <Card title="Trending launches" href="/launches" linkLabel="All launches">
          <ul>
            {launches.map((project) => (
              <li key={project.id}>
                <Link href={`/launches/${project.id}`} data-launch-impression={project.id} data-surface="feed_sidebar" className="group flex items-center gap-3 rounded-[4px] px-2 py-2 transition-colors hover:bg-background">
                  <LaunchLogo project={project} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-foreground group-hover:text-primary">{project.title}</span>
                    <span className="block truncate text-xs text-muted-foreground">{project.tagline || project.category}</span>
                  </span>
                  <span className="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-[4px] border border-border text-[11px] font-medium tabular-nums text-foreground">
                    <ChevronUp className="h-3 w-3" strokeWidth={2.5} />
                    {project.upvotes}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {members.length > 0 && (
        <Card title="New members" href="/members" linkLabel="Meet them">
          <div className="px-2 pb-2">
            <div className="flex -space-x-2">
              {members.slice(0, 8).map((m) => (
                <Link key={m.username} href={`/u/${m.username}`} title={m.name || m.username} className="rounded-full ring-2 ring-card transition-transform hover:z-10 hover:-translate-y-0.5">
                  <DiscussionAvatar src={m.avatar} name={m.name || m.username} />
                </Link>
              ))}
            </div>
            <p className="mt-3 text-xs leading-5 text-muted-foreground">
              {named.map((m, i) => (
                <span key={m.username}>
                  {i > 0 && (others > 0 ? ", " : " and ")}
                  <Link href={`/u/${m.username}`} className="font-medium text-foreground hover:underline">
                    {(m.name || m.username).split(" ")[0]}
                  </Link>
                </span>
              ))}
              {others > 0 && ` and ${others.toLocaleString()} other builders are here.`}
            </p>
          </div>
        </Card>
      )}

      <section className="rounded-[6px] border border-border bg-card p-4">
        <h2 className="text-sm font-semibold text-foreground">Built something with Claude?</h2>
        <p className="mt-1 text-[13px] leading-5 text-muted-foreground">Launch it for upvotes, feedback and a backlink.</p>
        <Link
          href="/launches/submit"
          className="mt-3 inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-full bg-primary text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Rocket className="h-3.5 w-3.5" />
          Launch your app
        </Link>
      </section>

      <p className="px-1 text-[12px] leading-5 text-muted-foreground/70">
        Be specific, show your work rather than just a link, and skip repeated self-promotion.
      </p>
    </aside>
  );
}
