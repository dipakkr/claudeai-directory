import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";
import type { FeedItem } from "@/types";

interface FeedParams {
  type?: string;
  skip?: number;
  limit?: number;
}

export function useFeed(params?: FeedParams) {
  return useQuery({
    queryKey: ["feed", params],
    queryFn: () =>
      api.get<FeedItem[]>(
        "/feed",
        params as Record<string, string | number | boolean | undefined>
      ),
  });
}

export function useCreateFeedPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { title: string; url: string; description: string }) =>
      api.post("/feed", data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["feed"] }),
  });
}

export function useUpvoteFeedItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { type: string; id: string }) =>
      api.post<{ ok: boolean }>("/feed/upvote", data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["feed"] }),
  });
}
