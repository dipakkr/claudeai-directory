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
const INCLUDED = [
  "Your logo, name and one line in the sidebar across the site on large screens",
  "Grouped with tools in your category, so the right people notice it",
  "A tracked link and a monthly click report",
];

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
      <DialogContent className="max-h-[92vh] gap-3 overflow-y-auto p-5 sm:max-w-[500px]">
        <Steps step={step} />

        {step === 0 ? (
          <>
            <DialogHeader className="mt-1">
              <DialogTitle className="text-lg">Put your product where Claude builders look</DialogTitle>
              <DialogDescription className="text-[13px] leading-5">
                People come here to pick the Skills, MCP servers and Agents they will use next. Sponsor a category and
                your product is part of that choice.
              </DialogDescription>
            </DialogHeader>

            <div className="rounded-xl border border-primary/40 bg-primary/[0.06] px-3.5 py-3">
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-[13px] font-semibold text-foreground">Category sponsor</p>
                <p>
                  <span className="text-lg font-semibold text-foreground">${SPONSOR_MONTHLY_PRICE}</span>
                  <span className="ml-1 text-xs text-muted-foreground">/ month</span>
                </p>
              </div>
              <ul className="mt-2 space-y-1">
                {INCLUDED.map((item) => (
                  <li key={item} className="flex gap-2 text-xs leading-5 text-muted-foreground">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-[13px] font-medium text-foreground">Which category fits your product?</p>
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
                      className={`flex items-center justify-between gap-2 rounded-lg border px-2.5 py-1.5 text-left text-[13px] transition-colors disabled:opacity-40 ${
                        active ? "border-foreground bg-foreground text-background" : "border-border bg-background text-foreground hover:border-[var(--cad-line-hover)]"
                      }`}
                    >
                      <span className="truncate font-medium">{c.label}</span>
                      <span className={`shrink-0 text-[10px] ${active ? "text-background/70" : "text-muted-foreground"}`}>
                        {/* Real availability only: no invented scarcity. */}
                        {soldOut ? "Full" : c.openSlots === 1 ? "1 left" : "Available"}
                      </span>
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
            <DialogHeader className="mt-1">
              <DialogTitle className="text-lg">Set up your sponsor card</DialogTitle>
              <DialogDescription className="text-[13px] leading-5">
                This is what builders see in the sidebar. Keep the line short and specific.
              </DialogDescription>
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

            <div className="grid gap-2 sm:grid-cols-2">
              <input aria-label="Product name" value={product} onChange={(e) => setProduct(e.target.value)} placeholder="Product name" className={inputClass} autoFocus />
              <input aria-label="Website" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="yourproduct.com" className={inputClass} />
              <div className="sm:col-span-2">
                <input
                  aria-label="One line for your card"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value.slice(0, TAGLINE_MAX))}
                  placeholder="One line for your card, like: Turn any website into Claude-ready data"
                  className={inputClass}
                />
                <p className="mt-1 text-right text-[10px] text-muted-foreground">
                  {tagline.length}/{TAGLINE_MAX}
                </p>
              </div>
              <input
                aria-label="Email"
                type="email"
                value={emailValue}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className={`${inputClass} sm:col-span-2`}
              />
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
                ? `Secure checkout. Billed monthly for the ${selected?.label ?? "selected"} category.`
                : `We reply by email to confirm your slot and start date. Questions: ${SPONSOR_EMAIL}`}
            </p>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
