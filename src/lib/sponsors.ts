export interface SponsorCampaign {
  campaign_id: string;
  position: number;
  product: string;
  website: string;
  tagline: string;
  logo_url?: string;
  ends_at?: string | null;
}

export interface SponsorPlacements {
  items: SponsorCampaign[];
  available: number;
  total: number;
}
