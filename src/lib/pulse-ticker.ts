export interface PulseEvent {
  type: "joined" | "launched" | "posted" | "upvoted" | "installed" | "viewed" | "browsing" | "copied";
  who: string;
  /** City and country shown for an anonymous visitor. */
  place?: { city: string | null; country: string | null } | null;
  what: string | null;
  href: string;
  at: string;
}

type DemoEvent = Omit<PulseEvent, "at"> & {
  source: "demo";
  /** Illustrative age, separate from real event timestamps. */
  ageSeconds: number;
};

export type PulseTickerEvent = (PulseEvent & { source: "real" }) | DemoEvent;

const PLACES = [
  ["Mumbai", "IN"], ["Bengaluru", "IN"], ["Delhi", "IN"], ["Hyderabad", "IN"],
  ["Pune", "IN"], ["Chennai", "IN"], ["London", "GB"], ["Manchester", "GB"],
  ["Edinburgh", "GB"], ["New York", "US"], ["San Francisco", "US"], ["Austin", "US"],
  ["Seattle", "US"], ["Boston", "US"], ["Chicago", "US"], ["Toronto", "CA"],
  ["Vancouver", "CA"], ["Montreal", "CA"], ["Sydney", "AU"], ["Melbourne", "AU"],
  ["Brisbane", "AU"], ["Singapore", "SG"], ["Berlin", "DE"], ["Munich", "DE"],
  ["Paris", "FR"], ["Lyon", "FR"], ["Amsterdam", "NL"], ["Madrid", "ES"],
  ["Barcelona", "ES"], ["Lisbon", "PT"], ["Dublin", "IE"], ["Stockholm", "SE"],
  ["Copenhagen", "DK"], ["Helsinki", "FI"], ["Tokyo", "JP"], ["Osaka", "JP"],
  ["Seoul", "KR"], ["Taipei", "TW"], ["São Paulo", "BR"], ["Mexico City", "MX"],
] as const;

const SECTIONS = [
  { what: "Claude Skills", href: "/skills" },
  { what: "MCP servers", href: "/mcp" },
  { what: "Claude Agents", href: "/agents" },
  { what: "Claude plugins", href: "/plugins" },
];

// 160 fictional examples reserved for previews, not used by the public ticker.
// They never enter analytics, member records, launches, or install counts.
export const DEMO_PULSE_EVENTS: readonly DemoEvent[] = PLACES.flatMap(([city, country], placeIndex) =>
  SECTIONS.map((section, sectionIndex) => {
    const index = placeIndex * SECTIONS.length + sectionIndex;
    return {
      source: "demo" as const,
      type: "browsing" as const,
      who: "Someone",
      place: { city, country },
      ...section,
      ageSeconds: 50 + ((index * 47) % 240),
    };
  }),
);

/** One real event for every two demo rows; real events retain their timestamps. */
export function pulseTickerEvent(events: PulseEvent[], tick: number): PulseTickerEvent {
  if (events.length && tick % 3 === 0) {
    return { ...events[Math.floor(tick / 3) % events.length], source: "real" };
  }
  const demoIndex = events.length ? tick - Math.floor(tick / 3) - 1 : tick;
  // A coprime stride visits the whole pool with varied cities and sections.
  return DEMO_PULSE_EVENTS[(demoIndex * 73) % DEMO_PULSE_EVENTS.length];
}

export function pulseEventAge(event: PulseTickerEvent, now: number): string {
  const seconds = event.source === "demo"
    ? event.ageSeconds
    : Math.max(0, Math.floor((now - Date.parse(event.at)) / 1000));
  if (!Number.isFinite(seconds)) return "";
  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}sec ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
