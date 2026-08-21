import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";
import type { ShowcaseProject } from "@/types";

interface ShowcaseParams {
  search?: string;
  tech_stack?: string;
  skip?: number;
  limit?: number;
}

export function useShowcaseProjects(params?: ShowcaseParams, options?: { initialData?: ShowcaseProject[] }) {
  return useQuery({
    queryKey: ["showcase", params],
    queryFn: () => api.get<ShowcaseProject[]>("/showcase", params as Record<string, string | number | boolean | undefined>),
    initialData: options?.initialData,
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

export function useMyShowcaseProjects(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["showcase", "me"],
    queryFn: () => api.get<ShowcaseProject[]>("/showcase/account/me"),
    enabled: options?.enabled ?? true,
  });
}

export function useSubmitShowcaseProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      title: string;
      tagline?: string;
      description: string;
      app_url: string;
      demo_url?: string;
      github_url?: string;
      category?: string;
      tech_stack: string[];
      skills_used: string[];
      use_cases: string[];
      feedback_prompt?: string;
      badge_page_url: string;
    }) => api.post<ShowcaseProject>("/showcase", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["showcase"] });
      queryClient.invalidateQueries({ queryKey: ["showcase", "me"] });
    },
  });
}

export function useVerifyShowcaseBadge() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ slug, badge_page_url }: { slug: string; badge_page_url?: string }) =>
      api.post<ShowcaseProject>(`/showcase/${slug}/verify-badge`, { badge_page_url }),
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: ["showcase"] });
      queryClient.invalidateQueries({ queryKey: ["showcase", "me"] });
      queryClient.invalidateQueries({ queryKey: ["showcase", project.id] });
    },
  });
}
