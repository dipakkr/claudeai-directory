"use client";

import type { ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Discussion from "@/components/discussion/Discussion";
import { api } from "@/lib/api";

const SITE_URL = "https://www.claudeai.directory";

interface LaunchComment {
  _id: string;
  parent_id?: string | null;
  body: string;
  author: string;
  author_username?: string | null;
  author_avatar?: string | null;
  is_maker?: boolean;
  created_at: string;
}

// Comments on a launch are stored with the launch, not posted to Community.
export default function LaunchDiscussion({ slug, title, intro }: { slug: string; title: string; intro?: ReactNode }) {
  const queryClient = useQueryClient();
  const queryKey = ["launch-comments", slug];
  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () => api.get<LaunchComment[]>(`/showcase/${slug}/comments`),
  });
  const create = useMutation({
    mutationFn: (input: { body: string; parent_id?: string }) =>
      api.post<LaunchComment>(`/showcase/${slug}/comments`, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  return (
    <Discussion
      comments={(data ?? []).map(c => ({
        id: c._id,
        parentId: c.parent_id,
        author: c.author,
        authorUsername: c.author_username ?? undefined,
        authorAvatar: c.author_avatar,
        headline: c.is_maker ? "Maker" : null,
        body: c.body,
        createdAt: c.created_at,
      }))}
      isLoading={isLoading}
      onPost={({ body, parentId }) => create.mutateAsync({ body, parent_id: parentId })}
      permalink={id => `${SITE_URL}/launches/${slug}#${id}`}
      allowReplies
      minLength={2}
      intro={intro}
      placeholder={`What do you think of ${title}? Ask the maker a question or share feedback...`}
      emptyText={`No comments yet. Be the first to share feedback on ${title}.`}
    />
  );
}
