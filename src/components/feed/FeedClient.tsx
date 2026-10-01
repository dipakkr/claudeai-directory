"use client";

import { useState } from "react";
import { MessageSquare } from "lucide-react";

import { Composer } from "@/components/feed/Composer";
import { PostCard } from "@/components/feed/PostCard";
import { useMyPostVotes } from "@/hooks/use-community";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { FEED_PAGE_SIZE } from "@/lib/feed";
import type { Thread } from "@/types";

/** Community posts: composer on top, cards below, "Load more" at the end. */
export function FeedClient({ initialPosts, sort }: { initialPosts: Thread[]; sort: "latest" | "popular" }) {
  const { isAuthenticated } = useAuth();
  const [posts, setPosts] = useState(initialPosts);
  const [hasMore, setHasMore] = useState(initialPosts.length >= FEED_PAGE_SIZE);
  const [loading, setLoading] = useState(false);
  const { data: myVotes } = useMyPostVotes(
    posts.map((p) => p.id),
    isAuthenticated,
  );
  const voted = new Set(myVotes ?? []);

  const loadMore = async () => {
    setLoading(true);
    try {
      const next = await api.get<Thread[]>("/community/threads", { sort, skip: posts.length, limit: FEED_PAGE_SIZE });
      const seen = new Set(posts.map((p) => p.id));
      setPosts([...posts, ...next.filter((p) => !seen.has(p.id))]);
      setHasMore(next.length >= FEED_PAGE_SIZE);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Composer onPosted={(post) => setPosts((current) => [post, ...current.filter((p) => p.id !== post.id)])} />

      {posts.length > 0 ? (
        posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            voted={voted.has(post.id)}
            onDeleted={(id) => setPosts((current) => current.filter((p) => p.id !== id))}
          />
        ))
      ) : (
        <div className="rounded-[6px] border border-dashed border-border px-6 py-16 text-center">
          <MessageSquare className="mx-auto h-8 w-8 text-muted-foreground/40" />
          <p className="mt-3 text-sm font-medium text-foreground">
            {sort === "popular" ? "Nothing popular this week yet." : "No posts yet."}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">Share what you are building with Claude and start the conversation.</p>
        </div>
      )}

      {hasMore && (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={() => void loadMore()}
            disabled={loading}
            className="h-9 rounded-full border border-border bg-card px-5 text-sm font-medium text-foreground hover:border-[var(--cad-line-hover)] disabled:opacity-60"
          >
            {loading ? "Loading..." : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}
