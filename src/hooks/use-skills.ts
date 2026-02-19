import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";
import type { Skill } from "@/types";

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

export function useSkills(params?: SkillsParams) {
  return useQuery({
    queryKey: ["skills", params],
    queryFn: () => api.get<SkillsListResponse>("/skills", params as Record<string, string | number | boolean | undefined>),
    select: (res) => res.data,
  });
}

export function useSkill(slug: string) {
  return useQuery({
    queryKey: ["skills", slug],
    queryFn: () => api.get<Skill>(`/skills/${slug}`),
    enabled: !!slug,
  });
}
