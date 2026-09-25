"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Check } from "lucide-react";
import { toast } from "sonner";

import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import {
  OPEN_ADVERTISE_EVENT,
  SPONSOR_CATEGORIES,
  SPONSOR_CHECKOUT_URL,
  SPONSOR_EMAIL,
  SPONSOR_LAUNCH_PRICE,
  SPONSOR_MONTHLY_PRICE,
  type SponsorSlot,
} from "@/lib/advertise";
import { sideAdCollections, type SideAdPlacement, type SideAdRail } from "@/data/sideAdPlacements";
import { api, ApiError } from "@/lib/api";
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

type CardDraft = { product: string; website: string; tagline: string };

/** A neighbour card in the preview, styled like the real rail. */
function RailCard({ placement }: { placement: SideAdPlacement }) {
  const open = placement.slotType === "available";
  return (
    <div
      className={`flex flex-col items-center rounded-md border px-2 py-2.5 text-center ${
        open ? "border-dashed border-foreground/20 text-muted-foreground" : "border-border bg-[var(--cad-tile)]"
      }`}
    >
      {open ? (
        <span className="flex h-6 w-6 items-center justify-center rounded-md border border-dashed border-foreground/30 text-[11px]">+</span>
      ) : (
        <ProductIcon website={placement.logoDomain} product={placement.name} className="h-6 w-6 text-[10px]" />
      )}
      <span className="mt-1.5 w-full truncate text-[11px] font-medium text-foreground/85">{open ? "Open slot" : placement.name}</span>
      {!open && <span className="line-clamp-1 w-full text-[10px] text-muted-foreground">{placement.headline}</span>}
    </div>
  );
}

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

/** The category sidebar as it will look, with the buyer's card in the first open spot. */
function RailPreview({ rail, card }: { rail?: SideAdRail; card: CardDraft }) {
  const taken = rail?.placements.filter((p) => p.slotType !== "available") ?? [];
  const open = rail?.placements.find((p) => p.slotType === "available");
  return (
    <div className="mx-auto w-[184px] rounded-xl border border-border bg-background p-2.5">
      <p className="px-1 pb-2 pt-1 text-center text-[12px] font-medium leading-tight text-foreground/85">{rail?.title ?? "Sidebar"}</p>
      <div className="space-y-2">
        {taken.slice(0, 1).map((p) => (
          <RailCard key={p.id} placement={p} />
        ))}
        <YourCard card={card} />
        {taken.slice(1, 2).map((p) => (
          <RailCard key={p.id} placement={p} />
        ))}
        {open && <RailCard placement={open} />}
      </div>
    </div>
  );
}

/** The launches list with the buyer's sponsored row in it. */
function LaunchPreview({ card }: { card: CardDraft }) {
  const row = (i: number) => (
    <div key={i} className="flex items-center gap-2.5 rounded-lg border border-border bg-[var(--cad-tile)] px-3 py-2.5">
      <span className="h-7 w-7 rounded-md bg-foreground/10" />
      <span className="flex-1 space-y-1.5">
        <span className="block h-2 w-1/2 rounded-sm bg-foreground/15" />
        <span className="block h-1.5 w-3/4 rounded-sm bg-foreground/[0.08]" />
      </span>
    </div>
  );
  return (
    <div className="space-y-2">
      <p className="px-1 text-[12px] font-medium text-foreground/85">Launches</p>
      {[0, 1].map(row)}
      <YourCard card={card} row />
      {[2].map(row)}
    </div>
  );
}

function slugPart(value: string, max: number) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, max);
}

/**
 * Build the checkout link for the configured provider.
 * Stripe Payment Links take only `prefilled_email` and `client_reference_id`
 * (letters, numbers, dashes, underscores; max 200), so the order is tagged as
 * "category__product". Lemon Squeezy accepts the full details as custom data.
 */
