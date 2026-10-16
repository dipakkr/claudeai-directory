"use client";
/* eslint-disable @next/next/no-img-element -- sponsor creative URLs */

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Plus } from "lucide-react";
import { sideAdPlacements, type SideAdPlacement } from "@/data/sideAdPlacements";
import { openAdvertiseDialog } from "@/lib/advertise";
import { track } from "@/lib/analytics";

type SponsorPlacement = SideAdPlacement & { logo_url?: string; banner_url?: string };
type PaidPlacement = { position: number; product: string; website: string; tagline: string; logo_url?: string; banner_url?: string };
const placements = [sideAdPlacements[0], sideAdPlacements[4]];
const cardColors = ["bg-amber-50 dark:bg-amber-950/40", "bg-pink-50 dark:bg-pink-950/40", "bg-slate-100 dark:bg-slate-800/60", "bg-indigo-50 dark:bg-indigo-950/40"];
const excluded = ["/dashboard", "/submit", "/launches/submit", "/login", "/signup"];

function SponsorCard({ placement, position = 1 }: { placement: SponsorPlacement; position?: number }) {
  return (
    <a href={placement.href} target="_blank" rel="sponsored noopener noreferrer"
      onClick={() => track("ad_clicked", { adId: placement.id, sponsor: placement.name, category: placement.category, position })}
      className={`sponsor-card group flex min-h-[152px] flex-1 flex-col items-center justify-center gap-2 rounded-[6px] border border-foreground/10 px-3 py-4 text-center transition-[filter] hover:brightness-105 focus-visible:outline-2 focus-visible:outline-primary ${cardColors[(position - 1) % cardColors.length]}`}>
      <span className="sponsor-logo flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg">
        <img src={placement.logo_url || `https://www.google.com/s2/favicons?domain=${placement.logoDomain}&sz=64`} width={28} height={28} alt="" />
      </span>
      <span className="sponsor-title line-clamp-1 w-full text-[13px] font-semibold leading-tight text-foreground">{placement.name.replace(/ MCP$/, "")}</span>
      <span className="sponsor-description line-clamp-2 max-w-[23ch] break-words text-[11px] leading-relaxed text-muted-foreground">{placement.headline}</span>
    </a>
  );
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

/** Two featured placements and eight available sponsor slots. */
export default function SponsorRails({ inline = false }: { inline?: boolean }) {
  const pathname = usePathname();
  const [step, setStep] = useState(0);
  const { data } = useQuery({
    queryKey: ["sponsors", "placements"],
    queryFn: () => api.get<{ items: PaidPlacement[] }>("/sponsors/placements"),
    refetchInterval: 30_000,
  });
  const cards: (SponsorPlacement | undefined)[] = Array.from({ length: 10 });
  cards[0] = placements[0]; cards[5] = placements[1];
  for (const paid of data?.items ?? []) {
    if (paid.position < 0 || paid.position > 9) continue;
    cards[paid.position] = { ...placements[0], id: `paid-${paid.position}`, name: paid.product,
      href: paid.website, headline: paid.tagline, logoDomain: new URL(paid.website).hostname,
      logo_url: paid.logo_url, category: "sidebar" };
  }
  const enabled = !excluded.some(path => pathname === path || pathname.startsWith(`${path}/`));
  useEffect(() => {
    if (!enabled || inline) return;
    document.body.classList.add("sponsor-rails-active");
    return () => document.body.classList.remove("sponsor-rails-active");
  }, [enabled, inline]);
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

  const mobileCards = cards.filter((card): card is SponsorPlacement => !!card);
  if (inline) return (
    <aside aria-label="Sponsor placement" className="my-4 min-[1280px]:hidden">
      <p className="mb-2 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Sponsored</p>
      <SponsorCard placement={mobileCards[step % mobileCards.length]} />
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
              {card ? <SponsorCard placement={card} position={index + 1} /> : <OpenSlot />}
            </div>;
          })}
          </div>
        </div>
      </aside>
    ))}
  </>;
}
