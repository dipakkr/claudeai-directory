"use client";

import Discussion from "@/components/discussion/Discussion";
import { useResourceReplies, useCreateResourceReply } from "@/hooks/use-replies";
import type { ResourceType } from "@/types";

const SITE_URL = "https://www.claudeai.directory";

const COPY: Record<ResourceType, { path: string; placeholder: string; empty: string }> = {
  skill: {
    path: "skills",
    placeholder: "What are you building with this skill? Share tweaks or results...",
    empty: "No comments yet. Share how you use this skill.",
  },
  prompt: {
    path: "prompts",
    placeholder: "How are you using this prompt? Share tweaks or results...",
    empty: "No comments yet. Share how you use this prompt.",
  },
  mcp: {
    path: "mcp",
    placeholder: "How are you using this MCP server? Share use cases or tips...",
    empty: "No comments yet. Share how you use this MCP server.",
  },
};

export default function ResourceReplies({
  resourceType,
  resourceId,
}: {
  resourceType: ResourceType;
  resourceId: string;
}) {
  const copy = COPY[resourceType];
  const { data: replies, isLoading } = useResourceReplies(resourceType, resourceId);
  const createReply = useCreateResourceReply(resourceType, resourceId);

  return (
    <Discussion
      comments={(replies ?? []).map(r => ({
        id: r.id,
        author: r.author,
        authorAvatar: r.author_avatar,
        body: r.body,
        link: r.link,
        createdAt: r.created_at,
      }))}
      isLoading={isLoading}
      // Resource replies are flat on the API (no parent id), so no Reply action.
      onPost={({ body, link }) => createReply.mutateAsync({ body, link })}
      permalink={commentId => `${SITE_URL}/${copy.path}/${resourceId}#${commentId}`}
      withLinkField
      minLength={10}
      placeholder={copy.placeholder}
      emptyText={copy.empty}
    />
  );
}
