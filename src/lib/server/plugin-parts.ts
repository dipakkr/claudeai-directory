import { cache } from "react";
import { fetchApi } from "@/lib/api-server";
import type { Plugin, PluginPartDoc, PluginPartKind } from "@/types";

// Pages small enough for the fetch data cache (2 MB per response).
const PAGE = 800;
const MAX_PAGES = 6;

/** Every skill or agent shipped inside a listed plugin (no bodies). Empty when unavailable. */
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

/** A plugin's skill or agent with the plugin it ships in, for /skills/{slug} and /agents/{slug}. */
export const loadPluginPart = cache(async (kind: PluginPartKind, slug: string) => {
  const part = await fetchApi<PluginPartDoc>(`/plugins/parts/${kind}/${encodeURIComponent(slug)}`);
  if (!part) return null;
  const plugin = await fetchApi<Plugin>(`/plugins/${encodeURIComponent(part.plugin_id)}`);
  return plugin ? { part, plugin } : null;
});
