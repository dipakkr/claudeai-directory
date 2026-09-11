"use client";

// Recently viewed resources, stored per browser. Only a UI preference: it says
// nothing about what is installed locally.

export interface RecentItem {
  kind: "skill" | "mcp" | "agent";
  id: string;
  name: string;
  href: string;
}

const KEY = "cad_recently_viewed";
const MAX = 8;
const listeners = new Set<() => void>();
let cache: { raw: string | null; items: RecentItem[] } = { raw: null, items: [] };

export function subscribeRecent(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function readRecent(): RecentItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    // Return a stable reference while storage is unchanged (useSyncExternalStore).
    if (raw !== cache.raw) cache = { raw, items: raw ? (JSON.parse(raw) as RecentItem[]) : [] };
    return cache.items;
  } catch {
    return cache.items;
  }
}

export function recordRecent(item: RecentItem) {
  try {
    const next = [item, ...readRecent().filter((i) => i.href !== item.href)].slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(next));
    listeners.forEach((l) => l());
  } catch {
    /* storage unavailable */
  }
}
