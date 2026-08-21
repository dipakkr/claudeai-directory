import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";
import type { Resource } from "@/types";

interface ResourceParams {
  search?: string;
  category?: string;
  tag?: string;
  skip?: number;
  limit?: number;
}

export function useResources(params?: ResourceParams) {
  return useQuery({
    queryKey: ["resources", params],
    queryFn: () =>
      api.get<Resource[]>(
        "/resources",
        params as Record<string, string | number | boolean | undefined>
      ),
  });
}

export function useSubmitResource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      title: string;
      url: string;
      description: string;
      category: string;
      tags?: string[];
    }) => api.post<Resource>("/resources", data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["resources"] }),
  });
}

export function useUpvoteResource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (slug: string) =>
      api.post<{ ok: boolean }>(`/resources/${slug}/upvote`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resources"] });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
  });
}
