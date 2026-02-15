import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api";
import type { Job } from "@/types";

interface JobsParams {
  type?: string;
  location?: string;
  search?: string;
  featured?: boolean;
  skip?: number;
  limit?: number;
}

export function useJobs(params?: JobsParams) {
  return useQuery({
    queryKey: ["jobs", params],
    queryFn: () => api.get<Job[]>("/jobs", params as Record<string, string | number | boolean | undefined>),
  });
}

export function useJob(slug: string) {
  return useQuery({
    queryKey: ["jobs", slug],
    queryFn: () => api.get<Job>(`/jobs/${slug}`),
    enabled: !!slug,
  });
}
