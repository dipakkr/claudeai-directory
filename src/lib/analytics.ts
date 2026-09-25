"use client";

// Product analytics: OpenPanel (+ gtag), and the install events our backend
// ranks on. The full event list and why each exists: docs/ANALYTICS_EVENTS.md.
// A copied command is install intent, never a confirmed install.

export type InstallEvent =
  | "resource_viewed"
  | "search_performed"
  | "install_clicked"
  | "install_command_copied"
  | "marketplace_command_copied"
  | "mcp_command_copied"
  | "source_clicked"
  | "resource_submitted";

// Kept deliberately short: these dashboards may be shared publicly, so only
// events that answer a real business question, and no names or emails.
export type ProductEvent =
  | "ad_clicked" // a sponsor card in the sidebar
  | "ad_slot_clicked" // an open slot, "Advertise", or the sponsored launch banner
  | "website_clicked" // "Visit website" on a launch page
  | "launch_upvoted"
  | "launch_submitted"
  | "user_profile_clicked" // any link to a member profile
  | "community_posted" // a new discussion or a reply
  | "sign_in_prompted" // the sign-in modal opened, with the reason
  | "signed_in";

export type AnalyticsEvent = InstallEvent | ProductEvent;

export type PropValue = string | number | boolean | null | undefined;

export interface EventProps {
  resource_type?: "skill" | "mcp" | "agent" | "plugin";
  resource_id?: string;
  query?: string;
  [key: string]: PropValue;
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
  const payload: EventProps = { ...props };
  if (typeof props.query === "string") payload.query = props.query.slice(0, 200);
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

/** Ties later events to a signed-in member by an opaque id only (no name, username or email). */
export function identifyUser(user: { id: string }) {
  try {
    window.op?.("identify", { profileId: user.id });
  } catch {
    /* ignore */
  }
}

export function clearUser() {
  try {
    window.op?.("clear");
  } catch {
    /* ignore */
  }
}
