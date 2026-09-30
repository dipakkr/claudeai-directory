"use client";

import { useState } from "react";

import { PostCard } from "@/components/feed/PostCard";
import { useMyPostVotes, useThreads } from "@/hooks/use-community";
import { useAuth } from "@/lib/auth";

/** A member's feed posts, shown on their profile. Renders nothing when they have none. */
export function MemberPosts({ username }: { username: string }) {
  const { isAuthenticated } = useAuth();
  const { data } = useThreads({ author: username, limit: 20 });
  const [removed, setRemoved] = useState<string[]>([]);
  const posts = (data ?? []).filter((p) => !removed.includes(p.id));
  const { data: myVotes } = useMyPostVotes(
    posts.map((p) => p.id),
    isAuthenticated,
  );
  const voted = new Set(myVotes ?? []);

  if (!posts.length) return null;
  return (
    <section className="mb-10">
      <h2 className="text-xl font-semibold text-foreground">Posts</h2>
      <p className="mt-1 text-sm text-muted-foreground">What this member shared on the community feed.</p>
      <div className="mt-4 space-y-4">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} voted={voted.has(post.id)} onDeleted={(id) => setRemoved((r) => [...r, id])} />
        ))}
      </div>
    </section>
  );
}
