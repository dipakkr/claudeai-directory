import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";
import type { Review } from "@/types";

export function useReviews(targetType: string, targetId: string) {
  return useQuery({
    queryKey: ["reviews", targetType, targetId],
    queryFn: () =>
      api.get<Review[]>("/reviews", {
        target_type: targetType,
        target_id: targetId,
      }),
    enabled: !!targetType && !!targetId,
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      rating: number;
      comment?: string;
      target_type: string;
      target_id: string;
    }) => api.post<Review>("/reviews", data),
    onSuccess: (_, variables) =>
      queryClient.invalidateQueries({
        queryKey: ["reviews", variables.target_type, variables.target_id],
      }),
  });
}
