"use client";

import { useRouter } from "next/navigation";
import { ArrowUp } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/lib/auth";
import { useMyLaunchUpvotes, useShowcaseProject, useUpvoteShowcase } from "@/hooks/use-showcase";

interface UpvoteBoxProps {
  slug: string;
  title: string;
  initialCount: number;
  /** Inline pill for narrow screens instead of the tall hero box. */
  compact?: boolean;
}

export function UpvoteBox({ slug, title, initialCount, compact = false }: UpvoteBoxProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const upvote = useUpvoteShowcase();
  // Live count and the user's own vote, so the box is right after a reload
  // even when the server-rendered page is a few minutes old.
  const { data: live } = useShowcaseProject(slug);
  const { data: myUpvotes } = useMyLaunchUpvotes(isAuthenticated);

  const count = live?.upvotes ?? initialCount;
  const voted = (myUpvotes ?? []).includes(slug);

  const handleClick = () => {
    if (!isAuthenticated) {
      toast.error("Sign in to upvote launches", {
        action: { label: "Sign in", onClick: () => router.push("/login") },
      });
      return;
    }
    upvote.mutate(slug, {
      onSuccess: (project) => toast.success(project.voted === false ? "Upvote removed" : `Upvoted ${title}`),
      onError: () => toast.error("Could not save your upvote"),
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={upvote.isPending}
      aria-pressed={voted}
      aria-label={voted ? `Remove upvote from ${title}` : `Upvote ${title}`}
      title={!isAuthenticated ? "Sign in to upvote" : voted ? "You upvoted this. Click to undo." : "Upvote this launch"}
      className={`flex shrink-0 items-center justify-center border shadow-sm transition hover:shadow-md disabled:opacity-70 ${
        compact ? "h-10 gap-1.5 rounded-full px-4" : "h-24 w-24 flex-col gap-1.5 rounded-2xl hover:-translate-y-0.5"
      } ${voted ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground hover:border-primary/50"}`}
    >
      <ArrowUp className={compact ? "h-4 w-4" : "h-6 w-6"} strokeWidth={2.25} aria-hidden="true" />
      <span className={`${compact ? "text-sm" : "text-xl"} font-semibold leading-none tabular-nums`}>{count}</span>
      {!compact && <span className="text-[10px] font-medium uppercase tracking-wide opacity-80">{voted ? "Upvoted" : "Upvote"}</span>}
    </button>
  );
}
