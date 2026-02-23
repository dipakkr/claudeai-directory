function normalizeIds(obj: unknown): unknown {
  if (Array.isArray(obj)) return obj.map(normalizeIds);
  if (obj && typeof obj === 'object') {
    const o = obj as Record<string, unknown>;
    if (o._id && !o.id) o.id = o._id;
    delete o._id;
    for (const key of Object.keys(o)) o[key] = normalizeIds(o[key]);
  }
  return obj;
}

export async function serverFetch(endpoint: string, options?: RequestInit) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.claudeai.directory/api';

  try {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      next: { revalidate: 60, ...((options as { next?: { revalidate?: number } })?.next) },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`Server Fetch Error (${response.status} ${endpoint}):`, text);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (response.status === 204) return null;

    return normalizeIds(await response.json());
  } catch (error) {
    console.error(`Fetch failed for ${endpoint}:`, error);
    throw error;
  }
}
