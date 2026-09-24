import { sideAdCollections } from "@/data/sideAdPlacements";

/** Monthly price for one sidebar sponsor slot, in USD. */
export const SPONSOR_MONTHLY_PRICE = 499;

/**
 * Hosted checkout for the sponsor subscription: a Stripe Payment Link
 * (https://buy.stripe.com/...) or a Lemon Squeezy checkout URL. Until it is
 * set, "Pay now" falls back to a prefilled email request.
 */
export const SPONSOR_CHECKOUT_URL = process.env.NEXT_PUBLIC_SPONSOR_CHECKOUT_URL || "";

export const SPONSOR_EMAIL = "axivionlabs@gmail.com";

export interface SponsorCategory {
  title: string;
  label: string;
  openSlots: number;
  /** Current sponsors in this rail, shown as "Next to ...". */
  neighbors: string[];
}

export const SPONSOR_CATEGORIES: SponsorCategory[] = sideAdCollections
  .flatMap((collection) => [collection.left, collection.right])
  .map((rail) => ({
    title: rail.title,
    label: rail.title.replace(/^MCPs for /, "").replace(/^\w/, (c) => c.toUpperCase()),
    openSlots: rail.placements.filter((placement) => placement.slotType === "available").length,
    neighbors: rail.placements.filter((placement) => placement.slotType !== "available").map((placement) => placement.name),
  }));

export const OPEN_ADVERTISE_EVENT = "cad:open-advertise";

/** Open the sponsor dialog from anywhere, optionally with a category picked. */
export function openAdvertiseDialog(category?: string) {
  window.dispatchEvent(new CustomEvent(OPEN_ADVERTISE_EVENT, { detail: { category } }));
}
