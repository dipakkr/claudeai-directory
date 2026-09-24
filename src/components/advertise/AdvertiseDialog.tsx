"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { toast } from "sonner";

import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import {
  OPEN_ADVERTISE_EVENT,
  SPONSOR_CATEGORIES,
  SPONSOR_CHECKOUT_URL,
  SPONSOR_EMAIL,
  SPONSOR_MONTHLY_PRICE,
} from "@/lib/advertise";
import { useAuth } from "@/lib/auth";

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

/**
 * A small, literal map of the site: page in the middle, sponsor rails on the
 * sides, and the buyer's slot lit up. In step 2 their card sits in the slot.
 */
function SiteMap({ category, card }: { category: string; card?: { product: string; website: string; tagline: string } }) {
  const railBlock = "h-9 rounded-[3px] border border-white/10 bg-white/[0.04]";
  return (
    <div className="flex h-full flex-col justify-center">
      <div className="overflow-hidden rounded-md border border-white/10 bg-[#0b0a09] pb-1">
        <div className="flex h-5 items-center gap-1 border-b border-white/10 px-2">
          {[0, 1, 2].map((i) => (
            <span key={i} className="h-1.5 w-1.5 rounded-full bg-white/15" />
          ))}
        </div>
        <div className="grid grid-cols-[52px_minmax(0,1fr)_76px] gap-2 p-2">
          <div className="space-y-1.5">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className={railBlock} />
            ))}
          </div>
          <div className="space-y-2 pt-1">
            <div className="mx-auto h-2 w-3/4 rounded-sm bg-white/20" />
            <div className="mx-auto h-1.5 w-1/2 rounded-sm bg-white/10" />
            <div className="space-y-1.5 pt-2">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-sm bg-white/10" />
                  <span className="h-1.5 flex-1 rounded-sm bg-white/[0.07]" />
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <div className={railBlock} />
            {card ? (
              <div className="flex flex-col items-center rounded-[3px] border border-primary/70 bg-[#221f1b] px-1 py-1.5 text-center shadow-[0_0_0_3px_rgba(217,119,87,0.18)]">
                <ProductIcon website={card.website} product={card.product} className="h-4 w-4 text-[8px]" />
                <span className="mt-1 w-full truncate text-[7px] font-semibold text-white">{card.product.trim() || "Your product"}</span>
                <span className="line-clamp-2 w-full text-[6px] leading-tight text-white/60">{card.tagline.trim() || "Your one line"}</span>
              </div>
            ) : (
              <div className="flex h-[58px] items-center justify-center rounded-[3px] border border-primary/70 bg-primary/15 text-[8px] font-medium text-primary shadow-[0_0_0_3px_rgba(217,119,87,0.18)]">
                You
              </div>
            )}
            <div className={railBlock} />
          </div>
        </div>
      </div>
      <p className="mt-2 text-[11px] leading-4 text-white/55">
        Your card sits in the <span className="text-white/85">{category.toLowerCase()}</span> sidebar, shown across the site on
        large screens.
      </p>
    </div>
  );
}

