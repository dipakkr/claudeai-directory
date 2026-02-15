import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api";
import type { APIPricing, CostComparison } from "@/types";

export function useAPIPricing(provider?: string) {
  return useQuery({
    queryKey: ["api-pricing", provider],
    queryFn: () => api.get<APIPricing[]>("/api-pricing", { provider }),
  });
}

export function useComparePricing(inputTokens: number, outputTokens: number) {
  return useQuery({
    queryKey: ["api-pricing", "compare", inputTokens, outputTokens],
    queryFn: () =>
      api.get<CostComparison[]>("/api-pricing/compare", {
        input_tokens: inputTokens,
        output_tokens: outputTokens,
      }),
  });
}
