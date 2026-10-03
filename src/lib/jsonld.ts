const DATE_KEYS = new Set(["datePublished", "dateModified", "dateCreated", "uploadDate", "startDate", "endDate", "validThrough"]);

/** "2026-09-24T13:42:00" (no zone) -> "2026-09-24T13:42:00Z". The API stores UTC; Google wants an explicit zone. */
export function withTimezone(value: string): string {
  return /T\d{2}:\d{2}/.test(value) && !/(Z|[+-]\d{2}:?\d{2})$/i.test(value) ? `${value}Z` : value;
}

function normalize(value: unknown, key?: string): unknown {
  if (typeof value === "string") return key && DATE_KEYS.has(key) ? withTimezone(value) : value;
  if (Array.isArray(value)) return value.map((v) => normalize(v));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, normalize(v, k)]));
  }
  return value;
}

/** JSON-LD for a <script> tag: dates get a timezone, and "<" is escaped so user text can't close the tag. */
export function ldJson(data: unknown): string {
  return JSON.stringify(normalize(data)).replace(/</g, "\\u003c");
}
