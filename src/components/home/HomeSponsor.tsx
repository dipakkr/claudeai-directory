"use client";

import { useSyncExternalStore } from "react";
import { ArrowUpRight, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { type SponsorCampaign, type SponsorPlacements } from "@/lib/sponsors";
import { useSponsorTracking } from "@/hooks/useSponsorTracking";
import { openAdvertiseDialog } from "@/lib/advertise";
import styles from "./home-sponsor.module.css";

const SPONSOR_SLOTS = 10;


function subscribeViewport(onChange: () => void) {
  const query = window.matchMedia("(min-width: 1024px)");
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function sponsorLogo(campaign: SponsorCampaign) {
  if (campaign.logo_url && /^(https?:\/\/|\/(?!\/))/i.test(campaign.logo_url)) return campaign.logo_url;
  if (/^https?:\/\/(?:www\.)?contactzilla\.com(?:[/?#]|$)/i.test(campaign.website)) return "/brands/contactzilla-logo.svg";
  if (/^https?:\/\/(?:www\.)?invizipoll\.com(?:[/?#]|$)/i.test(campaign.website)) return "/brands/invizipoll-logo.svg";
  try { return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(new URL(campaign.website).hostname)}&sz=128`; }
  catch { return undefined; }
}

function FeaturedSponsor({ campaign }: { campaign: SponsorCampaign }) {
  const desktop = useSyncExternalStore(subscribeViewport, () => window.matchMedia("(min-width: 1024px)").matches, () => true);
  const tracking = useSponsorTracking(campaign.campaign_id, campaign.position, desktop ? "desktop" : "mobile");
  const logo = sponsorLogo(campaign);
  const wordmark = logo === "/brands/contactzilla-logo.svg";
  return <a {...tracking} href={campaign.website} target="_blank" rel="sponsored noopener noreferrer" className={styles.partner} title={`${campaign.product}: ${campaign.tagline}`}>
    <span className={styles.brandRow}>
      {/* eslint-disable-next-line @next/next/no-img-element -- sponsor brand assets, including official local SVGs */}
      {logo && <img src={logo} alt={wordmark ? campaign.product : ""} width={wordmark ? 221 : 32} height={32} className={wordmark ? styles.contactzillaLogo : styles.sponsorIcon} />}
      {!wordmark && <span className={styles.product}>{campaign.product}</span>}
    </span>
    <span className={styles.tagline}>{campaign.tagline}</span>
  </a>;
}

export default function HomeSponsor() {
  const { data, dataUpdatedAt } = useQuery({ queryKey: ["sponsors", "placements"], queryFn: () => api.get<SponsorPlacements>("/sponsors/placements"), refetchInterval: 30_000 });
  const campaigns = (data?.items ?? []).filter((item, index, items) =>
    item.campaign_id !== "pipedream-mcp" && (!item.ends_at || Date.parse(/[zZ]|[+-]\d{2}:?\d{2}$/.test(item.ends_at) ? item.ends_at : `${item.ends_at}Z`) > dataUpdatedAt) && item.campaign_id && Number.isInteger(item.position) && item.position >= 0 && item.position < 10 && /^https?:\/\//i.test(item.website)
    && !/^https?:\/\/(?:www\.)?tooljunction\.io(?:[/?#]|$)/i.test(item.website)
    && items.findIndex(other => other.campaign_id === item.campaign_id) === index
  ).slice(0, SPONSOR_SLOTS - 1);

  return <section id="home-sponsor" className={styles.section} aria-labelledby="home-sponsor-heading">
    <div className={styles.heading}>
      <h2 id="home-sponsor-heading">Featured sponsors</h2>
      <button type="button" onClick={() => openAdvertiseDialog()}>Sponsor a spot <ArrowUpRight size={12} aria-hidden="true" /></button>
    </div>
    <div className={styles.partnerGrid}>
      <a href="https://tooljunction.io/" target="_blank" rel="nofollow sponsored noopener noreferrer" className={styles.partner} title="ToolJunction: Discover AI tools, startup credits and perks">
        {/* eslint-disable-next-line @next/next/no-img-element -- small local sponsor wordmark */}
        <img src="/brands/tooljunction-logo.png" width={820} height={177} alt="ToolJunction" className={styles.brandLogo} />
        <span className={styles.tagline}>Discover AI tools, startup credits & perks.</span>
      </a>
      {campaigns.map(item => <FeaturedSponsor key={item.campaign_id} campaign={item} />)}
      {Array.from({ length: SPONSOR_SLOTS - 1 - campaigns.length }, (_, index) => (
        <button key={`open-${index}`} type="button" className={`${styles.partner} ${styles.openSpot}`} onClick={() => openAdvertiseDialog()} aria-label={`Book a sponsor placement from slot ${campaigns.length + index + 2}`}>
          <Plus size={19} strokeWidth={1.3} aria-hidden="true" />
          <span>Your brand here</span>
        </button>
      ))}
    </div>
    <p className={styles.sponsorFooter}>
      <span>Claude AI Directory is supported by these incredible partners and sponsors.</span>
      <button type="button" onClick={() => openAdvertiseDialog()}>Advertise with us <ArrowUpRight size={12} aria-hidden="true" /></button>
    </p>
  </section>;
}
