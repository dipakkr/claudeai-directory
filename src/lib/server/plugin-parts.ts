import { cache } from "react";
import { fetchApi } from "@/lib/api-server";
import type { PluginPartDoc, PluginPartKind } from "@/types";

// Pages small enough for the fetch data cache (2 MB per response).
const PAGE = 800;
const MAX_PAGES = 6;

/** Every skill, agent or command shipped inside a listed plugin (no bodies). Empty when unavailable. */
export const loadPluginParts = cache(async (kind: PluginPartKind) => {
  const all: PluginPartDoc[] = [];
  for (let page = 0; page < MAX_PAGES; page++) {
    const result = await fetchApi<{ data: PluginPartDoc[] }>(`/plugins/parts?kind=${kind}&skip=${page * PAGE}&limit=${PAGE}`, { timeoutMs: 5000 });
    const rows = result?.data ?? [];
    all.push(...rows);
    if (rows.length < PAGE) break;
  }
  return all;
});
