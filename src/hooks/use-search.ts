import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api";
import type { SearchResult } from "@/types";

export function useSearch(q: string, type?: string) {
  return useQuery({
    queryKey: ["search", q, type],
    queryFn: () => api.get<SearchResult[]>("/search", { q, type }),
    enabled: q.length >= 2,
  });
}
