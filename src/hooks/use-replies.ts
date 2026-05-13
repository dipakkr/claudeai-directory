import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api, ApiError } from "@/lib/api";
import type { ResourceReply, ResourceType } from "@/types";

const BASE_PATH: Record<ResourceType, string> = {
  skill: "skills",
  prompt: "prompts",
  mcp: "mcp-servers",
};

function repliesPath(resourceType: ResourceType, resourceId: string) {
  return `/${BASE_PATH[resourceType]}/${resourceId}/replies`;
}

export function useResourceReplies(resourceType: ResourceType, resourceId: string) {
  return useQuery({
    queryKey: ["replies", resourceType, resourceId],
    queryFn: async () => {
      try {
        return await api.get<ResourceReply[]>(repliesPath(resourceType, resourceId));
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) return [];
        throw err;
      }
    },
    enabled: !!(resourceType && resourceId),
  });
}

export function useCreateResourceReply(resourceType: ResourceType, resourceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { body: string; link?: string }) =>
      api.post<ResourceReply>(repliesPath(resourceType, resourceId), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["replies", resourceType, resourceId] });
    },
  });
}
