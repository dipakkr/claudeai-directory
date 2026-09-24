import type { ProductEvent, PropValue } from "@/lib/analytics";

/**
 * Click tracking that works in server components: spread onto an `<a>` or
 * `<button>` and OpenPanel records the click (its `trackAttributes` option).
 * Prop names arrive in camelCase. Event list: docs/ANALYTICS_EVENTS.md.
 */
export function trackAttrs(event: ProductEvent, props: Record<string, PropValue> = {}) {
  const attrs: Record<string, string> = { "data-track": event };
  for (const [key, value] of Object.entries(props)) {
    if (value !== undefined && value !== null && value !== "") {
      attrs[`data-${key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}`] = String(value);
    }
  }
  return attrs;
}
