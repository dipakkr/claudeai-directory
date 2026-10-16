"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";

import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import {
  OPEN_ADVERTISE_EVENT,
  SPONSOR_WEEKLY_PRICE,
} from "@/lib/advertise";
import { SponsorReach } from "@/components/advertise/SponsorReach";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const TAGLINE_MAX = 60;

const inputClass =
  "h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-foreground/40 focus:outline-none";

function normalizeUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function faviconFor(site: string) {
  try {
    const host = new URL(normalizeUrl(site)).hostname;
    return host.includes(".") ? `https://www.google.com/s2/favicons?domain=${host}&sz=64` : null;
  } catch {
    return null;
  }
}

function ProductIcon({ website, product, className }: { website: string; product: string; className: string }) {
  const icon = faviconFor(website);
  return (
    <span className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded bg-[#f3e6d8] font-bold text-[#2a2118] ${className}`}>
      {(product.trim()[0] || "?").toUpperCase()}
      {icon && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={icon}
          alt=""
          className="absolute inset-0.5 h-[calc(100%-4px)] w-[calc(100%-4px)] object-contain"
          referrerPolicy="no-referrer"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      )}
    </span>
  );
}

type CardDraft = { product: string; website: string; tagline: string };

/** The buyer's own card, lit up and filled in as they type. */
function YourCard({ card, row = false }: { card: CardDraft; row?: boolean }) {
  const name = card.product.trim() || "Your product";
  const line = card.tagline.trim() || "Your one line about it";
  if (row) {
    return (
      <div className="flex items-center gap-2.5 rounded-lg border border-primary/70 bg-primary/[0.08] px-3 py-2.5 shadow-[0_0_0_4px_rgba(217,119,87,0.12)]">
        <ProductIcon website={card.website} product={name} className="h-7 w-7 text-[11px]" />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[12.5px] font-medium text-foreground">{name}</span>
          <span className="block truncate text-[11px] text-muted-foreground">{line}</span>
        </span>
        <span className="text-[9px] uppercase tracking-[0.08em] text-muted-foreground">Sponsored</span>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center rounded-md border border-primary/70 bg-primary/[0.08] px-2 py-3 text-center shadow-[0_0_0_4px_rgba(217,119,87,0.12)]">
      <ProductIcon website={card.website} product={name} className="h-8 w-8 text-xs" />
      <span className="mt-1.5 w-full truncate text-[12px] font-semibold text-foreground">{name}</span>
      <span className="line-clamp-2 w-full text-[10.5px] leading-snug text-muted-foreground">{line}</span>
    </div>
  );
}

export default function AdvertiseDialog() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [product, setProduct] = useState("");
  const [website, setWebsite] = useState("");
  const [tagline, setTagline] = useState("");
  // null = untouched: show the account email. Once edited, the field is fully the user's (it can be cleared).
  const [email, setEmail] = useState<string | null>(null);
  const [weeks, setWeeks] = useState(1);
  const [paying, setPaying] = useState(false);
  // Server checkout (Stripe secret key on the backend) wins when it is set up.
  const { data: checkout, isPending: checkoutLoading, isError: checkoutFailed, refetch: retryCheckout } = useQuery({
    queryKey: ["sponsors", "config"],
    queryFn: () => api.get<{ enabled: boolean; amount: number; interval?: string; mode?: string; preview?: boolean }>("/sponsors/config"),
    enabled: open,
    staleTime: 5 * 60_000,
    retry: 2,
    retryDelay: 1000,
  });
  const price = SPONSOR_WEEKLY_PRICE;
  const canPay = !!checkout?.enabled && checkout.amount === price * 100 && checkout.interval === "week" && checkout.mode === "payment";

  // Open from sidebar buttons (custom event) or from old /advertise links (?advertise=1).
  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener(OPEN_ADVERTISE_EVENT, onOpen);

    const params = new URLSearchParams(window.location.search);
    const sponsor = params.get("sponsor");
    // Small delay so the toaster has mounted before we post the message.
    const notice =
      sponsor === "success"
        ? window.setTimeout(() => toast.success("Payment submitted. Your ad will go live after payment verification and admin approval."), 600)
        : sponsor === "cancelled"
          ? window.setTimeout(() => toast("Checkout cancelled. Your slot is still available."), 600)
          : undefined;
    if (sponsor) {
      params.delete("sponsor");
      params.delete("session_id");
      const rest = params.toString();
      window.history.replaceState(null, "", `${window.location.pathname}${rest ? `?${rest}` : ""}${window.location.hash}`);
    }
    let timer: number | undefined;
    if (params.get("advertise") === "1") {
      timer = window.setTimeout(() => setOpen(true), 0);
      params.delete("advertise");
      const rest = params.toString();
      window.history.replaceState(null, "", `${window.location.pathname}${rest ? `?${rest}` : ""}${window.location.hash}`);
    }
    return () => {
      window.removeEventListener(OPEN_ADVERTISE_EVENT, onOpen);
      if (timer) window.clearTimeout(timer);
      if (notice) window.clearTimeout(notice);
    };
  }, []);

  const emailValue = email ?? user?.email ?? "";

  const card = { product, website, tagline };
  const ready = product.trim().length > 1 && /\S+@\S+\.\S+/.test(emailValue) && !!website.trim();

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!canPay || paying) {
      toast("Weekly checkout is currently unavailable.");
      return;
    }
    if (!ready) {
      toast.error("Add your product, website and email");
      return;
    }
    const site = normalizeUrl(website);

    if (canPay) {
      setPaying(true);
      api
        .post<{ url: string }>("/sponsors/checkout", {
          slot: "sidebar",
          weeks,
          product: product.trim(),
          website: site,
          tagline: tagline.trim(),
          email: emailValue.trim(),
        })
        // Same-tab redirect: a window.open after an await is often blocked.
        .then(({ url }) => window.location.assign(url))
        .catch((error) => {
          setPaying(false);
          const detail = error instanceof ApiError ? (error.data as { detail?: unknown })?.detail : undefined;
          toast.error(typeof detail === "string" ? detail : "Could not start checkout. Check your details and try again.");
        });
      return;
    }

  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[92vh] gap-0 overflow-y-auto p-0 sm:max-w-[820px]">
        <div className="grid sm:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="flex flex-col border-b border-border bg-[var(--cad-band)] p-6 sm:border-b-0 sm:border-r">
            <SponsorReach />
          </aside>

          {/* Right: pick, fill in, pay */}
          <form onSubmit={submit} className="p-6 sm:p-7">
            <DialogTitle className="pr-6 text-[22px] font-normal leading-tight">
              Advertise with us
            </DialogTitle>
            <DialogDescription className="mt-1.5 text-[13px] leading-relaxed text-[var(--cad-desc)]">
              A community of builders, founders and marketers building with Claude.
            </DialogDescription>
            <div className="mt-5 flex items-baseline gap-1.5">
              <span className="text-[28px] font-light leading-none text-foreground">${price}</span>
              <span className="text-[13px] text-muted-foreground">/ week · sidebar placement</span>
            </div>

            <div className="mt-6 space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-[12px] text-muted-foreground">Product</span>
                  <input value={product} onChange={(e) => setProduct(e.target.value)} placeholder="Acme MCP" className={inputClass} autoFocus />
                </label>
                <label className="block">
                  <span className="mb-1 block text-[12px] text-muted-foreground">Website</span>
                  <input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="acme.dev" className={inputClass} />
                </label>
              </div>
              <label className="block">
                <span className="mb-1 flex justify-between text-[12px] text-muted-foreground">
                  One line <span>{tagline.length}/{TAGLINE_MAX}</span>
                </span>
                <input
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value.slice(0, TAGLINE_MAX))}
                  placeholder="Turn any website into Claude-ready data"
                  className={inputClass}
                />
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-[12px] text-muted-foreground">Work email</span>
                <input type="email" value={emailValue} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" className={inputClass} />
              </label>
              <div>
                <label htmlFor="sponsor-weeks" className="mb-1 block text-[12px] text-muted-foreground">Reserve for</label>
                <Select value={String(weeks)} onValueChange={(value) => setWeeks(Number(value))}>
                  <SelectTrigger id="sponsor-weeks" className="h-9 rounded-md border-border text-[13px] focus:ring-1 focus:ring-primary/40 focus:ring-offset-0 [&>span]:flex [&>span]:flex-1 [&>span]:items-center [&>span]:justify-between [&>span]:pr-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-md border-border bg-background p-1 shadow-xl" sideOffset={4}>
                    {[1, 2, 3, 4].map((count) => (
                      <SelectItem key={count} value={String(count)} className="my-0.5 cursor-pointer rounded-[4px] py-1.5 text-[12px] focus:bg-primary/10 data-[state=checked]:bg-primary/10 data-[state=checked]:text-foreground [&>span:last-child]:flex [&>span:last-child]:flex-1 [&>span:last-child]:justify-between [&>span:last-child]:gap-4">
                        <span>{count} {count === 1 ? "week" : "weeks"}</span>
                        <span className="text-muted-foreground tabular-nums">${price * count} total</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              </div>
            </div>

            {/* Owner-provided planning ranges, scaled to the reservation length. */}
            <div className="mt-4 rounded-md border border-blue-200 bg-blue-50 px-3 py-2.5 dark:border-blue-400/15 dark:bg-blue-400/10" aria-live="polite">
              <p className="text-[11px] text-muted-foreground">
                Estimated impressions · {weeks} {weeks === 1 ? "week" : "weeks"}
              </p>
              <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-foreground">
                <span className="font-medium text-foreground">~{weeks * 7}–{weeks * 10}k impressions</span>
              </p>
              <p className="mt-1 text-[10px] text-muted-foreground">Estimates only. Results may vary.</p>
            </div>

            {/* Mobile has no preview column, so show the card here. */}
            <div className="mt-4 sm:hidden">
              <YourCard card={card} row />
            </div>

            <button
              type="submit"
              disabled={!ready || !canPay || paying}
              className="mt-6 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              {paying ? "Opening checkout..." : checkoutLoading ? "Loading checkout..." : canPay ? `${checkout?.preview ? "Preview payment" : "Continue to payment"} · $${price * weeks} total` : "Checkout unavailable"}
              {!paying && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
            </button>
            {checkoutFailed && (
              <p className="mt-2 text-center text-[11px] text-muted-foreground">
                Could not connect to checkout. <button type="button" onClick={() => void retryCheckout()} className="underline underline-offset-2">Try again</button>
              </p>
            )}
            <p className="mt-3 text-center text-[11.5px] text-muted-foreground">
              One payment, no automatic renewal.
            </p>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
