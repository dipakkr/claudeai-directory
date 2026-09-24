"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Lock } from "lucide-react";
import { toast } from "sonner";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  OPEN_ADVERTISE_EVENT,
  SPONSOR_CATEGORIES,
  SPONSOR_CHECKOUT_URL,
  SPONSOR_EMAIL,
  SPONSOR_MONTHLY_PRICE,
} from "@/lib/advertise";
import { useAuth } from "@/lib/auth";

// Facts about the placement only: no traffic numbers we can't back up.
const INCLUDED = ["Sidebar card", "Tracked link", "Monthly click report"];

const TAGLINE_MAX = 60;

const inputClass =
  "h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-primary/60 focus:outline-none";

function normalizeUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function Steps({ step }: { step: 0 | 1 }) {
  return (
    <div className="flex items-center gap-1.5 pr-8" aria-label={`Step ${step + 1} of 2`}>
      {[0, 1].map((i) => (
        <span key={i} className={`h-1 flex-1 rounded-full ${i <= step ? "bg-primary" : "bg-border"}`} />
      ))}
    </div>
  );
}

function faviconFor(site: string) {
  try {
    const host = new URL(normalizeUrl(site)).hostname;
    return host.includes(".") ? `https://www.google.com/s2/favicons?domain=${host}&sz=64` : null;
  } catch {
    return null;
  }
}

/** Mirrors the sidebar sponsor card, so buyers see exactly what they get. */
function CardPreview({ product, website, tagline, category }: { product: string; website: string; tagline: string; category: string }) {
  const icon = faviconFor(website);
  const initial = (product.trim()[0] || "?").toUpperCase();
  return (
    <div className="rounded-xl bg-[#050505] p-3">
      <div className="flex min-h-[132px] flex-col items-center justify-center rounded-md border border-[#4a4238] bg-[#221f1b] px-3 py-3 text-center text-white">
        <span className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-md bg-[#f3e6d8] text-sm font-bold text-[#2a2118]">
          {initial}
          {icon && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={icon}
              alt=""
              className="absolute inset-1 h-[calc(100%-8px)] w-[calc(100%-8px)] object-contain"
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          )}
        </span>
        <p className="mt-2 max-w-full truncate text-[13px] font-semibold leading-tight">{product.trim() || "Your product"}</p>
        <span className="mt-1 rounded-full bg-white/10 px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-[0.08em] text-white/80">
          Sponsor
        </span>
        <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-white/70">{tagline.trim() || "Your one line shows here."}</p>
      </div>
      <p className="mt-2 text-center text-[10px] text-white/50">In the {category} sidebar</p>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 flex items-baseline justify-between text-xs font-medium text-foreground">
        {label}
        {hint && <span className="font-normal text-muted-foreground">{hint}</span>}
      </span>
      {children}
    </label>
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
  const [email, setEmail] = useState("");

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

  // Default to the signed-in account's email until the user types their own.
  const emailValue = email || user?.email || "";

  const selected = SPONSOR_CATEGORIES.find((c) => c.title === category);
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
    window.location.href = `mailto:${SPONSOR_EMAIL}?subject=${encodeURIComponent(
      `Sponsor slot: ${selected?.label ?? category}`,
    )}&body=${encodeURIComponent(body)}`;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[92vh] gap-3 overflow-y-auto p-5 sm:max-w-[560px]">
        <Steps step={step} />

        {step === 0 ? (
          <>
            <DialogHeader className="mt-1 text-left">
              <DialogTitle className="text-lg">Sponsor a category</DialogTitle>
              <DialogDescription className="text-[13px]">
                Your product in the sidebar, next to tools like it.
              </DialogDescription>
            </DialogHeader>

            <div className="flex items-center justify-between gap-3 rounded-xl border border-primary/40 bg-primary/[0.06] px-3.5 py-2.5">
              <p>
                <span className="text-lg font-semibold text-foreground">${SPONSOR_MONTHLY_PRICE}</span>
                <span className="ml-1 text-xs text-muted-foreground">/ month</span>
              </p>
              <ul className="flex flex-wrap justify-end gap-x-3 gap-y-1">
                {INCLUDED.map((item) => (
                  <li key={item} className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Check className="h-3 w-3 text-primary" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-[13px] font-medium text-foreground">Pick a category</p>
              <div role="radiogroup" aria-label="Category" className="mt-2 grid grid-cols-2 gap-1.5">
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
                      className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-[13px] transition-colors disabled:opacity-40 ${
                        active ? "border-foreground bg-foreground text-background" : "border-border bg-background text-foreground hover:border-[var(--cad-line-hover)]"
                      }`}
                    >
                      <span className="truncate font-medium">{c.label}</span>
                      {/* Real availability only: no invented scarcity. */}
                      {(soldOut || c.openSlots === 1) && (
                        <span className={`shrink-0 text-[10px] ${active ? "text-background/70" : "text-muted-foreground"}`}>
                          {soldOut ? "Full" : "1 left"}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-full bg-foreground text-sm font-medium text-background transition-colors hover:bg-foreground/85"
            >
              Continue with {selected?.label ?? "this category"}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <DialogHeader className="mt-1 text-left">
              <DialogTitle className="text-lg">Your sponsor card</DialogTitle>
              <DialogDescription className="text-[13px]">What builders see in the sidebar.</DialogDescription>
            </DialogHeader>

            <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-3 py-2 text-[13px]">
              <span className="min-w-0 truncate text-foreground">
                <span className="font-medium">{selected?.label}</span>
                <span className="text-muted-foreground"> · ${SPONSOR_MONTHLY_PRICE}/month</span>
              </span>
              <button type="button" onClick={() => setStep(0)} className="shrink-0 text-xs font-medium text-primary hover:underline">
                Change
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_190px]">
              <div className="space-y-3">
                <Field label="Product name">
                  <input value={product} onChange={(e) => setProduct(e.target.value)} placeholder="Acme MCP" className={inputClass} autoFocus />
                </Field>
                <Field label="Website">
                  <input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="acme.dev" className={inputClass} />
                </Field>
                <Field label="One line for your card" hint={`${tagline.length}/${TAGLINE_MAX}`}>
                  <input
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value.slice(0, TAGLINE_MAX))}
                    placeholder="Turn any website into Claude-ready data"
                    className={inputClass}
                  />
                </Field>
                <Field label="Email">
                  <input type="email" value={emailValue} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" className={inputClass} />
                </Field>
              </div>
              <div>
                <p className="mb-1 text-xs font-medium text-foreground">Preview</p>
                <CardPreview product={product} website={website} tagline={tagline} category={selected?.label.toLowerCase() ?? ""} />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStep(0)}
                aria-label="Back"
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <button
                type="submit"
                disabled={!ready}
                className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-full bg-foreground text-sm font-medium text-background transition-colors hover:bg-foreground/85 disabled:opacity-40"
              >
                {SPONSOR_CHECKOUT_URL ? (
                  <>
                    <Lock className="h-4 w-4" aria-hidden="true" />
                    Pay ${SPONSOR_MONTHLY_PRICE} now
                  </>
                ) : (
                  "Request this slot"
                )}
              </button>
            </div>
            <p className="text-center text-[11px] text-muted-foreground">
              {SPONSOR_CHECKOUT_URL
                ? "Secure checkout. Billed monthly."
                : `We confirm your slot and start date by email.`}
            </p>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
