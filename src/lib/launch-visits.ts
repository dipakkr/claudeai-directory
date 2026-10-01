const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
const VISITED_KEY = "cad_visited_launches";
const VISITED_EVENT = "cad:launch-visited";

const isLocal = () => typeof window !== "undefined" && ["localhost", "127.0.0.1"].includes(window.location.hostname);

/** POST a small JSON payload as a beacon (text/plain: no CORS preflight). Skipped on local previews. */
export function sendMetric(path: string, body: unknown) {
  if (typeof window === "undefined" || isLocal()) return;
  const blob = new Blob([JSON.stringify(body)], { type: "text/plain" });
  try {
    if (!navigator.sendBeacon(`${API_BASE}${path}`, blob)) throw new Error("beacon refused");
  } catch {
    void fetch(`${API_BASE}${path}`, { method: "POST", body: blob, keepalive: true }).catch(() => {});
  }
}

function read(): string[] {
  try {
    return JSON.parse(localStorage.getItem(VISITED_KEY) || "[]");
  } catch {
    return [];
  }
}

/** Has this browser opened the launch's website from our site? */
export function hasVisitedLaunch(id: string): boolean {
  return read().includes(id);
}

/** Remember a website visit (unlocks upvoting) and report the click. */
export function markLaunchVisited(id: string, report = true) {
  try {
    const ids = read().filter((x) => x !== id);
    localStorage.setItem(VISITED_KEY, JSON.stringify([...ids, id].slice(-300)));
  } catch {
    // Storage blocked: the gate falls back to this page's memory via the event.
  }
  if (report) sendMetric("/metrics/click", { id });
  window.dispatchEvent(new CustomEvent(VISITED_EVENT, { detail: id }));
}

export function onLaunchVisited(handler: (id: string) => void) {
  const listener = (event: Event) => handler((event as CustomEvent<string>).detail);
  window.addEventListener(VISITED_EVENT, listener);
  return () => window.removeEventListener(VISITED_EVENT, listener);
}
