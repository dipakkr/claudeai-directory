"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUp } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/lib/auth";
import { useUpvoteShowcase } from "@/hooks/use-showcase";

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
  const [count, setCount] = useState(initialCount);
  const [voted, setVoted] = useState(false);

  const handleClick = () => {
    if (!isAuthenticated) {
      toast.error("Sign in to upvote launches", {
        action: { label: "Sign in", onClick: () => router.push("/login") },
      });
      return;
    }
    upvote.mutate(slug, {
      onSuccess: (project) => {
        setCount(project?.upvotes ?? count + 1);
        setVoted(true);
        toast.success("Upvoted");
      },
      onError: () => toast.error("Could not upvote this launch"),
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={upvote.isPending}
      aria-label={`Upvote ${title}`}
      title={isAuthenticated ? "Upvote this launch" : "Sign in to upvote"}
      className={`flex shrink-0 items-center justify-center border bg-card shadow-sm transition hover:border-primary/50 hover:shadow-md disabled:opacity-70 ${
        compact ? "h-10 gap-1.5 rounded-full px-4" : "h-24 w-24 flex-col gap-2 rounded-2xl hover:-translate-y-0.5"
      } ${
        voted ? "border-primary text-primary" : "border-border text-foreground"
      }`}
    >
      <ArrowUp className={compact ? "h-4 w-4" : "h-6 w-6"} strokeWidth={2.25} aria-hidden="true" />
      <span className={`${compact ? "text-sm" : "text-xl"} font-semibold leading-none tabular-nums`}>{count}</span>
    </button>
  );
}
