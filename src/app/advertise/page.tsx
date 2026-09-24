import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Mail, PanelRight, Rocket, Send } from "lucide-react";

import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import { sideAdCollections } from "@/data/sideAdPlacements";

const TITLE = "Advertise on Claude AI Directory";
const DESCRIPTION =
  "Put your product in front of people choosing Skills, MCP servers and Agents for Claude. Simple sponsor slots, clear pricing.";

const EMAIL = "axivionlabs@gmail.com";
const contactHref = `mailto:${EMAIL}?subject=${encodeURIComponent("Sponsor Claude AI Directory")}&body=${encodeURIComponent(
  "Hi,\n\nI'd like to sponsor Claude AI Directory.\n\nCompany:\nWebsite:\nPackage:\nPreferred category:\nStart date:\n",
)}`;

const categories = Array.from(
  new Set(sideAdCollections.flatMap((c) => [c.left.title, c.right.title]).map((t) => t.replace(/^MCPs for /, ""))),
);

const placements = [
  {
    icon: PanelRight,
    title: "Sidebar",
    body: "Your logo, name and one line in the sidebar on large screens, next to a category that matches your product.",
  },
  {
    icon: Rocket,
    title: "Launches list",
    body: "A sponsored row inside the launches list, where builders look for new tools to try.",
  },
  {
    icon: Send,
    title: "Newsletter",
    body: "A short mention in the weekly Claude digest, when a slot is available.",
  },
];

const packages = [
  {
    name: "Launch Slot",
    price: "$750",
    cadence: "for 30 days",
    points: ["One sidebar slot in your category", "Launch profile review", "Tracked link to your site", "Click summary at the end"],
  },
  {
    name: "Category Partner",
    price: "$1,500",
    cadence: "per month",
    points: ["Three sponsor slots in one category", "Rotation on the homepage and directory", "Newsletter mention when available", "Monthly placement and click report"],
    featured: true,
  },
  {
    name: "Ecosystem Partner",
    price: "$2,500",
    cadence: "per month",
    points: ["Slots across several categories", "Priority pick of categories", "Launch or resource support", "Campaign learnings and next steps"],
  },
];

const steps = [
  { title: "Email us", body: "Tell us your product, the package and a start date." },
  { title: "We confirm", body: "We reply with the category, the slot and the go-live date." },
  { title: "You go live", body: "Your placement runs and you get a click report at the end." },
];

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/advertise" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/advertise" },
  twitter: { title: TITLE, description: DESCRIPTION },
};

function ContactButton({ label = "Get in touch" }: { label?: string }) {
  return (
    <a
      href={contactHref}
      className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-foreground px-6 text-sm font-medium text-background transition-colors hover:bg-foreground/85"
    >
      {label}
      <ArrowRight className="h-4 w-4" aria-hidden="true" />
    </a>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-2xl font-semibold tracking-tight text-foreground">{children}</h2>;
}

export default function AdvertisePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-[880px] px-4 pb-20 md:px-8">
        {/* Intro */}
        <section className="pt-14 md:pt-20">
          <p className="text-sm font-medium text-primary">Advertise</p>
          <h1 className="mt-3 text-balance text-4xl font-semibold leading-tight tracking-tight text-foreground md:text-5xl">
            Reach people building with Claude
          </h1>
          <p className="mt-4 max-w-[60ch] text-lg leading-8 text-muted-foreground">
            Put your product in front of people choosing Skills, MCP servers and Agents for Claude. Pick a package, email
            us, and your placement goes live.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-4">
            <ContactButton />
            <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" aria-hidden="true" />
              {EMAIL}
            </span>
          </div>
        </section>

        {/* Where it shows */}
        <section className="mt-16 border-t border-border pt-12">
          <SectionTitle>Where your ad shows</SectionTitle>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {placements.map(({ icon: Icon, title, body }) => (
              <div key={title} className="rounded-2xl border border-border bg-card p-5">
                <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                <h3 className="mt-3 text-base font-semibold text-foreground">{title}</h3>
                <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
          <p className="mt-5 text-sm leading-6 text-muted-foreground">
            <span className="font-medium text-foreground">Categories:</span> {categories.join(", ")}.
          </p>
        </section>

        {/* Pricing */}
        <section className="mt-16 border-t border-border pt-12">
          <SectionTitle>Pricing</SectionTitle>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {packages.map((pkg) => (
              <div
                key={pkg.name}
                className={`flex flex-col rounded-2xl border bg-card p-5 ${pkg.featured ? "border-primary ring-1 ring-primary/30" : "border-border"}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-base font-semibold text-foreground">{pkg.name}</h3>
                  {pkg.featured && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">Best fit</span>
                  )}
                </div>
                <p className="mt-3">
                  <span className="text-3xl font-semibold text-foreground">{pkg.price}</span>
                  <span className="ml-1.5 text-sm text-muted-foreground">{pkg.cadence}</span>
                </p>
                <ul className="mt-4 space-y-2">
                  {pkg.points.map((point) => (
                    <li key={point} className="flex gap-2 text-sm text-muted-foreground">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="mt-16 border-t border-border pt-12">
          <SectionTitle>How it works</SectionTitle>
          <ol className="mt-6 grid gap-6 sm:grid-cols-3">
            {steps.map((step, index) => (
              <li key={step.title}>
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-sm font-semibold text-foreground">
                  {index + 1}
                </span>
                <h3 className="mt-3 text-base font-semibold text-foreground">{step.title}</h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{step.body}</p>
              </li>
            ))}
          </ol>
          <p className="mt-8 text-sm leading-6 text-muted-foreground">
            We share real click numbers only. No inflated traffic claims and no fake endorsements.
          </p>
        </section>

        {/* Final ask */}
        <section className="mt-16 flex flex-col items-start gap-5 rounded-2xl border border-border bg-card p-6 sm:flex-row sm:items-center sm:justify-between md:p-8">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Ready to book a slot?</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Email <span className="text-foreground">{EMAIL}</span> or see the{" "}
              <Link href="/launches" className="underline underline-offset-4 hover:text-foreground">
                launches page
              </Link>{" "}
              to preview a placement.
            </p>
          </div>
          <ContactButton label="Email us" />
        </section>
      </main>
      <Footer />
    </div>
  );
}
