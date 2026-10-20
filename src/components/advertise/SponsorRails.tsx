"use client";
/* eslint-disable @next/next/no-img-element -- sponsor creative URLs */

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Plus } from "lucide-react";
import { openAdvertiseDialog } from "@/lib/advertise";
import { track } from "@/lib/analytics";
import { useSponsorTracking } from "@/hooks/useSponsorTracking";
import type { SponsorPlacements } from "@/lib/sponsors";

type SponsorPlacement = { id: string; name: string; href: string; headline: string; logoDomain: string; logo_url?: string };
const cardColors = ["bg-amber-50 dark:bg-amber-950/40", "bg-pink-50 dark:bg-pink-950/40", "bg-slate-100 dark:bg-slate-800/60", "bg-indigo-50 dark:bg-indigo-950/40"];
const excluded = ["/dashboard", "/submit", "/launches/submit", "/login", "/signup"];

function SponsorCard({ placement, position, surface }: { placement: SponsorPlacement; position: number; surface: "desktop" | "mobile" }) {
  const tracking = useSponsorTracking(placement.id, position, surface);
  return (
    <a {...tracking} data-sponsor-slot={position + 1} href={placement.href} target="_blank" rel="sponsored noopener noreferrer"
      className={`sponsor-card group flex min-h-[152px] flex-1 flex-col items-center justify-center gap-2 rounded-[6px] border border-foreground/10 px-3 py-4 text-center transition-[filter] hover:brightness-105 focus-visible:outline-2 focus-visible:outline-primary ${cardColors[position % cardColors.length]}`}>
      <span className="sponsor-logo flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg">
        <img src={placement.logo_url || `https://www.google.com/s2/favicons?domain=${placement.logoDomain}&sz=64`} width={28} height={28} alt="" />
      </span>
      <span className="sponsor-title line-clamp-1 w-full text-[13px] font-semibold leading-tight text-foreground">{placement.name.replace(/ MCP$/, "")}</span>
      <span className="sponsor-description line-clamp-2 max-w-[23ch] break-words text-[11px] leading-relaxed text-muted-foreground">{placement.headline}</span>
    </a>
  );
}

function LoadingSlot() {
  return <div aria-label="Loading sponsor placement" className="min-h-[152px] flex-1 rounded-[6px] border border-foreground/10 bg-foreground/[0.025]" />;
}

function OpenSlot() {
  return (
    <button type="button" onClick={() => {
      track("ad_slot_clicked", { slot: "sidebar", category: "any" });
      openAdvertiseDialog();
    }}
      className="sponsor-card sponsor-open-slot group flex min-h-[152px] flex-1 flex-col items-center justify-center gap-2 rounded-[6px] border border-dashed border-foreground/15 bg-foreground/[0.025] px-3 py-3 text-center transition-colors hover:border-foreground/30 hover:bg-foreground/[0.06]">
      <Plus className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
      <span className="text-[12px] font-medium text-muted-foreground">Available spot</span>
      <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">$40 / week <ArrowUpRight className="h-3 w-3" aria-hidden="true" /></span>
    </button>
  );
}

/** Server-seeded campaigns render immediately; background refresh keeps them current. */
export default function SponsorRails({ inline = false }: { inline?: boolean }) {
  const pathname = usePathname();
  const [step, setStep] = useState(0);
  const { data } = useQuery({
    queryKey: ["sponsors", "placements"],
    queryFn: () => api.get<SponsorPlacements>("/sponsors/placements"),
    refetchInterval: 30_000,
  });
  const cards: (SponsorPlacement | undefined)[] = Array.from({ length: 10 });
  for (const paid of data?.items ?? []) {
    if (!paid.campaign_id || !Number.isInteger(paid.position) || paid.position < 0 || paid.position > 9) continue;
    let logoDomain: string;
    try {
      const url = new URL(paid.website);
      if (url.protocol !== "https:" && url.protocol !== "http:") continue;
      logoDomain = url.hostname;
    } catch { continue; }
    cards[paid.position] = { id: paid.campaign_id, name: paid.product,
      href: paid.website, headline: paid.tagline, logoDomain,
      logo_url: paid.logo_url };
  }
  const enabled = !excluded.some(path => pathname === path || pathname.startsWith(`${path}/`));
  useEffect(() => {
    if (!enabled || !inline) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const timer = window.setInterval(() => {
      if (!motion.matches && !document.hidden) {
        setStep(value => (value + 1) % 10);
      }
    }, 12000);
    return () => window.clearInterval(timer);
  }, [enabled, inline]);
  if (!enabled) return null;

  const mobileCards = cards.flatMap((card, position) => card ? [{ card, position }] : []);
  const mobile = mobileCards[step % mobileCards.length];
  if (inline) return (
    <aside aria-label="Sponsor placement" className="my-4 min-[1280px]:hidden">
      <p className="mb-2 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Sponsored</p>
      {mobile ? <SponsorCard placement={mobile.card} position={mobile.position} surface="mobile" /> : data ? <OpenSlot /> : <LoadingSlot />}
    </aside>
  );

  return <>
    {(["left", "right"] as const).map(side => (
      <aside key={side} aria-label={`${side} sponsor rail`}
        className={`sponsor-rail sponsor-${side}`}>
        <div className="sponsor-rail-content">
          <div className="shrink-0 px-1 pb-1 pt-1 text-center">
            <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">Sponsored</p>
          </div>
          <div className="sponsor-rail-slots">
          {Array.from({ length: 5 }, (_, index) => {
            const position = (side === "left" ? 0 : 5) + index;
            const card = cards[position];
            return <div key={`${index}-${position}`} className="flex min-h-0">
              {card ? <SponsorCard placement={card} position={position} surface="desktop" /> : data ? <OpenSlot /> : <LoadingSlot />}
            </div>;
          })}
          </div>
        </div>
      </aside>
    ))}
  </>;
}
