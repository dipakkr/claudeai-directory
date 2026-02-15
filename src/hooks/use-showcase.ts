import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";
import type { ShowcaseProject } from "@/types";

interface ShowcaseParams {
  search?: string;
  tech_stack?: string;
  skip?: number;
  limit?: number;
}

export function useShowcaseProjects(params?: ShowcaseParams) {
  return useQuery({
    queryKey: ["showcase", params],
    queryFn: () => api.get<ShowcaseProject[]>("/showcase", params as Record<string, string | number | boolean | undefined>),
  });
}

export function useShowcaseProject(slug: string) {
  return useQuery({
    queryKey: ["showcase", slug],
    queryFn: () => api.get<ShowcaseProject>(`/showcase/${slug}`),
    enabled: !!slug,
  });
}

export function useUpvoteShowcase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (slug: string) => api.post<ShowcaseProject>(`/showcase/${slug}/upvote`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["showcase"] }),
  });
}
