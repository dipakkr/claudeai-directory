"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function LinkUpgradeResult() {
  const params = useSearchParams();
  const queryClient = useQueryClient();
  const outcome = params.get("upgrade");
  const slug = params.get("launch");
  const status = useQuery({
    queryKey: ["launch-upgrade", slug],
    queryFn: () => api.get<{ status: string; upgraded: boolean }>(`/sponsors/launch-upgrade/${encodeURIComponent(slug!)}/status`),
    enabled: outcome === "success" && !!slug,
    refetchInterval: (query) => query.state.data?.upgraded || query.state.dataUpdateCount >= 15 ? false : 2000,
    retry: 1,
  });
  useEffect(() => {
    if (status.data?.upgraded) {
      void queryClient.invalidateQueries({ queryKey: ["showcase"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    }
  }, [status.data?.upgraded, queryClient]);
  if (!outcome || !slug) return null;
  const message = outcome === "cancelled"
    ? "Checkout cancelled. Your listing has not changed."
    : status.data?.upgraded
      ? "Your dofollow link is now active."
      : status.isError
        ? "We couldn’t check your upgrade yet. Refresh this page, or contact hello@claudeai.directory."
        : "Waiting for payment confirmation. Your link will upgrade once Stripe confirms payment. You can refresh this page to check again.";
  return <p role="status" className="mb-6 rounded-[6px] border border-primary/25 bg-primary/5 p-4 text-sm">{message}</p>;
}
