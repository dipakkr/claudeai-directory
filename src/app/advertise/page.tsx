import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Eye,
  LayoutDashboard,
  Megaphone,
  MousePointerClick,
  Search,
  ShieldCheck,
  Target,
  Users,
} from "lucide-react";

import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import { sideAdCollections } from "@/data/sideAdPlacements";

const TITLE = "Advertise on ClaudeAI Directory";
const DESCRIPTION =
  "Reach Claude users and builders discovering Skills, MCP servers, Agents and workflow tools.";

const contactHref =
  "mailto:axivionlabs@gmail.com?subject=Sponsor%20ClaudeAI%20Directory&body=I%27d%20like%20to%20sponsor%20ClaudeAI%20Directory.%0A%0ACompany%3A%0AWebsite%3A%0ATarget%20category%3A%0ABudget%20range%3A%0ACampaign%20goal%3A";

const rails = sideAdCollections.flatMap((collection) => [collection.left, collection.right]);
const totalVisibleSlots = rails.reduce((sum, rail) => sum + rail.placements.length, 0);
const openSlots = rails.reduce(
  (sum, rail) => sum + rail.placements.filter((placement) => placement.slotType === "available").length,
  0,
);
const anchorSlots = totalVisibleSlots - openSlots;

const audience = [
  {
    label: "Claude Code users",
    text: "People looking for installable Skills, MCP servers and Agents they can use inside Claude workflows.",
    icon: Search,
  },
  {
    label: "AI builders",
    text: "Founders, developer-tool teams and solo builders launching resources into the Claude ecosystem.",
    icon: Users,
  },
  {
    label: "MCP buyers",
    text: "Operators comparing connected data, automation and integration options before adopting a server.",
    icon: Target,
  },
  {
    label: "DevRel teams",
    text: "API, infrastructure and workflow companies trying to reach high-intent Claude builders.",
    icon: Megaphone,
  },
];

const packages = [
  {
    name: "Launch Slot",
    price: "$750",
    cadence: "30 days",
    description: "Best for a new MCP, API, agent or Claude workflow launch.",
    features: [
      "One category side-rail sponsor slot",
      "Launch profile review",
      "Tracked outbound sponsor link",
      "End-of-campaign click summary",
    ],
  },
  {
    name: "Category Partner",
    price: "$1,500",
    cadence: "per month",
    description: "Own one high-intent category while the Claude audience grows.",
    features: [
      "Three sponsor slots in one category",
      "Homepage and directory rail rotation",
      "Newsletter mention when available",
      "Monthly placement and click report",
    ],
    featured: true,
  },
  {
    name: "Ecosystem Partner",
    price: "$2,500",
    cadence: "per month",
    description: "For teams that want repeated visibility across Claude discovery surfaces.",
    features: [
      "Multiple category placements",
      "Showcase or resource launch support",
      "Priority category selection",
      "Campaign learnings and next-placement plan",
    ],
  },
];

const reporting = [
  { label: "UTM-tagged outbound links", icon: MousePointerClick },
  { label: "Placement dates and surfaces", icon: LayoutDashboard },
  { label: "Click summary after the campaign", icon: BarChart3 },
  { label: "No fake endorsements or inflated traffic claims", icon: ShieldCheck },
];

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/advertise" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/advertise" },
  twitter: { title: TITLE, description: DESCRIPTION },
};

