import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Handshake,
  Layers,
  Mail,
  Megaphone,
  Route,
  ShieldCheck,
  Target,
  Users,
} from "lucide-react";

import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";

const TITLE = "Partner with ClaudeAI Directory";
const DESCRIPTION =
  "Partner with ClaudeAI Directory to reach Claude builders, launch MCP products, promote Claude apps, and connect with companies looking for Claude implementation help.";

const partnerHref =
  "mailto:axivionlabs@gmail.com?subject=Partner%20with%20ClaudeAI%20Directory&body=I%27d%20like%20to%20discuss%20a%20ClaudeAI%20Directory%20partnership.%0A%0ACompany%3A%0AWebsite%3A%0APartner%20type%3A%20MCP%20%2F%20Claude%20app%20%2F%20Consulting%20%2F%20Other%0ATarget%20customer%3A%0AWhat%20you%20want%20to%20promote%3A%0ABudget%20or%20preferred%20model%3A";

const partnerTracks = [
  {
    name: "MCP Distribution Partner",
    price: "$1,500/mo",
    description: "For MCP, connector, API and agent infrastructure companies that want Claude builder adoption.",
    bestFor: "Firecrawl-style MCPs, integration platforms, observability, security, browser automation, developer tools.",
    features: [
      "Category placement across side rails and relevant pages",
      "Setup guide or workflow inclusion",
      "Showcase or MCP profile improvements",
      "Monthly click and placement report",
    ],
  },
  {
    name: "Claude App Launch Partner",
    price: "$749+",
    description: "For Powered-by-Claude products, agent apps and workflow tools launching into the Claude ecosystem.",
    bestFor: "Claude apps, AI SaaS, MCP-enabled products, plugin-style workflows and early launches.",
    features: [
      "Launch profile in the app showcase",
      "Feedback request routed into community",
      "Newsletter or launch mention",
      "Founder-friendly package for first campaigns",
    ],
    featured: true,
  },
  {
    name: "Claude Expert Partner",
    price: "$1,500/mo or referral",
    description: "For consultants, agencies and implementation teams that want Claude adoption or enterprise leads.",
    bestFor: "Claude Code consultants, MCP developers, AI trainers, security/governance specialists and implementation partners.",
    features: [
      "Expert profile and category placement",
      "Partner-intent CTA on workflow pages",
      "Lead qualification handoff by use case",
      "Optional referral or featured-profile model",
    ],
  },
];

const leadSignals = [
  "Official MCP or connector launch",
  "New Claude app or agent product",
  "Claude implementation service",
  "Claude Code training or migration offer",
  "Security, governance or observability tooling",
  "Workflow stack that fits sales, marketing, engineering or operations",
];

const roadmap = [
  {
    title: "Discovery",
    body: "Directory and search pages help Claude users find tools, skills, apps and workflows.",
  },
  {
    title: "Workflow context",
    body: "Partner products are placed where they solve a concrete job, not only inside generic listings.",
  },
  {
    title: "Conversion",
    body: "Launch, sponsor, expert and workflow CTAs route visitors into the right partner motion.",
  },
  {
    title: "Reporting",
    body: "Early partners get placement and click reporting now; deeper intent analytics can be added as volume grows.",
  },
];

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/partners" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/partners" },
  twitter: { title: TITLE, description: DESCRIPTION },
};

