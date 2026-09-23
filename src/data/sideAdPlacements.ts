import { withUtmParams } from "@/lib/tracking";

export type SideAdPlacement = {
  id: string;
  eyebrow: string;
  name: string;
  headline: string;
  description: string;
  href: string;
  logoDomain: string;
  cta: string;
  initial: string;
  label: "MCP Server" | "Reference" | "Available Slot";
  slotType?: "anchor" | "available";
  tone: {
    panel: string;
    icon: string;
    badge: string;
  };
};

export type SideAdRail = {
  title: string;
  placements: SideAdPlacement[];
};

export type SideAdCollection = {
  id: string;
  left: SideAdRail;
  right: SideAdRail;
};

export const sideAdSponsorHref = "/advertise";
const SIDE_RAIL_SLOT_COUNT = 5;

function trackedSideAdHref(id: string, href: string): string {
  return withUtmParams(href, {
    medium: "side_rail",
    campaign: "mcp_sponsor_inventory",
    content: id,
  });
}

export const sideAdPlacements: SideAdPlacement[] = [
  {
    id: "firecrawl-mcp",
    eyebrow: "Web data",
    name: "Firecrawl MCP",
    headline: "Turn websites into Claude-ready data.",
    description: "Web research placement for Claude users collecting pages, docs and product data.",
    href: trackedSideAdHref("firecrawl-mcp", "https://www.firecrawl.dev"),
    logoDomain: "firecrawl.dev",
    cta: "Open",
    initial: "F",
    label: "MCP Server",
    tone: {
      panel: "bg-[#1f2f22] text-white border-[#3f6b47]",
      icon: "bg-[#a8f0b8] text-[#0c2111]",
      badge: "bg-white/10 text-green-100",
    },
  },
  {
    id: "exa-mcp",
    eyebrow: "AI search",
    name: "Exa MCP",
    headline: "Search the web for AI workflows.",
    description: "AI search placement for Claude research and answer workflows.",
    href: trackedSideAdHref("exa-mcp", "https://exa.ai"),
    logoDomain: "exa.ai",
    cta: "Open",
    initial: "E",
    label: "MCP Server",
    tone: {
      panel: "bg-[#251f3c] text-white border-[#4f4275]",
      icon: "bg-[#cab8ff] text-[#161028]",
      badge: "bg-white/10 text-violet-100",
    },
  },
  {
    id: "browserbase-mcp",
    eyebrow: "Browser",
    name: "Browserbase MCP",
    headline: "Run browser automation from Claude.",
    description: "Browser automation placement for Claude agents using hosted browsing.",
    href: trackedSideAdHref("browserbase-mcp", "https://www.browserbase.com/mcp"),
    logoDomain: "browserbase.com",
    cta: "Open",
    initial: "B",
    label: "MCP Server",
    tone: {
      panel: "bg-[#172d3d] text-white border-[#335f7d]",
      icon: "bg-[#91d9ff] text-[#061825]",
      badge: "bg-white/10 text-sky-100",
    },
  },
  {
    id: "composio-mcp",
    eyebrow: "Integrations",
    name: "Composio MCP",
    headline: "Connect Claude to apps and actions.",
    description: "Integration placement for teams routing Claude into SaaS tools.",
    href: trackedSideAdHref("composio-mcp", "https://composio.dev/claude"),
    logoDomain: "composio.dev",
    cta: "Open",
    initial: "C",
    label: "MCP Server",
    tone: {
      panel: "bg-[#2a2440] text-white border-[#54487a]",
      icon: "bg-[#d4c5ff] text-[#171029]",
      badge: "bg-white/10 text-purple-100",
    },
  },
  {
    id: "pipedream-mcp",
    eyebrow: "Automation",
    name: "Pipedream MCP",
    headline: "Connect APIs and workflows.",
    description: "Integration placement for builders connecting Claude to thousands of APIs.",
    href: trackedSideAdHref("pipedream-mcp", "https://pipedream.com"),
    logoDomain: "pipedream.com",
    cta: "Open",
    initial: "P",
    label: "MCP Server",
    tone: {
      panel: "bg-[#132b38] text-white border-[#2f5d73]",
      icon: "bg-[#9ee4ff] text-[#071923]",
      badge: "bg-white/10 text-cyan-100",
    },
  },
  {
    id: "stackone-mcp",
    eyebrow: "Enterprise",
    name: "StackOne MCP",
    headline: "Unify enterprise app integrations.",
    description: "Enterprise integration placement for Claude teams connecting business systems.",
    href: trackedSideAdHref("stackone-mcp", "https://www.stackone.com"),
    logoDomain: "stackone.com",
    cta: "Open",
    initial: "S",
    label: "MCP Server",
    tone: {
      panel: "bg-[#1e2f3e] text-white border-[#3f6380]",
      icon: "bg-[#acd9ff] text-[#081a28]",
      badge: "bg-white/10 text-blue-100",
    },
  },
  {
    id: "arcade-mcp",
    eyebrow: "Security",
    name: "Arcade MCP",
    headline: "Auth and governance for agents.",
    description: "Security placement for teams deploying Claude actions safely.",
    href: trackedSideAdHref("arcade-mcp", "https://www.arcade.dev"),
    logoDomain: "arcade.dev",
    cta: "Open",
    initial: "A",
    label: "MCP Server",
    tone: {
      panel: "bg-[#351d2b] text-white border-[#693954]",
      icon: "bg-[#ffabc9] text-[#250b19]",
      badge: "bg-white/10 text-pink-100",
    },
  },
  {
    id: "runlayer-mcp",
    eyebrow: "Security",
    name: "Runlayer MCP",
    headline: "Secure enterprise Claude access.",
    description: "Enterprise security placement for Claude and MCP deployments.",
    href: trackedSideAdHref("runlayer-mcp", "https://www.runlayer.com"),
    logoDomain: "runlayer.com",
    cta: "Open",
    initial: "R",
    label: "MCP Server",
    tone: {
      panel: "bg-[#332119] text-white border-[#674332]",
      icon: "bg-[#ffbf8c] text-[#281205]",
      badge: "bg-white/10 text-orange-100",
    },
  },
  {
    id: "stainless-mcp",
    eyebrow: "MCP builder",
    name: "Stainless MCP",
    headline: "Generate agent-ready API tooling.",
    description: "Developer placement for API teams building MCP and agent experiences.",
    href: trackedSideAdHref("stainless-mcp", "https://www.stainless.com"),
    logoDomain: "stainless.com",
    cta: "Open",
    initial: "S",
    label: "MCP Server",
    tone: {
      panel: "bg-[#23262f] text-white border-[#4a5060]",
      icon: "bg-[#d2d8e8] text-[#11151d]",
      badge: "bg-white/10 text-slate-100",
    },
  },
  {
    id: "e2b-mcp",
    eyebrow: "Runtime",
    name: "E2B MCP",
    headline: "Run code and agents in sandboxes.",
    description: "Agent runtime placement for Claude Code and sandboxed execution workflows.",
    href: trackedSideAdHref("e2b-mcp", "https://e2b.dev"),
    logoDomain: "e2b.dev",
    cta: "Open",
    initial: "E",
    label: "MCP Server",
    tone: {
      panel: "bg-[#173329] text-white border-[#326852]",
      icon: "bg-[#97f0ca] text-[#062018]",
      badge: "bg-white/10 text-emerald-100",
    },
  },
  {
    id: "langfuse-mcp",
    eyebrow: "Observability",
    name: "Langfuse MCP",
    headline: "Trace and monitor agent behavior.",
    description: "Observability placement for Claude agent evaluation and tracing.",
    href: trackedSideAdHref("langfuse-mcp", "https://langfuse.com"),
    logoDomain: "langfuse.com",
    cta: "Open",
    initial: "L",
    label: "MCP Server",
    tone: {
      panel: "bg-[#26233a] text-white border-[#514a72]",
      icon: "bg-[#c8bdff] text-[#141026]",
      badge: "bg-white/10 text-indigo-100",
    },
  },
  {
    id: "agentops-mcp",
    eyebrow: "Agent ops",
    name: "AgentOps MCP",
    headline: "Observe and debug AI agents.",
    description: "Agent observability placement for builders shipping Claude workflows.",
    href: trackedSideAdHref("agentops-mcp", "https://www.agentops.ai"),
    logoDomain: "agentops.ai",
    cta: "Open",
    initial: "A",
    label: "MCP Server",
    tone: {
      panel: "bg-[#2d2038] text-white border-[#5d4273]",
      icon: "bg-[#e3b5ff] text-[#21102d]",
      badge: "bg-white/10 text-fuchsia-100",
    },
  },
  {
    id: "make-mcp",
    eyebrow: "Automation",
    name: "Make MCP",
    headline: "Run Make scenarios from Claude.",
    description: "Automation placement for operators comparing Claude-native workflow tools.",
    href: "/mcp/make",
    logoDomain: "make.com",
    cta: "Open",
    initial: "M",
    label: "MCP Server",
    tone: {
      panel: "bg-[#192f2a] text-white border-[#2f5f55]",
      icon: "bg-[#9df0d1] text-[#0e211d]",
      badge: "bg-white/10 text-emerald-100",
    },
  },
  {
    id: "clickup-mcp",
    eyebrow: "Project ops",
    name: "ClickUp MCP",
    headline: "Manage tasks, docs and projects.",
    description: "Project management discovery slot for Claude teams.",
    href: "/mcp/clickup",
    logoDomain: "clickup.com",
    cta: "View",
    initial: "C",
    label: "MCP Server",
    tone: {
      panel: "bg-[#241f3f] text-white border-[#494071]",
      icon: "bg-[#b9a7ff] text-[#17112e]",
      badge: "bg-white/10 text-violet-100",
    },
  },
  {
    id: "supabase-mcp",
    eyebrow: "Database",
    name: "Supabase MCP",
    headline: "Manage database and auth context.",
    description: "Developer tooling placement for app builders using Claude Code.",
    href: "/mcp/supabase",
    logoDomain: "supabase.com",
    cta: "Setup",
    initial: "S",
    label: "MCP Server",
    tone: {
      panel: "bg-[#123127] text-white border-[#2d6855]",
      icon: "bg-[#7ee7ba] text-[#082019]",
      badge: "bg-white/10 text-green-100",
    },
  },
  {
    id: "cloudflare-mcp",
    eyebrow: "Infra + deploy",
    name: "Cloudflare MCP",
    headline: "Operate Workers and platform tools.",
    description: "Infrastructure placement for Claude Code deployment workflows.",
    href: "/mcp/cloudflare",
    logoDomain: "cloudflare.com",
    cta: "View",
    initial: "C",
    label: "MCP Server",
    tone: {
      panel: "bg-[#3a2115] text-white border-[#68412c]",
      icon: "bg-[#ffb86b] text-[#2c160d]",
      badge: "bg-white/10 text-orange-100",
    },
  },
  {
    id: "stripe-mcp",
    eyebrow: "Payments",
    name: "Stripe MCP",
    headline: "Explore payment data with Claude.",
    description: "Finance and billing placement for founders and operators.",
    href: "/mcp/stripe",
    logoDomain: "stripe.com",
    cta: "Open",
    initial: "S",
    label: "MCP Server",
    tone: {
      panel: "bg-[#16263f] text-white border-[#31537d]",
      icon: "bg-[#8cc4ff] text-[#091629]",
      badge: "bg-white/10 text-blue-100",
    },
  },
  {
    id: "linear-mcp",
    eyebrow: "Engineering",
    name: "Linear MCP",
    headline: "Manage issues and team workflows.",
    description: "Engineering workflow placement for product teams using Claude.",
    href: "/mcp/linear",
    logoDomain: "linear.app",
    cta: "View",
    initial: "L",
    label: "MCP Server",
    tone: {
      panel: "bg-zinc-950 text-white border-zinc-800 dark:bg-zinc-900",
      icon: "bg-white text-zinc-950",
      badge: "bg-white/10 text-zinc-200",
    },
  },
  {
    id: "sentry-mcp",
    eyebrow: "Observability",
    name: "Sentry MCP",
    headline: "Search and debug errors faster.",
    description: "Debugging placement for teams bringing incident context into Claude.",
    href: "/mcp/sentry",
    logoDomain: "sentry.io",
    cta: "Open",
    initial: "S",
    label: "MCP Server",
    tone: {
      panel: "bg-[#311b37] text-white border-[#62396c]",
      icon: "bg-[#f3b6ff] text-[#27112f]",
      badge: "bg-white/10 text-fuchsia-100",
    },
  },
  {
    id: "canva-mcp",
    eyebrow: "Design",
    name: "Canva MCP",
    headline: "Search, create and export designs.",
    description: "Creative tooling placement for marketers using Claude.",
    href: "/mcp/canva",
    logoDomain: "canva.com",
    cta: "View",
    initial: "C",
    label: "MCP Server",
    tone: {
      panel: "bg-[#132e42] text-white border-[#2e6084]",
      icon: "bg-[#8ee7ff] text-[#061927]",
      badge: "bg-white/10 text-cyan-100",
    },
  },
  {
    id: "webflow-mcp",
    eyebrow: "Websites",
    name: "Webflow MCP",
    headline: "Manage sites, CMS and assets.",
    description: "Website builder placement for Claude-assisted publishing.",
    href: "/mcp/webflow",
    logoDomain: "webflow.com",
    cta: "Open",
    initial: "W",
    label: "MCP Server",
    tone: {
      panel: "bg-[#14234a] text-white border-[#2f4b90]",
      icon: "bg-[#85a7ff] text-[#071538]",
      badge: "bg-white/10 text-indigo-100",
    },
  },
  {
    id: "figma-mcp",
    eyebrow: "Design handoff",
    name: "Figma MCP",
    headline: "Use design context inside Claude.",
    description: "Product design placement for teams turning Figma into implementation.",
    href: "/mcp/figma",
    logoDomain: "figma.com",
    cta: "Explore",
    initial: "F",
    label: "MCP Server",
    tone: {
      panel: "bg-[#1f2d48] text-white border-[#365073]",
      icon: "bg-[#7dd3fc] text-[#0f172a]",
      badge: "bg-white/10 text-sky-100",
    },
  },
  {
    id: "ahrefs-mcp",
    eyebrow: "SEO data",
    name: "Ahrefs MCP",
    headline: "Search analytics and SEO context.",
    description: "Marketing placement for teams researching search visibility with Claude.",
    href: "/mcp/ahrefs",
    logoDomain: "ahrefs.com",
    cta: "View",
    initial: "A",
    label: "MCP Server",
    tone: {
      panel: "bg-[#2c2417] text-white border-[#5c4a2a]",
      icon: "bg-[#ffd36e] text-[#211706]",
      badge: "bg-white/10 text-yellow-100",
    },
  },
  {
    id: "close-mcp",
    eyebrow: "Sales CRM",
    name: "Close MCP",
    headline: "Access sales data and CRM actions.",
    description: "Sales workflow placement for teams connecting Claude to pipeline data.",
    href: "/mcp/close",
    logoDomain: "close.com",
    cta: "Open",
    initial: "C",
    label: "MCP Server",
    tone: {
      panel: "bg-[#351c1e] text-white border-[#6b383d]",
      icon: "bg-[#ff9aa2] text-[#260b0e]",
      badge: "bg-white/10 text-rose-100",
    },
  },
  {
    id: "ticket-tailor-mcp",
    eyebrow: "Events",
    name: "Ticket Tailor MCP",
    headline: "Manage tickets, orders and events.",
    description: "Event operations placement for teams using Claude to inspect ticketing data.",
    href: "/mcp/ticket-tailor",
    logoDomain: "tickettailor.com",
    cta: "View",
    initial: "T",
    label: "MCP Server",
    tone: {
      panel: "bg-[#18303b] text-white border-[#315e72]",
      icon: "bg-[#8ee8ff] text-[#071c24]",
      badge: "bg-white/10 text-cyan-100",
    },
  },
  {
    id: "paypal-mcp",
    eyebrow: "Payments",
    name: "PayPal MCP",
    headline: "Access payments platform context.",
    description: "Commerce placement for finance and support workflows around transactions.",
    href: "/mcp/paypal",
    logoDomain: "paypal.com",
    cta: "Open",
    initial: "P",
    label: "MCP Server",
    tone: {
      panel: "bg-[#172a4a] text-white border-[#30528b]",
      icon: "bg-[#8cb8ff] text-[#06142b]",
      badge: "bg-white/10 text-blue-100",
    },
  },
  {
    id: "bitly-mcp",
    eyebrow: "Links",
    name: "Bitly MCP",
    headline: "Shorten links and track performance.",
    description: "Growth placement for marketers routing Claude into campaign links.",
    href: "/mcp/bitly",
    logoDomain: "bitly.com",
    cta: "View",
    initial: "B",
    label: "MCP Server",
    tone: {
      panel: "bg-[#2f1f38] text-white border-[#62416f]",
      icon: "bg-[#e6b0ff] text-[#250d31]",
      badge: "bg-white/10 text-purple-100",
    },
  },
  {
    id: "klaviyo-mcp",
    eyebrow: "Lifecycle",
    name: "Klaviyo MCP",
    headline: "Report and create with marketing data.",
    description: "Lifecycle marketing placement for email and commerce teams.",
    href: "/mcp/klaviyo",
    logoDomain: "klaviyo.com",
    cta: "Open",
    initial: "K",
    label: "MCP Server",
    tone: {
      panel: "bg-[#1e3324] text-white border-[#3e694a]",
      icon: "bg-[#a4efb4] text-[#0d2513]",
      badge: "bg-white/10 text-lime-100",
    },
  },
  {
    id: "egnyte-mcp",
    eyebrow: "Files",
    name: "Egnyte MCP",
    headline: "Access and analyze business content.",
    description: "Content operations placement for teams connecting Claude to secure files.",
    href: "/mcp/egnyte",
    logoDomain: "egnyte.com",
    cta: "View",
    initial: "E",
    label: "MCP Server",
    tone: {
      panel: "bg-[#202d39] text-white border-[#435d74]",
      icon: "bg-[#aacfea] text-[#0b1a25]",
      badge: "bg-white/10 text-slate-100",
    },
  },
  {
    id: "box-mcp",
    eyebrow: "Content cloud",
    name: "Box MCP",
    headline: "Search and inspect Box content.",
    description: "Enterprise content placement for knowledge and document workflows.",
    href: "/mcp/box",
    logoDomain: "box.com",
    cta: "Open",
    initial: "B",
    label: "MCP Server",
    tone: {
      panel: "bg-[#142b45] text-white border-[#2e5a86]",
      icon: "bg-[#82c3ff] text-[#061a2f]",
      badge: "bg-white/10 text-sky-100",
    },
  },
  {
    id: "ramp-mcp",
    eyebrow: "Finance ops",
    name: "Ramp MCP",
    headline: "Analyze company spend data.",
    description: "Finance operations placement for founders and controllers using Claude.",
    href: "/mcp/ramp",
    logoDomain: "ramp.com",
    cta: "View",
    initial: "R",
    label: "MCP Server",
    tone: {
      panel: "bg-[#15342d] text-white border-[#2f6a5c]",
      icon: "bg-[#8bf5d9] text-[#06241d]",
      badge: "bg-white/10 text-teal-100",
    },
  },
  {
    id: "atlassian-mcp",
    eyebrow: "Jira + docs",
    name: "Atlassian MCP",
    headline: "Access Jira and Confluence context.",
    description: "Team knowledge placement for product, engineering and support workflows.",
    href: "/mcp/atlassian",
    logoDomain: "atlassian.com",
    cta: "Open",
    initial: "A",
    label: "MCP Server",
    tone: {
      panel: "bg-[#17264d] text-white border-[#314d93]",
      icon: "bg-[#8faeff] text-[#071642]",
      badge: "bg-white/10 text-indigo-100",
    },
  },
];

