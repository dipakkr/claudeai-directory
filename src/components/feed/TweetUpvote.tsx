"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUp } from "lucide-react";
import { toast } from "sonner";

import { useUpvoteFeedItem } from "@/hooks/use-feed";
import { useAuth } from "@/lib/auth";

export function TweetUpvote({ id, initialCount }: { id: string; initialCount: number }) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const upvote = useUpvoteFeedItem();
  const [count, setCount] = useState(initialCount);
  const [voted, setVoted] = useState(false);

  const handleClick = () => {
    if (!isAuthenticated) {
      toast.error("Sign in to upvote", {
        action: { label: "Sign in", onClick: () => router.push("/login") },
      });
      return;
    }
    // The endpoint toggles, so flip locally and roll back on failure.
    const next = !voted;
    setVoted(next);
    setCount((value) => value + (next ? 1 : -1));
    upvote.mutate(
      { type: "tweet", id },
      {
        onError: () => {
          setVoted(!next);
          setCount((value) => value + (next ? -1 : 1));
          toast.error("Could not save your upvote");
        },
      },
    );
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={upvote.isPending}
      aria-pressed={voted}
      aria-label="Upvote this tweet"
      className={`inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-colors ${
        voted
          ? "border-primary bg-primary/10 text-primary"
          : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground"
      }`}
    >
      <ArrowUp className="h-3.5 w-3.5" />
      <span className="tabular-nums">{count}</span>
    </button>
  );
}
