"use client";

import Link from "next/link";

import { useLaunchVoters, useShowcaseProject } from "@/hooks/use-showcase";

/**
 * Who upvoted, as overlapping avatars ("Bilgin and 4 others upvoted").
 * Only real, tracked voters get a face; older anonymous votes are counted in
 * "others" but never drawn as people.
 */
export function UpvoteSummary({ slug, initialCount }: { slug: string; initialCount: number }) {
  const { data: live } = useShowcaseProject(slug);
  const { data } = useLaunchVoters(slug);
  const total = Math.max(data?.total ?? 0, live?.upvotes ?? initialCount);
  const faces = (data?.voters ?? []).slice(0, 6);

  if (total === 0) {
    return <span className="text-sm text-muted-foreground">No upvotes yet. Be the first.</span>;
  }

  if (faces.length === 0) {
    return (
      <span className="text-sm text-muted-foreground">
        Upvoted by <span className="font-medium text-foreground">{total}</span> {total === 1 ? "builder" : "builders"}
      </span>
    );
  }

  const first = faces[0];
  const firstName = (first.name || first.username || "Someone").split(" ")[0];
  const others = total - 1;

  return (
    <span className="flex min-w-0 items-center gap-3">
      <span className="flex shrink-0 -space-x-2">
        {faces.map((voter, index) => {
          const label = voter.name || voter.username || "?";
          const avatar = voter.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={voter.avatar} alt="" referrerPolicy="no-referrer" className="h-8 w-8 rounded-full border-2 border-background object-cover" />
          ) : (
            <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-card text-xs font-semibold text-muted-foreground">
              {label[0]?.toUpperCase()}
            </span>
          );
          return voter.username ? (
            <Link key={`${voter.username}-${index}`} href={`/u/${voter.username}`} title={label} className="relative hover:z-10">
              {avatar}
            </Link>
          ) : (
            <span key={index} title={label}>
              {avatar}
            </span>
          );
        })}
      </span>
      <span className="min-w-0 truncate text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{firstName}</span>
        {others > 0 ? ` and ${others} ${others === 1 ? "other" : "others"} upvoted` : " upvoted"}
      </span>
    </span>
  );
}
