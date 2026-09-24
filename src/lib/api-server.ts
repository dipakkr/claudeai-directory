// Server-side fetch utility for generateMetadata and server components
const API_BASE = process.env.API_INTERNAL_URL
  ? `${process.env.API_INTERNAL_URL.replace(/\/$/, "")}/api`
  : process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

function normalizeIds(data: unknown): unknown {
  if (Array.isArray(data)) return data.map(normalizeIds);
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (key === "_id") {
        result["id"] = value;
      } else {
        result[key] = normalizeIds(value);
      }
    }
    return result;
  }
  return data;
}

export async function fetchApi<T>(endpoint: string, options: { throwOnError?: boolean; timeoutMs?: number; revalidate?: number } = {}): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      next: { revalidate: options.revalidate ?? 300 },
      signal: AbortSignal.timeout(options.timeoutMs ?? 15000),
    });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Directory API returned ${res.status} for ${endpoint}`);
    const json = await res.json();
    return normalizeIds(json) as T;
  } catch (error) {
    // Detail routes must not turn an upstream outage into a cached missing page.
    if (options.throwOnError) throw error;
    return null;
  }
}
