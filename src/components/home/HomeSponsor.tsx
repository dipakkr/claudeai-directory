"use client";

import { useState, useSyncExternalStore } from "react";
import { ArrowUpRight, Mail, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { type SponsorCampaign, type SponsorPlacements } from "@/lib/sponsors";
import { useSponsorTracking } from "@/hooks/useSponsorTracking";
import { SponsorReach } from "@/components/advertise/SponsorReach";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import styles from "./home-sponsor.module.css";

const SPONSOR_SLOTS = 10;

const enquiry = "mailto:hello@claudeai.directory?subject=Homepage%20featured%20sponsorship&body=Hi%2C%20I%27m%20interested%20in%20the%20homepage%20featured%20sponsor%20placement.%0A%0AProduct%3A%20%0AWebsite%3A%20%0APreferred%20dates%3A%20";

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
  const [open, setOpen] = useState(false);
  const { data, dataUpdatedAt } = useQuery({ queryKey: ["sponsors", "placements"], queryFn: () => api.get<SponsorPlacements>("/sponsors/placements"), refetchInterval: 30_000 });
  const campaigns = (data?.items ?? []).filter((item, index, items) =>
    item.campaign_id !== "pipedream-mcp" && (!item.ends_at || Date.parse(/[zZ]|[+-]\d{2}:?\d{2}$/.test(item.ends_at) ? item.ends_at : `${item.ends_at}Z`) > dataUpdatedAt) && item.campaign_id && Number.isInteger(item.position) && item.position >= 0 && item.position < 10 && /^https?:\/\//i.test(item.website)
    && !/^https?:\/\/(?:www\.)?tooljunction\.io(?:[/?#]|$)/i.test(item.website)
    && items.findIndex(other => other.campaign_id === item.campaign_id) === index
  ).slice(0, SPONSOR_SLOTS - 1);

  return <section id="home-sponsor" className={styles.section} aria-labelledby="home-sponsor-heading">
    <div className={styles.heading}>
      <h2 id="home-sponsor-heading">Featured sponsors</h2>
      <button type="button" onClick={() => setOpen(true)}>Sponsor a spot <ArrowUpRight size={12} aria-hidden="true" /></button>
    </div>
    <div className={styles.partnerGrid}>
      <a href="https://tooljunction.io/" target="_blank" rel="nofollow sponsored noopener noreferrer" className={styles.partner} title="ToolJunction: Discover AI tools, startup credits and perks">
        {/* eslint-disable-next-line @next/next/no-img-element -- small local sponsor wordmark */}
        <img src="/brands/tooljunction-logo.png" width={820} height={177} alt="ToolJunction" className={styles.brandLogo} />
        <span className={styles.tagline}>Discover AI tools, startup credits & perks.</span>
      </a>
      {campaigns.map(item => <FeaturedSponsor key={item.campaign_id} campaign={item} />)}
      {Array.from({ length: SPONSOR_SLOTS - 1 - campaigns.length }, (_, index) => (
        <button key={`open-${index}`} type="button" className={`${styles.partner} ${styles.openSpot}`} onClick={() => setOpen(true)} aria-label={`Enquire about sponsor slot ${campaigns.length + index + 2}`}>
          <Plus size={19} strokeWidth={1.3} aria-hidden="true" />
          <span>Your brand here</span>
        </button>
      ))}
    </div>
    <p className={styles.sponsorFooter}>
      <span>Claude AI Directory is supported by these incredible partners and sponsors.</span>
      <button type="button" onClick={() => setOpen(true)}>Advertise with us <ArrowUpRight size={12} aria-hidden="true" /></button>
    </p>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[90vh] overflow-y-auto p-0 sm:max-w-[760px]">
        <div className={styles.enquiry}>
          <aside><SponsorReach /></aside>
          <div className={styles.enquiryBody}>
            <p className={styles.eyebrow}>Homepage placement</p>
            <DialogTitle className="text-2xl font-medium">Be part of their next discovery.</DialogTitle>
            <DialogDescription className="mt-3 text-sm leading-7">Put your product in the featured sponsor grid directly below the homepage introduction, where visitors discover Claude apps and resources.</DialogDescription>
            <ul><li>Your product name and a short benefit</li><li>A direct link to learn more</li><li>A clearly labelled featured sponsor placement</li></ul>
            <p className={styles.note}>Contact us for available dates and pricing. The audience figures describe site traffic, not guaranteed ad impressions.</p>
            <a className={styles.contact} href={enquiry}><Mail size={15} aria-hidden="true" />Enquire about this spot</a>
            <p className={styles.email}>hello@claudeai.directory</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  </section>;
}
