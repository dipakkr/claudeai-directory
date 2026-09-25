import { fetchApi } from "@/lib/api-server";
import { itemKey, type DirectoryType, type Orders, type SortKey } from "@/lib/directory";

interface RankingsResponse {
  data: { resource_type: DirectoryType; resource_id: string }[];
}

const SORTS: SortKey[] = ["trending", "top", "new"];

/**
 * Orders from GET /rankings (install intent drives Trending). Returns {} when the
 * endpoint is not deployed yet, so callers fall back to per-type ordering.
 */
export async function loadOrders(type?: "skill" | "mcp" | "agent" | "plugin", timeoutMs = 15000): Promise<Orders> {
  const results = await Promise.all(
    SORTS.map((sort) =>
      fetchApi<RankingsResponse>(`/rankings?sort=${sort}&limit=500${type ? `&type=${type}` : ""}`, { timeoutMs }),
    ),
  );
  const orders: Orders = {};
  results.forEach((res, i) => {
    if (res?.data?.length) orders[SORTS[i]] = res.data.map((r) => itemKey(r.resource_type, r.resource_id));
  });
  return orders;
}
