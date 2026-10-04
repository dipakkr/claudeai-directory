import { isLive, type ConnectorGuide } from "@/lib/connector-guides";
import obsidian from "./obsidian";

export const connectorGuides: ConnectorGuide[] = [obsidian];

/** Drafts render in development (marked, noindex) so they can be reviewed before publishing. */
const visible = (g: ConnectorGuide) => isLive(g) || process.env.NODE_ENV !== "production";

export const liveGuides = () => connectorGuides.filter(isLive);
export const findGuide = (slug: string) => connectorGuides.find((g) => g.slug === slug && visible(g));
