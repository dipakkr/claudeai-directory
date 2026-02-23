import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api";
import type { BlogPost } from "@/types";

interface BlogParams {
  category?: string;
  difficulty?: string;
  tag?: string;
  search?: string;
  featured?: boolean;
  skip?: number;
  limit?: number;
}

export function useBlogPosts(params?: BlogParams, options?: { initialData?: BlogPost[] }) {
  return useQuery({
    queryKey: ["blog", params],
    queryFn: () => api.get<BlogPost[]>("/blog", params as Record<string, string | number | boolean | undefined>),
    initialData: options?.initialData,
    initialDataUpdatedAt: options?.initialData ? Date.now() : undefined,
  });
}

export function useBlogPost(slug: string) {
  return useQuery({
    queryKey: ["blog", slug],
    queryFn: () => api.get<BlogPost>(`/blog/${slug}`),
    enabled: !!slug,
  });
}