export default function PartnersPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <section className="border-b border-border">
          <div className="mx-auto grid max-w-[1180px] gap-10 px-4 py-16 md:px-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:py-20">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
                <Handshake className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                Claude ecosystem partnerships
              </div>
              <h1 className="mt-6 text-balance text-4xl font-semibold tracking-tight text-foreground md:text-6xl">
                Turn Claude discovery into launches, leads and partner revenue.
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
                ClaudeAI Directory is moving beyond passive listings. The partner program packages discovery, workflow
                placement, launch pages and expert lead paths for companies building around Claude.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href={partnerHref}
                  className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
                >
                  Discuss partnership
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </a>
                <Link
                  href="/?advertise=1"
                  className="inline-flex h-11 items-center justify-center rounded-lg border border-border bg-background px-5 text-sm font-semibold text-foreground transition hover:bg-muted"
                >
                  View sponsor packages
                </Link>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
              <p className="text-sm font-semibold text-foreground">Best-fit partners</p>
              <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                {[
                  "MCP and connector companies that need Claude adoption",
                  "Claude-powered SaaS teams launching to builders",
                  "Consultants and agencies implementing Claude for companies",
                  "Developer infrastructure teams selling into agent builders",
                ].map((item) => (
                  <div key={item} className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1180px] px-4 py-14 md:px-8">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                icon: Target,
                label: "Sell adoption",
                text: "MCP and app partners can be shown in the context of setup guides, workflows and category pages.",
              },
              {
                icon: Users,
                label: "Sell qualified help",
                text: "Claude experts can be matched to implementation, migration, training and governance intent.",
              },
              {
                icon: Layers,
                label: "Sell systems",
                text: "Digital products can graduate from prompts into workflow stacks, skills, agents and templates.",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="rounded-lg border border-border bg-card p-5">
                  <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                  <h2 className="mt-4 text-base font-semibold text-foreground">{item.label}</h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.text}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="border-y border-border bg-muted/25">
          <div className="mx-auto max-w-[1180px] px-4 py-14 md:px-8">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">Partnership tracks</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                These tracks separate ordinary ads from higher-value partner motions: adoption, launches and qualified services.
              </p>
            </div>
            <div className="mt-8 grid gap-4 lg:grid-cols-3">
              {partnerTracks.map((track) => (
                <div
                  key={track.name}
                  className={`rounded-lg border p-5 ${
                    track.featured ? "border-primary bg-card shadow-[0_18px_60px_rgba(0,0,0,0.08)]" : "border-border bg-card"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{track.name}</h3>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{track.description}</p>
                    </div>
                    {track.featured ? (
                      <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                        Fastest test
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-5 text-2xl font-semibold text-foreground">{track.price}</div>
                  <p className="mt-3 rounded-lg border border-border bg-background p-3 text-xs leading-5 text-muted-foreground">
                    {track.bestFor}
                  </p>
                  <div className="mt-5 space-y-2.5">
                    {track.features.map((feature) => (
                      <div key={feature} className="flex gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1180px] px-4 py-14 md:px-8">
          <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">Signals we want to partner around</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                The strongest partnerships happen when a company already has Claude intent, launch momentum, or a clear
                implementation offer.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {leadSignals.map((signal) => (
                <div key={signal} className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
                  <BadgeCheck className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  <span className="text-sm font-medium text-foreground">{signal}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-border bg-card/35">
          <div className="mx-auto max-w-[1180px] px-4 py-14 md:px-8">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">How the partner engine should work</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                The goal is not to sell a logo slot forever. The goal is to route Claude intent into the right partner
                surface and prove what happened.
              </p>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-4">
              {roadmap.map((step, index) => (
                <div key={step.title} className="rounded-lg border border-border bg-background p-5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {index + 1}
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-foreground">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1180px] px-4 py-14 md:px-8">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                icon: Route,
                title: "Next page family",
                body: "Workflow pages should connect integrations to concrete jobs: sales research, SEO audits, support, engineering and operations.",
              },
              {
                icon: ShieldCheck,
                title: "Trust standard",
                body: "Partner pages should show tested status, compatibility, install path, security notes and update date when available.",
              },
              {
                icon: Megaphone,
                title: "Outbound motion",
                body: "Prospects should be scored by MCP launches, Claude app launches, GSC demand, partner intent and category fit.",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-lg border border-border bg-card p-5">
                  <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                  <h2 className="mt-4 text-base font-semibold text-foreground">{item.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.body}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mx-auto max-w-[1180px] px-4 pb-16 md:px-8">
          <div className="rounded-lg border border-border bg-foreground p-6 text-background md:flex md:items-center md:justify-between md:gap-8">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Want to be a founding partner?</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-background/75">
                Send the company, product or service, ideal customer, and preferred model. We will reply with the best
                partner track and the fastest test campaign.
              </p>
            </div>
            <a
              href={partnerHref}
              className="mt-6 inline-flex h-11 shrink-0 items-center justify-center rounded-lg bg-background px-5 text-sm font-semibold text-foreground transition hover:opacity-90 md:mt-0"
            >
              <Mail className="mr-2 h-4 w-4" aria-hidden="true" />
              Start partner conversation
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
