"use client";

import { notFound } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { Thread, Reply } from "@/types";
import ThreadDetail from "./ThreadDetailClient";

/**
 * The server could not see this post. A signed-in member may still be allowed to
 * (their own post can be hidden from everyone else), so try once with their
 * token before giving up. Anyone else gets the normal 404.
 */
export default function OwnPostGate({ id }: { id: string }) {
  const { isAuthenticated, isLoading } = useAuth();
  const { data, isPending, isError } = useQuery({
    queryKey: ["community-thread-own", id],
    queryFn: async () => {
      const [thread, replies] = await Promise.all([
        api.get<Thread>(`/community/threads/${id}`),
        api.get<Reply[]>(`/community/threads/${id}/replies`).catch(() => [] as Reply[]),
      ]);
      return { thread, replies };
    },
    enabled: isAuthenticated,
    retry: false,
  });

  if (!isLoading && !isAuthenticated) notFound();
  if (isError) notFound();
  if (isLoading || isPending) {
    return (
      <div className="mx-auto max-w-[720px] px-4 py-16">
        <div className="h-6 w-2/3 animate-pulse rounded bg-muted" />
        <div className="mt-4 h-4 w-full animate-pulse rounded bg-muted" />
        <div className="mt-2 h-4 w-5/6 animate-pulse rounded bg-muted" />
      </div>
    );
  }
  return <ThreadDetail id={id} initialThread={data.thread} initialReplies={data.replies} authorProfile={null} related={[]} />;
}
