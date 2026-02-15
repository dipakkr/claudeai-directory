import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";
import type { Guide, GuideDetail, GuideLesson, GuideProgress } from "@/types";

interface GuideParams {
  category?: string;
  difficulty?: string;
  featured?: boolean;
  skip?: number;
  limit?: number;
}

export function useGuides(params?: GuideParams) {
  return useQuery({
    queryKey: ["guides", params],
    queryFn: () =>
      api.get<Guide[]>(
        "/guides",
        params as Record<string, string | number | boolean | undefined>
      ),
  });
}

export function useGuide(slug: string) {
  return useQuery({
    queryKey: ["guides", slug],
    queryFn: () => api.get<GuideDetail>(`/guides/${slug}`),
    enabled: !!slug,
  });
}

export function useGuideLesson(guideSlug: string, lessonId: string) {
  return useQuery({
    queryKey: ["guides", guideSlug, "lessons", lessonId],
    queryFn: () =>
      api.get<GuideLesson>(`/guides/${guideSlug}/lessons/${lessonId}`),
    enabled: !!guideSlug && !!lessonId,
    retry: false,
  });
}

export function useGuideProgress(guideSlug: string) {
  return useQuery({
    queryKey: ["guide-progress", guideSlug],
    queryFn: () => api.get<GuideProgress>(`/guides/${guideSlug}/progress`),
    enabled: !!guideSlug,
    retry: false,
  });
}

export function useCompleteLesson() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      guideSlug,
      lessonId,
    }: {
      guideSlug: string;
      lessonId: string;
    }) =>
      api.post<GuideProgress>(`/guides/${guideSlug}/progress/complete`, {
        lesson_id: lessonId,
      }),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({
        queryKey: ["guide-progress", vars.guideSlug],
      });
    },
  });
}
