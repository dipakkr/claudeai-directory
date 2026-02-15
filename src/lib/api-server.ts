// Server-side fetch utility for generateMetadata and server components
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

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

export async function fetchApi<T>(endpoint: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return normalizeIds(json) as T;
  } catch {
    return null;
  }
}
