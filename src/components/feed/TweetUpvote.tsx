"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUp } from "lucide-react";
import { toast } from "sonner";

import { useMyTweetVotes, useUpvoteFeedItem } from "@/hooks/use-feed";
import { useAuth } from "@/lib/auth";

export function TweetUpvote({ id, initialCount }: { id: string; initialCount: number }) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const upvote = useUpvoteFeedItem();
  const { data: myVotes } = useMyTweetVotes(isAuthenticated);
  // Server-confirmed state after a click; until then, derive it from my-votes.
  const [confirmed, setConfirmed] = useState<{ voted: boolean; count: number } | null>(null);

  const voted = confirmed?.voted ?? Boolean(myVotes?.includes(id));
  const count = confirmed?.count ?? initialCount;

  const handleClick = () => {
    if (!isAuthenticated) {
      toast.error("Sign in to upvote", {
        action: { label: "Sign in", onClick: () => router.push("/login") },
      });
      return;
    }
    upvote.mutate(
      { type: "tweet", id },
      {
        onSuccess: (res) => {
          const nextVoted = res.voted ?? !voted;
          setConfirmed({ voted: nextVoted, count: res.upvotes ?? count + (nextVoted ? 1 : -1) });
        },
        onError: () => toast.error("Could not save your upvote"),
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
      className={`inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-colors disabled:opacity-70 ${
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
