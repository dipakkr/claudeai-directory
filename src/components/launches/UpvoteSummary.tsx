"use client";

import { useShowcaseProject } from "@/hooks/use-showcase";

/** Upvote count for the activity strip. Reads the same live data as UpvoteBox. */
export function UpvoteSummary({ slug, initialCount }: { slug: string; initialCount: number }) {
  const { data: live } = useShowcaseProject(slug);
  const count = live?.upvotes ?? initialCount;
  return (
    <>
      <span className="text-2xl font-semibold tabular-nums text-foreground">{count}</span>
      <span className="text-sm text-muted-foreground">
        {count === 0 ? "No upvotes yet. Be the first." : count === 1 ? "upvote" : "upvotes"}
      </span>
    </>
  );
}
