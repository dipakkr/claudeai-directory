import { isLive, type ConnectorGuide } from "@/lib/connector-guides";
import homeAssistant from "./home-assistant";
import obsidian from "./obsidian";
import wordpress from "./wordpress";

export const connectorGuides: ConnectorGuide[] = [obsidian, wordpress, homeAssistant];

/** Drafts render in development (marked, noindex) so they can be reviewed before publishing. */
const visible = (g: ConnectorGuide) => isLive(g) || process.env.NODE_ENV !== "production";

export const liveGuides = () => connectorGuides.filter(isLive);
export const findGuide = (slug: string) => connectorGuides.find((g) => g.slug === slug && visible(g));
