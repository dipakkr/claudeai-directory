"use client";

// Install-intent analytics (CLAUDE.md "Analytics", INSTALL_REGISTRY.md "Install Metrics").
// A copied command is install intent, never a confirmed install.

export type AnalyticsEvent =
  | "resource_viewed"
  | "search_performed"
  | "install_clicked"
  | "install_command_copied"
  | "marketplace_command_copied"
  | "mcp_command_copied"
  | "source_clicked"
  | "resource_submitted";

export interface EventProps {
  resource_type?: "skill" | "mcp" | "agent";
  resource_id?: string;
  query?: string;
}

// Events the backend stores for rankings (see docs/INSTALL_API_CONTRACT.md).
const BACKEND_EVENTS = new Set<AnalyticsEvent>([
  "resource_viewed",
  "search_performed",
  "install_clicked",
  "install_command_copied",
  "marketplace_command_copied",
  "mcp_command_copied",
  "source_clicked",
]);

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
const ANON_KEY = "cad_anon_id";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

function anonId(): string | undefined {
  try {
    let id = localStorage.getItem(ANON_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(ANON_KEY, id);
    }
    return id;
  } catch {
    return undefined;
  }
}

export function track(event: AnalyticsEvent, props: EventProps = {}) {
  if (typeof window === "undefined") return;
  const payload = { ...props, query: props.query?.slice(0, 200) };
  try {
    window.op?.("track", event, payload);
    window.gtag?.("event", event, payload);
  } catch {
    /* analytics must never break the page */
  }
  if (!BACKEND_EVENTS.has(event)) return;
  try {
    void fetch(`${API_BASE}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, ...payload, anon_id: anonId() }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* ignore */
  }
}
