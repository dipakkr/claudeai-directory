import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";
import type { Thread, Reply } from "@/types";

interface ThreadsParams {
  search?: string;
  tag?: string;
  skip?: number;
  limit?: number;
}

export function useThreads(params?: ThreadsParams) {
  return useQuery({
    queryKey: ["community-threads", params],
    queryFn: () => api.get<Thread[]>("/community/threads", params as Record<string, string | number | boolean | undefined>),
  });
}

export function useThread(id: string) {
  return useQuery({
    queryKey: ["community-thread", id],
    queryFn: () => api.get<Thread>(`/community/threads/${id}`),
    enabled: !!id,
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

export function useReplies(threadId: string) {
  return useQuery({
    queryKey: ["community-replies", threadId],
    queryFn: () => api.get<Reply[]>(`/community/threads/${threadId}/replies`),
    enabled: !!threadId,
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
