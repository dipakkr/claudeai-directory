import { sideAdCollections } from "@/data/sideAdPlacements";

/** One seven-day sidebar placement, in USD. */
export const SPONSOR_WEEKLY_PRICE = 40;

/** "sidebar": a card in one category rail. "launch": the row in the launches list. */
export type SponsorSlot = "sidebar" | "launch";

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
export function openAdvertiseDialog(category?: string, slot: SponsorSlot = "sidebar") {
  window.dispatchEvent(new CustomEvent(OPEN_ADVERTISE_EVENT, { detail: { category, slot } }));
}
