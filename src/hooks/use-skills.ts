import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";
import type { Skill, SkillReply } from "@/types";

interface SkillsParams {
  category?: string;
  search?: string;
  tag?: string;
  source?: string;
  featured?: boolean;
  skip?: number;
  limit?: number;
}

interface SkillsListResponse {
  data: Skill[];
  isCache: boolean;
}

export function useSkills(params?: SkillsParams, options?: { initialData?: Skill[] }) {
  return useQuery({
    queryKey: ["skills", params],
    queryFn: () => api.get<SkillsListResponse>("/skills", params as Record<string, string | number | boolean | undefined>),
    select: (res) => res.data,
    initialData: options?.initialData ? { data: options.initialData, isCache: false } : undefined,
    initialDataUpdatedAt: options?.initialData ? Date.now() : undefined,
  });
}

export function useSkill(slug: string) {
  return useQuery({
    queryKey: ["skills", slug],
    queryFn: () => api.get<Skill>(`/skills/${slug}`),
    enabled: !!slug,
  });
}

export function useSkillReplies(skillSlug: string) {
  return useQuery({
    queryKey: ["skill-replies", skillSlug],
    queryFn: () => api.get<SkillReply[]>(`/skills/${skillSlug}/replies`),
    enabled: !!skillSlug,
  });
}

export function useCreateSkillReply(skillSlug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { body: string; link?: string }) =>
      api.post<SkillReply>(`/skills/${skillSlug}/replies`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["skill-replies", skillSlug] });
    },
  });
}
