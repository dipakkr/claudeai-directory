import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";
import type { Bookmark } from "@/types";

export function useBookmarks() {
  return useQuery({
    queryKey: ["bookmarks"],
    queryFn: () => api.get<Bookmark[]>("/bookmarks"),
  });
}

export function useAddBookmark() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { target_type: string; target_id: string }) =>
      api.post<Bookmark>("/bookmarks", data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] }),
  });
}

export function useRemoveBookmark() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.del(`/bookmarks/${id}`),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] }),
  });
}
