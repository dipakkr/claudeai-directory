import { API_BASE, ApiError, api } from "./api";

export interface StudioConfig {
  enabled: boolean;
  currency: string;
  products: { slug: string; name: string; amount: number | null; purchasable: boolean }[];
  subscription: { amount: number | null; interval: "month"; purchasable: boolean };
}
export interface StudioLibrary {
  premium: boolean;
  subscription_status: string | null;
  cancel_at_period_end: boolean;
  current_period_end: number | null;
  can_manage_billing: boolean;
  saved_skills?: { slug: string; name: string }[];
  skills: { slug: string; name: string; access: "purchased" | "premium" | null; downloadable: boolean }[];
}

export async function studioRequest<T>(endpoint: string, body?: unknown, signal?: AbortSignal, method: "POST" | "PUT" = "POST"): Promise<T> {
  const token = api.getToken();
  const response = await fetch(`${API_BASE}/studio${endpoint}`, {
    method: body === undefined ? "GET" : method,
    cache: "no-store",
    signal,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  if (!response.ok) throw new ApiError(response.status, await response.json().catch(() => null));
  return response.json() as Promise<T>;
}

export function commerceError(error: unknown): string {
  if (error instanceof ApiError && typeof error.data === "object" && error.data !== null && "detail" in error.data && typeof error.data.detail === "string") return error.data.detail;
  return "Something went wrong. Please try again.";
}

export function money(amount: number, currency = "usd") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: currency.toUpperCase(), minimumFractionDigits: amount % 100 ? 2 : 0 }).format(amount / 100);
}

export function paymentRedirect(url: string) {
  const destination = new URL(url);
  if (destination.protocol !== "https:" || !["checkout.stripe.com", "billing.stripe.com"].includes(destination.hostname)) throw new Error("Unexpected payment destination");
  window.location.assign(destination.href);
}

export async function downloadSkill(slug: string) {
  const token = api.getToken();
  if (!token) throw new Error("Sign in to download this skill.");
  const response = await fetch(`${API_BASE}/studio/skills/${encodeURIComponent(slug)}/download`, {
    method: "POST", cache: "no-store", headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new ApiError(response.status, await response.json().catch(() => null));
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/zip")) throw new Error("Unexpected download format");
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${slug}.zip`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.dispatchEvent(new CustomEvent("studio:downloaded", { detail: { slug } }));
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export function skillInstallPrompt(slug: string, name: string) {
  return `Help me set up ${name} from ${slug}.zip for this project. Inspect SKILL.md and the bundled setup instructions, explain its dependencies, and run a small test using my brief. Ask before using paid generation services.`;
}
