import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";
import type { Prompt } from "@/types";

interface PromptsParams {
  category?: string;
  complexity?: string;
  search?: string;
  use_case?: string;
  skip?: number;
  limit?: number;
}

export function usePrompts(params?: PromptsParams) {
  return useQuery({
    queryKey: ["prompts", params],
    queryFn: () => api.get<Prompt[]>("/prompts", params as Record<string, string | number | boolean | undefined>),
  });
}

export function usePrompt(slug: string) {
  return useQuery({
    queryKey: ["prompts", slug],
    queryFn: () => api.get<Prompt>(`/prompts/${slug}`),
    enabled: !!slug,
  });
}

export function useUpvotePrompt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (slug: string) => api.post<Prompt>(`/prompts/${slug}/upvote`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["prompts"] }),
  });
}