function checkoutUrl(order: { email: string; category: string; product: string; website: string; tagline: string }) {
  const url = new URL(SPONSOR_CHECKOUT_URL);
  if (/(^|\.)stripe\.com$/i.test(url.hostname)) {
    url.searchParams.set("prefilled_email", order.email);
    const ref = `${slugPart(order.category.replace(/^MCPs for /i, ""), 60)}__${slugPart(order.product, 120)}`;
    url.searchParams.set("client_reference_id", ref.replace(/[^a-z0-9_-]/g, "").slice(0, 200));
  } else {
    url.searchParams.set("checkout[email]", order.email);
    url.searchParams.set("checkout[custom][category]", order.category);
    url.searchParams.set("checkout[custom][product]", order.product);
    url.searchParams.set("checkout[custom][website]", order.website);
    if (order.tagline) url.searchParams.set("checkout[custom][tagline]", order.tagline);
  }
  return url.toString();
}

export default function AdvertiseDialog() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [slot, setSlot] = useState<SponsorSlot>("sidebar");
  const [category, setCategory] = useState(SPONSOR_CATEGORIES[0]?.title ?? "");
  const [product, setProduct] = useState("");
  const [website, setWebsite] = useState("");
  const [tagline, setTagline] = useState("");
  // null = untouched: show the account email. Once edited, the field is fully the user's (it can be cleared).
  const [email, setEmail] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  // Server checkout (Stripe secret key on the backend) wins when it is set up.
  const { data: checkout } = useQuery({
    queryKey: ["sponsors", "config"],
    queryFn: () => api.get<{ enabled: boolean; amount: number }>("/sponsors/config"),
    enabled: open,
    staleTime: 5 * 60_000,
    retry: false,
  });
  const serverCheckout = !!checkout?.enabled;
  const isLaunch = slot === "launch";
  const price = isLaunch ? SPONSOR_LAUNCH_PRICE : SPONSOR_MONTHLY_PRICE;
  // The payment-link fallback is the $499 sidebar product only.
  const canPay = serverCheckout || (!isLaunch && !!SPONSOR_CHECKOUT_URL);

  // Open from sidebar buttons (custom event) or from old /advertise links (?advertise=1).
  useEffect(() => {
    const onOpen = (event: Event) => {
      const detail = (event as CustomEvent<{ category?: string; slot?: SponsorSlot }>).detail;
      const picked = detail?.category;
      if (picked && SPONSOR_CATEGORIES.some((c) => c.title === picked)) setCategory(picked);
      const nextSlot = detail?.slot === "launch" ? "launch" : "sidebar";
      setSlot(nextSlot);
      setOpen(true);
    };
    window.addEventListener(OPEN_ADVERTISE_EVENT, onOpen);

    const params = new URLSearchParams(window.location.search);
    const sponsor = params.get("sponsor");
    // Small delay so the toaster has mounted before we post the message.
    const notice =
      sponsor === "success"
        ? window.setTimeout(() => toast.success("Thanks, your checkout is complete. We'll email you to confirm your slot and start date."), 600)
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

  const selected = SPONSOR_CATEGORIES.find((c) => c.title === category);
  const label = selected?.label ?? "";
  const rail = sideAdCollections.flatMap((c) => [c.left, c.right]).find((r) => r.title === category);
  const card = { product, website, tagline };
  const ready = product.trim().length > 1 && /\S+@\S+\.\S+/.test(emailValue) && !!website.trim();

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!ready) {
      toast.error("Add your product, website and email");
      return;
    }
    const site = normalizeUrl(website);

    if (serverCheckout) {
      setPaying(true);
      api
        .post<{ url: string }>("/sponsors/checkout", {
          slot,
          category: isLaunch ? undefined : category,
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

    if (!isLaunch && SPONSOR_CHECKOUT_URL) {
      window.open(checkoutUrl({ email: emailValue.trim(), category, product: product.trim(), website: site, tagline: tagline.trim() }), "_blank", "noopener");
      return;
    }

    // No checkout configured yet: send a prefilled request instead.
    const body = [
      "Hi,",
      "",
      isLaunch
        ? `I'd like the sponsored launch row ($${SPONSOR_LAUNCH_PRICE}/month).`
        : `I'd like the monthly sponsor slot ($${SPONSOR_MONTHLY_PRICE}/month).`,
      "",
      `Placement: ${isLaunch ? "Launches list" : category}`,
      `Product: ${product.trim()}`,
      `Website: ${site}`,
      `One line: ${tagline.trim() || "(not set)"}`,
      `Email: ${emailValue.trim()}`,
    ].join("\n");
    window.location.href = `mailto:${SPONSOR_EMAIL}?subject=${encodeURIComponent(isLaunch ? "Sponsored launch row" : `Sponsor slot: ${label || category}`)}&body=${encodeURIComponent(body)}`;
  };

  const facts = isLaunch
    ? ["A row inside the launches list", "Tracked link and a monthly click report", "Billed monthly"]
    : ["Shown site-wide on large screens", "Tracked link and a monthly click report", "Billed monthly"];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[92vh] gap-0 overflow-y-auto p-0 sm:max-w-[820px]">
        <div className="grid sm:grid-cols-[300px_minmax(0,1fr)]">
          {/* Left: a live preview of where the card goes */}
          <div className="hidden flex-col border-r border-border bg-[var(--cad-band)] p-6 sm:flex">
            <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">Preview</p>
            <div className="flex flex-1 flex-col justify-center py-6">
              {isLaunch ? <LaunchPreview card={card} /> : <RailPreview rail={rail} card={card} />}
            </div>
            <ul className="space-y-2">
              {facts.map((f) => (
                <li key={f} className="flex items-center gap-2 text-[12.5px] text-[var(--cad-desc)]">
                  <Check className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Right: pick, fill in, pay */}
          <form onSubmit={submit} className="p-6 sm:p-7">
            <DialogTitle className="pr-6 text-[22px] font-normal leading-tight">Advertise on Claude AI Directory</DialogTitle>
            <DialogDescription className="mt-1.5 text-[13px] leading-relaxed text-[var(--cad-desc)]">
              A community of builders, founders and marketers building with Claude.
            </DialogDescription>
            <div className="mt-5 flex items-baseline gap-1.5">
              <span className="text-[28px] font-light leading-none text-foreground">${price}</span>
              <span className="text-[13px] text-muted-foreground">/ month · {isLaunch ? "launches list" : "one category"}</span>
            </div>

            {!isLaunch && (
              <fieldset className="mt-6">
                <legend className="text-[12px] text-muted-foreground">Category</legend>
                <div role="radiogroup" className="mt-2 flex flex-wrap gap-1.5">
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
                        className={`inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-[13px] transition-colors disabled:opacity-40 ${
                          active
                            ? "border-foreground bg-foreground text-background"
                            : "border-border text-foreground/80 hover:border-foreground/40 hover:text-foreground"
                        }`}
                      >
                        {c.label}
                        {/* Real availability only: no invented scarcity. */}
                        {(soldOut || c.openSlots === 1) && <span className="text-[10px] opacity-70">{soldOut ? "Full" : "1 left"}</span>}
                      </button>
                    );
                  })}
                </div>
                {selected && selected.neighbors.length > 0 && (
                  <p className="mt-2 text-[12px] text-muted-foreground">Next to {selected.neighbors.join(" and ")}</p>
                )}
              </fieldset>
            )}

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
              <label className="block">
                <span className="mb-1 block text-[12px] text-muted-foreground">Email</span>
                <input type="email" value={emailValue} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" className={inputClass} />
              </label>
            </div>

            {/* Mobile has no preview column, so show the card here. */}
            <div className="mt-4 sm:hidden">
              <YourCard card={card} row />
            </div>

            <button
              type="submit"
              disabled={!ready || paying}
              className="mt-6 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              {paying ? "Opening checkout..." : canPay ? `Continue to payment · $${price}/mo` : "Request this slot"}
              {!paying && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
            </button>
            <p className="mt-3 text-center text-[11.5px] text-muted-foreground">
              {canPay ? "Secure checkout with Stripe | Cancel anytime" : `We confirm your slot and start date by email. Questions? ${SPONSOR_EMAIL}`}
            </p>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
