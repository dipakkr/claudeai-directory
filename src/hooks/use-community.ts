import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";
import type { Thread, Reply } from "@/types";

interface ThreadsParams {
  search?: string;
  tag?: string;
  skip?: number;
  limit?: number;
}

export function useThreads(params?: ThreadsParams, initialData?: Thread[]) {
  return useQuery({
    queryKey: ["community-threads", params],
    queryFn: () => api.get<Thread[]>("/community/threads", params as Record<string, string | number | boolean | undefined>),
    initialData,
  });
}

export function useThread(id: string, initialData?: Thread) {
  return useQuery({
    queryKey: ["community-thread", id],
    queryFn: () => api.get<Thread>(`/community/threads/${id}`),
    enabled: !!id,
    initialData,
  });
}

export function useCreateThread() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { title: string; body: string; tags: string[] }) =>
      api.post<Thread>("/community/threads", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-threads"] });
    },
  });
}

export function useReplies(threadId: string, initialData?: Reply[]) {
  return useQuery({
    queryKey: ["community-replies", threadId],
    queryFn: () => api.get<Reply[]>(`/community/threads/${threadId}/replies`),
    enabled: !!threadId,
    initialData,
  });
}

export function useCreateReply(threadId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { body: string; parent_id?: string }) =>
      api.post<Reply>(`/community/threads/${threadId}/replies`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-replies", threadId] });
      queryClient.invalidateQueries({ queryKey: ["community-thread", threadId] });
      queryClient.invalidateQueries({ queryKey: ["community-threads"] });
    },
  });
}

/** Thread and reply ids the signed-in user has upvoted in this thread. */
export const communityVotesQuery = (threadId: string) => ({
  queryKey: ["community", "votes", threadId],
  queryFn: () => api.get<string[]>(`/community/threads/${threadId}/my-votes`),
});

export function useCommunityVotes(threadId: string, enabled: boolean) {
  return useQuery({ ...communityVotesQuery(threadId), enabled });
}

export function useCommunityUpvote(threadId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ type, id }: { type: "thread" | "reply"; id: string }) =>
      api.post<{ voted: boolean; upvotes: number }>(
        type === "thread" ? `/community/threads/${id}/upvote` : `/community/replies/${id}/upvote`,
      ),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["community", "votes", threadId] }),
  });
}