const placementById = new Map(sideAdPlacements.map((placement) => [placement.id, placement]));

const availableSlotTone = {
  panel: "border-dotted border-white/30 bg-transparent text-white/62 shadow-none hover:border-white/50 hover:bg-white/[0.03]",
  icon: "bg-transparent text-white/82 border border-dotted border-white/46",
  badge: "border border-dotted border-white/30 bg-transparent text-white/62",
};

function availableSlot(category: string, index: number): SideAdPlacement {
  return {
    id: `available-${category.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${index}`,
    eyebrow: "Open sponsor slot",
    name: "Add your MCP",
    headline: "Sponsored MCP slot available.",
    description: `Available MCP sponsor placement for ${category}.`,
    href: sideAdSponsorHref,
    logoDomain: "",
    cta: "Advertise",
    initial: "+",
    label: "Available Slot",
    slotType: "available",
    tone: availableSlotTone,
  };
}

function pickPlacements(ids: string[]): SideAdPlacement[] {
  return ids.map((id) => {
    const placement = placementById.get(id);

    if (!placement) {
      throw new Error(`Missing side ad placement: ${id}`);
    }

    return placement;
  });
}

function categoryRail(title: string, anchorIds: string[]): SideAdRail {
  const anchors = pickPlacements(anchorIds.slice(0, 2)).map((placement) => ({ ...placement, slotType: "anchor" as const }));

  return {
    title,
    placements: [
      ...anchors,
      ...Array.from({ length: Math.max(0, SIDE_RAIL_SLOT_COUNT - anchors.length) }, (_, index) =>
        availableSlot(title, index + 1),
      ),
    ],
  };
}

export const sideAdCollections: SideAdCollection[] = [
  {
    id: "web-research-and-integrations",
    left: categoryRail("MCPs for web research", ["firecrawl-mcp", "exa-mcp"]),
    right: categoryRail("MCPs for integrations", ["composio-mcp", "pipedream-mcp"]),
  },
  {
    id: "security-and-developers",
    left: categoryRail("MCPs for security", ["arcade-mcp", "runlayer-mcp"]),
    right: categoryRail("MCPs for developers", ["stainless-mcp", "e2b-mcp"]),
  },
  {
    id: "sales-and-marketing",
    left: categoryRail("MCPs for sales", ["close-mcp", "stripe-mcp"]),
    right: categoryRail("MCPs for marketing", ["ahrefs-mcp", "klaviyo-mcp"]),
  },
  {
    id: "ops-and-product",
    left: categoryRail("MCPs for operations", ["make-mcp", "ramp-mcp"]),
    right: categoryRail("MCPs for product teams", ["linear-mcp", "atlassian-mcp"]),
  },
];
