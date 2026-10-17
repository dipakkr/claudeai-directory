"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { DOMAIN_RATING } from "@/lib/domain-rating";
import type { ShowcaseProject } from "@/types";

export function LinkUpgradeDialog({ app, triggerLabel = "Get a do-follow link", triggerClassName }: {
  app: Pick<ShowcaseProject, "id" | "title">;
  triggerLabel?: string;
  triggerClassName?: string;
}) {
  const { viewOnly } = useAuth();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const config = useQuery({
    queryKey: ["launch-upgrade", "config"],
    queryFn: () => api.get<{ enabled: boolean; amount: number; currency: string }>("/sponsors/launch-upgrade/config"),
    enabled: open,
    staleTime: 60_000,
    retry: false,
  });
  async function checkout() {
    if (viewOnly || busy) return;
    setBusy(true);
    setError("");
    try {
      const result = await api.post<{ url: string }>(`/sponsors/launch-upgrade/${encodeURIComponent(app.id)}/checkout`);
      const url = new URL(result.url);
      if (url.protocol !== "https:" || url.hostname !== "checkout.stripe.com") throw new Error("Invalid checkout URL");
      window.location.assign(url.href);
    } catch (cause) {
      const detail = cause instanceof ApiError ? (cause.data as { detail?: string })?.detail : null;
      setError(typeof detail === "string" ? detail : "Could not open checkout. Please try again.");
      setBusy(false);
    }
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <button onClick={() => setOpen(true)} className={triggerClassName ?? "inline-flex shrink-0 items-center gap-1 text-[13px] font-medium text-primary hover:underline"}>
        {triggerLabel} <ArrowRight className="h-3.5 w-3.5" />
      </button>
      <DialogContent className="w-[calc(100%-2rem)] max-w-[440px] max-h-[90dvh] overflow-y-auto gap-0 rounded-[8px] p-0 sm:rounded-[8px]">
        <div className="p-5 sm:p-6">
          <DialogHeader className="space-y-2 text-left">
            <DialogTitle className="font-sans text-2xl font-medium leading-tight">Get a do-follow link</DialogTitle>
            <DialogDescription className="text-sm leading-6">A dofollow website link for <span className="font-medium text-foreground">{app.title}</span>, without adding our badge.</DialogDescription>
          </DialogHeader>
          <div className="mt-4 rounded-[6px] border border-primary/25 bg-primary/[0.05] p-3">
            <div className="flex items-center gap-3">
              <svg viewBox="0 0 44 44" className="h-12 w-12 shrink-0 -rotate-90" aria-hidden="true">
                <circle cx="22" cy="22" r="17" fill="none" stroke="currentColor" strokeWidth="6" className="text-border" />
                <circle cx="22" cy="22" r="17" fill="none" stroke="currentColor" strokeWidth="6" pathLength="100" strokeDasharray={`${DOMAIN_RATING} ${100 - DOMAIN_RATING}`} className="text-primary" />
              </svg>
              <div>
                <p className="text-xs text-muted-foreground">ClaudeAI Directory · Ahrefs Domain Rating</p>
                <p className="mt-1 text-3xl font-semibold tabular-nums">{DOMAIN_RATING}<span className="ml-1 text-sm font-normal text-muted-foreground">/ 100</span></p>
              </div>
            </div>
          </div>
          <div className="my-4 flex items-baseline gap-2">
            <span className="text-4xl font-semibold tracking-tight">$39</span>
            <span className="text-sm text-muted-foreground">USD · one-time</span>
          </div>
          <ul className="space-y-2 text-sm">
            {["Dofollow link on your launch page", "No badge required on your website", "No subscription or recurring charge"].map((line) => (
              <li key={line} className="flex items-start gap-2.5"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{line}</li>
            ))}
          </ul>
          <p className="mt-3 text-xs leading-5 text-muted-foreground">Activates after payment is confirmed. Search rankings and traffic are not guaranteed.</p>
          {viewOnly && <p className="mt-4 rounded-[4px] border border-border p-3 text-xs text-muted-foreground">Checkout is disabled while viewing another member’s account.</p>}
          {error && <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}
          {!viewOnly && (config.isError || (config.data && !config.data.enabled)) && <p role="alert" className="mt-4 text-sm text-muted-foreground">Checkout is temporarily unavailable. Please try again later.</p>}
          <button disabled={viewOnly || busy || !config.data?.enabled} onClick={checkout} className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-[6px] bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50">
            {busy ? <><Loader2 className="h-4 w-4 animate-spin" />Opening checkout...</> : <>Continue to payment · $39 <ArrowRight className="h-4 w-4" /></>}
          </button>
          <p className="mt-3 text-center text-xs text-muted-foreground">Secure checkout with Stripe</p>
        </div>
        <div className="border-t border-border px-5 py-3 text-center text-xs text-muted-foreground">
          Prefer the free option? <Link href={`/launches/submit?finish=${encodeURIComponent(app.id)}`} className="text-foreground underline underline-offset-4">Add our badge</Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}
