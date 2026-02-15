import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api";
import type { Stat } from "@/types";

export function useStats() {
  return useQuery({
    queryKey: ["stats"],
    queryFn: () => api.get<Stat[]>("/stats"),
  });
}
