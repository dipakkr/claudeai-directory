"use client";
/* eslint-disable @next/next/no-img-element -- sponsor-supplied logo URLs */

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight } from "lucide-react";
import { api } from "@/lib/api";
import { useSponsorTracking } from "@/hooks/useSponsorTracking";
import type { SponsorCampaign, SponsorPlacements } from "@/lib/sponsors";

const house: SponsorCampaign = {
  campaign_id: "tooljunction-house", position: -1, product: "ToolJunction",
  website: "https://tooljunction.io/", tagline: "Discover AI tools, startup credits & perks.",
  logo_url: "/brands/tooljunction-logo.png",
};

function Card({ sponsor, tracking = {} }: { sponsor: SponsorCampaign; tracking?: Partial<ReturnType<typeof useSponsorTracking>> }) {
  const isHouse = sponsor.campaign_id === house.campaign_id;
  const logo = sponsor.logo_url || `https://www.google.com/s2/favicons?domain=${new URL(sponsor.website).hostname}&sz=128`;
  return (
    <a {...tracking} href={sponsor.website} target="_blank" rel="nofollow sponsored noopener noreferrer"
      data-launch-sponsor={sponsor.campaign_id}
      className="group flex min-h-[238px] flex-col items-start gap-4 rounded-xl border border-border bg-card/30 p-5 transition-colors hover:bg-card focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
      <span className="rounded border border-border px-1.5 py-1 text-[9px] uppercase tracking-wider text-muted-foreground">Sponsored</span>
      {isHouse ? <img src={logo} width={820} height={177} alt="ToolJunction" className="h-auto w-full max-w-[200px]" /> : (
        <span className="flex items-center gap-3">
          <img src={logo} width={40} height={40} alt="" className="h-10 w-10 rounded-lg object-contain" />
          <span className="break-words text-lg font-semibold">{sponsor.product}</span>
        </span>
      )}
      <span className="text-[13px] leading-6 text-muted-foreground">{sponsor.tagline}</span>
      <span className="mt-auto flex w-full items-center justify-between border-t border-border pt-4 text-[11px]">Explore {sponsor.product}<ArrowUpRight size={14} aria-hidden="true" /></span>
    </a>
  );
}

function PaidCard({ sponsor }: { sponsor: SponsorCampaign }) {
  const tracking = useSponsorTracking(sponsor.campaign_id, sponsor.position, "desktop");
  return <Card sponsor={sponsor} tracking={tracking} />;
}

/** Equal probability per route visit; never reshuffle on ordinary component rerenders. */
export default function LaunchSponsor() {
  const pathname = usePathname();
  const { data, isFetched } = useQuery({
    queryKey: ["sponsors", "placements"],
    queryFn: () => api.get<SponsorPlacements>("/sponsors/placements"),
    staleTime: 60_000,
  });
  const [selection, setSelection] = useState<{ path: string; sponsor: SponsorCampaign } | null>(null);
  useEffect(() => {
    if (!data && !isFetched) return;
    const frame = requestAnimationFrame(() => {
      const unique = new Map<string, SponsorCampaign>();
      for (const sponsor of data?.items ?? []) {
        if (sponsor.campaign_id === "pipedream-mcp") continue;
        if (sponsor.ends_at && Date.parse(sponsor.ends_at.endsWith("Z") ? sponsor.ends_at : `${sponsor.ends_at}Z`) <= Date.now()) continue;
        try {
          const url = new URL(sponsor.website);
          if (!["http:", "https:"].includes(url.protocol) || url.hostname.replace(/^www\./, "") === "tooljunction.io") continue;
        } catch { continue; }
        unique.set(sponsor.campaign_id, sponsor);
      }
      const pool = [house, ...unique.values()];
      setSelection(previous => previous?.path === pathname ? previous : { path: pathname, sponsor: pool[Math.floor(Math.random() * pool.length)] });
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname, data, isFetched]);
  if (!selection || selection.path !== pathname) return <div aria-label="Loading sponsor" className="min-h-[238px] rounded-xl border border-border bg-card/30" />;
  return selection.sponsor.campaign_id === house.campaign_id
    ? <Card sponsor={selection.sponsor} />
    : <PaidCard key={`${pathname}:${selection.sponsor.campaign_id}`} sponsor={selection.sponsor} />;
}
