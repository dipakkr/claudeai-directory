import { useMutation, useQuery, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";
import type { Prompt } from "@/types";

const PAGE_SIZE = 20;

interface PromptsParams {
  category?: string;
  complexity?: string;
  search?: string;
  use_case?: string;
  skip?: number;
  limit?: number;
}

export function usePrompts(params?: PromptsParams, options?: { initialData?: Prompt[] }) {
  return useQuery({
    queryKey: ["prompts", params],
    queryFn: () => api.get<Prompt[]>("/prompts", params as Record<string, string | number | boolean | undefined>),
    initialData: options?.initialData,
    initialDataUpdatedAt: options?.initialData ? Date.now() : undefined,
  });
}

export function useInfinitePrompts(
  params?: Omit<PromptsParams, "skip" | "limit">,
  options?: { initialData?: Prompt[] }
) {
  return useInfiniteQuery({
    queryKey: ["prompts-infinite", params],
    queryFn: ({ pageParam }) =>
      api.get<Prompt[]>("/prompts", {
        ...params,
        skip: pageParam,
        limit: PAGE_SIZE,
      } as Record<string, string | number | boolean | undefined>),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < PAGE_SIZE) return undefined;
      return allPages.flat().length;
    },
    initialData: options?.initialData
      ? { pages: [options.initialData], pageParams: [0] }
      : undefined,
    initialDataUpdatedAt: options?.initialData ? Date.now() : undefined,
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