export default function AdvertiseDialog() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<0 | 1>(0);
  const [category, setCategory] = useState(SPONSOR_CATEGORIES[0]?.title ?? "");
  const [product, setProduct] = useState("");
  const [website, setWebsite] = useState("");
  const [tagline, setTagline] = useState("");
  // null = untouched: show the account email. Once edited, the field is fully the user's (it can be cleared).
  const [email, setEmail] = useState<string | null>(null);

  // Open from sidebar buttons (custom event) or from old /advertise links (?advertise=1).
  useEffect(() => {
    const onOpen = (event: Event) => {
      const picked = (event as CustomEvent<{ category?: string }>).detail?.category;
      if (picked && SPONSOR_CATEGORIES.some((c) => c.title === picked)) setCategory(picked);
      setStep(0);
      setOpen(true);
    };
    window.addEventListener(OPEN_ADVERTISE_EVENT, onOpen);

    const params = new URLSearchParams(window.location.search);
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
    };
  }, []);

  const emailValue = email ?? user?.email ?? "";

  const selected = SPONSOR_CATEGORIES.find((c) => c.title === category);
  const label = selected?.label ?? "";
  const ready = product.trim().length > 1 && /\S+@\S+\.\S+/.test(emailValue) && !!website.trim();

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!ready) {
      toast.error("Add your product, website and email");
      return;
    }
    const site = normalizeUrl(website);

    if (SPONSOR_CHECKOUT_URL) {
      // Lemon Squeezy hosted checkout: prefill email and attach the order details.
      const url = new URL(SPONSOR_CHECKOUT_URL);
      url.searchParams.set("checkout[email]", emailValue.trim());
      url.searchParams.set("checkout[custom][category]", category);
      url.searchParams.set("checkout[custom][product]", product.trim());
      url.searchParams.set("checkout[custom][website]", site);
      if (tagline.trim()) url.searchParams.set("checkout[custom][tagline]", tagline.trim());
      window.open(url.toString(), "_blank", "noopener");
      return;
    }

    // No checkout configured yet: send a prefilled request instead.
    const body = [
      "Hi,",
      "",
      `I'd like the monthly sponsor slot ($${SPONSOR_MONTHLY_PRICE}/month).`,
      "",
      `Category: ${category}`,
      `Product: ${product.trim()}`,
      `Website: ${site}`,
      `One line: ${tagline.trim() || "(not set)"}`,
      `Email: ${emailValue.trim()}`,
    ].join("\n");
    window.location.href = `mailto:${SPONSOR_EMAIL}?subject=${encodeURIComponent(`Sponsor slot: ${label || category}`)}&body=${encodeURIComponent(body)}`;
  };

  const primaryButton =
    "inline-flex h-10 items-center justify-center gap-2 rounded-md bg-foreground px-5 text-sm font-medium text-background transition-colors hover:bg-foreground/85 disabled:opacity-40";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[92vh] gap-0 overflow-y-auto p-0 sm:max-w-[720px]">
        <div className="grid sm:grid-cols-[240px_minmax(0,1fr)]">
          {/* Left: where you appear */}
          <div className="hidden border-r border-border bg-[#141311] p-4 sm:block">
            <SiteMap category={label} card={step === 1 ? { product, website, tagline } : undefined} />
          </div>

          {/* Right: the decision */}
          <div className="p-5 sm:p-6">
            <div className="flex items-center justify-between pr-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Sponsorship</p>
              <p className="font-mono text-[10px] text-muted-foreground">{step + 1} / 2</p>
            </div>

            {step === 0 ? (
              <>
                <DialogTitle className="mt-3 text-2xl font-normal leading-tight">Sponsor a category</DialogTitle>
                <DialogDescription className="mt-1.5 text-sm leading-6 text-muted-foreground">
                  <span className="text-foreground">${SPONSOR_MONTHLY_PRICE} a month</span> for one category. Your card, a
                  tracked link and a monthly click report.
                </DialogDescription>

                <fieldset className="mt-5">
                  <legend className="text-xs text-muted-foreground">Category</legend>
                  <div role="radiogroup" className="mt-2 grid grid-cols-2 gap-x-4">
                    {SPONSOR_CATEGORIES.map((c) => {
                      const active = c.title === category;
                      const soldOut = c.openSlots === 0;
                      return (
                        <button
                          key={c.title}
                          type="button"
                          role="radio"
                          aria-checked={active}
                          disabled={soldOut}
                          onClick={() => setCategory(c.title)}
                          title={c.neighbors.length ? `Next to ${c.neighbors.join(" and ")}` : undefined}
                          className="group flex items-center gap-2.5 border-b border-border py-2.5 text-left text-sm disabled:opacity-40"
                        >
                          <span
                            className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border ${
                              active ? "border-foreground" : "border-muted-foreground/50 group-hover:border-foreground/70"
                            }`}
                          >
                            {active && <span className="h-1.5 w-1.5 rounded-full bg-foreground" />}
                          </span>
                          <span className={active ? "font-medium text-foreground" : "text-foreground/80"}>{c.label}</span>
                          {/* Real availability only: no invented scarcity. */}
                          {(soldOut || c.openSlots === 1) && (
                            <span className="ml-auto text-[10px] text-muted-foreground">{soldOut ? "Full" : "1 left"}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>

                <div className="mt-6 flex items-center justify-between gap-3">
                  <p className="text-xs text-muted-foreground">Questions? {SPONSOR_EMAIL}</p>
                  <button type="button" onClick={() => setStep(1)} className={primaryButton}>
                    Continue
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </>
            ) : (
              <form onSubmit={submit}>
                <DialogTitle className="mt-3 text-2xl font-normal leading-tight">Your card</DialogTitle>
                <DialogDescription className="mt-1.5 text-sm text-muted-foreground">
                  {label} · ${SPONSOR_MONTHLY_PRICE}/month ·{" "}
                  <button type="button" onClick={() => setStep(0)} className="text-foreground underline underline-offset-4 hover:text-primary">
                    change
                  </button>
                </DialogDescription>

                <div className="mt-5 space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-1 block text-xs text-muted-foreground">Product</span>
                      <input value={product} onChange={(e) => setProduct(e.target.value)} placeholder="Acme MCP" className={inputClass} autoFocus />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-xs text-muted-foreground">Website</span>
                      <input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="acme.dev" className={inputClass} />
                    </label>
                  </div>
                  <label className="block">
                    <span className="mb-1 flex justify-between text-xs text-muted-foreground">
                      One line <span>{tagline.length}/{TAGLINE_MAX}</span>
                    </span>
                    <input
                      value={tagline}
                      onChange={(e) => setTagline(e.target.value.slice(0, TAGLINE_MAX))}
                      placeholder="Turn any website into Claude-ready data"
                      className={inputClass}
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs text-muted-foreground">Email</span>
                    <input type="email" value={emailValue} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" className={inputClass} />
                  </label>
                </div>

                {/* Mobile has no site map, so show the card here. */}
                <div className="mt-4 flex items-center gap-3 rounded-md border border-border bg-[#141311] p-3 sm:hidden">
                  <ProductIcon website={website} product={product} className="h-8 w-8 text-xs" />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-white">{product.trim() || "Your product"}</span>
                    <span className="block truncate text-xs text-white/60">{tagline.trim() || "Your one line"}</span>
                  </span>
                </div>

                <div className="mt-6 flex items-center justify-between gap-3">
                  <button type="button" onClick={() => setStep(0)} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                    Back
                  </button>
                  <button type="submit" disabled={!ready} className={primaryButton}>
                    {SPONSOR_CHECKOUT_URL ? `Pay $${SPONSOR_MONTHLY_PRICE}` : "Request this slot"}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
                <p className="mt-3 text-right text-[11px] text-muted-foreground">
                  {SPONSOR_CHECKOUT_URL ? "Secure checkout. Billed monthly." : "We confirm your slot and start date by email."}
                </p>
              </form>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