export default function AdvertisePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <section className="advertise-hero-surface border-b border-white/10">
          <div className="mx-auto max-w-[1180px] px-4 py-16 md:px-8 lg:py-20">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-3 py-1 text-xs font-medium text-white/72">
                  <Megaphone className="h-3.5 w-3.5" aria-hidden="true" />
                  Advertise on ClaudeAI Directory
                </div>
                <h1 className="mt-6 max-w-[12ch] text-balance text-5xl font-semibold tracking-tight text-white md:text-6xl">
                  Reach people building with Claude.
                </h1>
                <p className="mt-5 max-w-2xl text-lg leading-8 text-white/70">
                  Sponsor the directory surfaces where Claude users discover
                  Skills, MCP servers, Agents and launch profiles. Founding
                  sponsor slots are packaged around category intent, not generic
                  banner impressions.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <a
                    href={contactHref}
                    className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
                  >
                    Ask about sponsorship
                    <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                  </a>
                  <Link
                    href="/mcp"
                    className="inline-flex h-11 items-center justify-center rounded-md border border-white/15 bg-white/8 px-5 text-sm font-semibold text-white transition hover:bg-white/12"
                  >
                    View live inventory
                  </Link>
                </div>
              </div>

              <div className="rounded-lg border border-white/12 bg-[#10100e]/90 p-5 shadow-[0_24px_90px_rgba(0,0,0,0.28)]">
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/52">
                  Founding inventory
                </p>
                <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                  {[
                    [String(rails.length), "categories"],
                    [String(totalVisibleSlots), "visible placements"],
                    [String(openSlots), "open sponsor slots"],
                  ].map(([value, label]) => (
                    <div key={label} className="rounded-md border border-white/10 bg-white/7 px-3 py-4">
                      <div className="text-2xl font-semibold text-white">{value}</div>
                      <div className="mt-1 text-xs leading-4 text-white/55">{label}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-5 rounded-md border border-white/10 bg-black/20 p-4">
                  <p className="text-sm font-semibold text-white">How the rail works</p>
                  <div className="mt-3 space-y-2.5 text-sm leading-6 text-white/66">
                    <div className="flex gap-2">
                      <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                      <span>Each category rail has two neutral reference cards and three bookable sponsor slots.</span>
                    </div>
                    <div className="flex gap-2">
                      <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                      <span>Placements rotate on large desktop discovery pages and link with UTM tracking.</span>
                    </div>
                    <div className="flex gap-2">
                      <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                      <span>{anchorSlots} reference anchors keep the ad product contextual instead of random.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1180px] px-4 py-14 md:px-8">
          <div className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                Who you reach
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
                A niche audience with Claude intent.
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                The ad product is early, so the page does not claim mature
                traffic numbers. The value is category-specific distribution to
                people already browsing Claude resources.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {audience.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="rounded-lg border border-border bg-card p-5">
                    <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                    <h3 className="mt-4 text-base font-semibold text-foreground">{item.label}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="border-y border-border bg-muted/25">
          <div className="mx-auto max-w-[1180px] px-4 py-14 md:px-8">
            <div className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  Sponsor surfaces
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
                  Category rails buyers can understand.
                </h2>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  Inspired by simple directory media kits, but packaged around
                  Claude-specific jobs: research, integrations, security,
                  developer workflows, sales and marketing.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {rails.map((rail) => {
                  const open = rail.placements.filter((placement) => placement.slotType === "available").length;
                  const anchors = rail.placements.length - open;
                  return (
                    <div key={rail.title} className="rounded-lg border border-border bg-card px-4 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-sm font-semibold text-foreground">{rail.title}</h3>
                          <p className="mt-1 text-xs text-muted-foreground">{anchors} reference anchors · {open} open slots</p>
                        </div>
                        <span className="rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground">
                          5 cards
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1180px] px-4 py-14 md:px-8">
          <div className="max-w-2xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              Founding packages
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">Start with one campaign.</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Pricing is intentionally simple while inventory is young. We can
              refine placements after the first reporting cycle.
            </p>
          </div>
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {packages.map((pkg) => (
              <div
                key={pkg.name}
                className={`rounded-lg border p-5 ${
                  pkg.featured ? "border-primary bg-card shadow-[0_18px_60px_rgba(0,0,0,0.08)]" : "border-border bg-card"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{pkg.name}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{pkg.description}</p>
                  </div>
                  {pkg.featured ? (
                    <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">Best fit</span>
                  ) : null}
                </div>
                <div className="mt-5 flex items-end gap-2">
                  <span className="text-3xl font-semibold text-foreground">{pkg.price}</span>
                  <span className="pb-1 text-sm text-muted-foreground">{pkg.cadence}</span>
                </div>
                <div className="mt-5 space-y-2.5">
                  {pkg.features.map((feature) => (
                    <div key={feature} className="flex gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="border-y border-border bg-card/35">
          <div className="mx-auto grid max-w-[1180px] gap-8 px-4 py-14 md:px-8 lg:grid-cols-[320px_minmax(0,1fr)]">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                Reporting
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
                Enough tracking to learn quickly.
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                We start with practical campaign reporting instead of promising
                an enterprise ad dashboard before demand proves it.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {reporting.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex items-center gap-3 rounded-lg border border-border bg-background p-4">
                    <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                    <span className="text-sm font-medium text-foreground">{item.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1180px] px-4 py-14 md:px-8">
          <div className="rounded-lg border border-border bg-foreground p-6 text-background md:flex md:items-center md:justify-between md:gap-8">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-background/15 px-2.5 py-1 text-xs text-background/70">
                <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                Founding sponsor slots are open
              </div>
              <h2 className="mt-4 text-2xl font-semibold tracking-tight">Want a category before it fills?</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-background/75">
                Send your company, product URL, preferred category and campaign
                goal. We will reply with fit, available placement and the next
                start date.
              </p>
            </div>
            <a
              href={contactHref}
              className="mt-6 inline-flex h-11 shrink-0 items-center justify-center rounded-md bg-background px-5 text-sm font-semibold text-foreground transition hover:opacity-90 md:mt-0"
            >
              Contact sponsorship
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
