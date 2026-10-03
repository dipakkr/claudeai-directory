import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { BreadcrumbSchema, JsonLd } from "@/components/seo/JsonLd";
import { LaunchLogo } from "@/components/launches/LaunchListRow";
import type { ShowcaseProject } from "@/types";

/**
 * Server-rendered guide under the launch form: what launching is, what you get, what you can
 * launch, recent launches and an FAQ. It is the crawlable content of /launches/submit (the form
 * itself is interactive) and answers the questions people search before submitting.
 */

const SITE = "https://www.claudeai.directory";

const STEPS = [
  { title: "Paste your website", body: "We read the page and fill in the name, pitch, description, topics and a first comment. You review everything." },
  { title: "Complete the listing", body: "Add our small badge to your site or README for free, or pay $29 once to go live right away." },
  { title: "Go live and share", body: "Your launch page goes up, posts to the community feed and gets a share image built for X and LinkedIn." },
];

const GETS = [
  ["A launch page", "Upvotes, comments and your first comment as the maker, with a share image for social posts."],
  ["Placement where people browse", "Built with Claude on the homepage, the launches page and, for MCP servers, the MCP page."],
  ["A post on the community feed", "Your launch is shared on the feed with a link to your page when it goes live."],
  ["A dofollow backlink", "Every live launch links to your site with a followed link."],
  ["Launch analytics", "Impressions, page views and clicks to your website, day by day."],
] as const;

const KINDS = [
  { label: "Web apps", body: "Products built with Claude or the Claude API.", href: "/launches" },
  { label: "MCP servers", body: "Servers that connect Claude to tools and data.", href: "/mcp" },
  { label: "Skills", body: "Folders of instructions and scripts for Claude.", href: "/skills" },
  { label: "Agents", body: "Subagents for Claude Code.", href: "/agents" },
  { label: "Claude Code plugins", body: "Bundles of commands, agents and hooks.", href: "/plugins" },
  { label: "Workflows", body: "Repeatable setups that get a job done with Claude.", href: "/launches" },
];

export const LAUNCH_FAQ: { q: string; a: string }[] = [
  { q: "Is launching on Claude AI Directory free?", a: "Yes. Add our badge to your site or GitHub README and your launch goes live for free. If you would rather not add a badge, a one-time $29 listing puts it live right away." },
  { q: "Do I get a backlink?", a: "Yes. Every live launch links to your website with a dofollow link, whether it went live with the badge or the one-time listing." },
  { q: "How long does it take?", a: "About a minute. Paste your website, review what we filled in, then complete the listing. Badge launches go live as soon as we find the badge on your page." },
  { q: "What can I launch?", a: "Anything you built with or for Claude: web apps, MCP servers, Claude Skills, agents, Claude Code plugins and workflows." },
  { q: "Can I launch an MCP server?", a: "Yes. MCP launches appear in the MCP launches list on the homepage and in Launched by makers on the MCP servers page." },
  { q: "Can I edit my launch later?", a: "Yes. Everything except the website address can be changed from your dashboard, including the logo, screenshots, description and topics." },
];

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <h2 className="shrink-0 font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-foreground">{children}</h2>
      <span className="h-px flex-1 bg-border" aria-hidden />
    </div>
  );
}

export function LaunchGuide({ recent, liveCount }: { recent: ShowcaseProject[]; liveCount: number }) {
  return (
    <div className="mt-20 max-w-[760px] space-y-14">
      <BreadcrumbSchema
        items={[
          { name: "Home", url: SITE },
          { name: "Launches", url: `${SITE}/launches` },
          { name: "Launch your app", url: `${SITE}/launches/submit` },
        ]}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: LAUNCH_FAQ.map(({ q, a }) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
        }}
      />

      <section>
        <SectionTitle>How launching works</SectionTitle>
        <ol className="mt-5 grid gap-4 sm:grid-cols-3">
          {STEPS.map((step, i) => (
            <li key={step.title}>
              <span className="font-mono text-[12px] text-primary">{`0${i + 1}`}</span>
              <h3 className="mt-1 font-sans text-[15px] font-medium text-foreground">{step.title}</h3>
              <p className="mt-1 text-[13.5px] leading-6 text-muted-foreground">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <SectionTitle>What you get</SectionTitle>
        <dl className="mt-5 divide-y divide-border/70">
          {GETS.map(([title, body]) => (
            <div key={title} className="grid gap-1 py-3 sm:grid-cols-[220px_minmax(0,1fr)] sm:gap-6">
              <dt className="text-[14px] text-foreground">{title}</dt>
              <dd className="text-[14px] leading-6 text-muted-foreground">{body}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section>
        <SectionTitle>What you can launch</SectionTitle>
        <ul className="mt-5 grid gap-x-6 gap-y-3 sm:grid-cols-2">
          {KINDS.map((kind) => (
            <li key={kind.label}>
              <Link href={kind.href} className="group block">
                <span className="text-[14px] text-foreground group-hover:underline">{kind.label}</span>
                <span className="block text-[13px] text-muted-foreground">{kind.body}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {recent.length > 0 && (
        <section>
          <div className="flex items-center gap-3">
            <h2 className="shrink-0 font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-foreground">Recently launched</h2>
            <span className="h-px flex-1 bg-border" aria-hidden />
            <Link href="/launches" className="inline-flex shrink-0 items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
              All {liveCount} launches <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <ul className="mt-4 divide-y divide-border/70">
            {recent.map((p) => (
              <li key={p.id}>
                <Link href={`/launches/${encodeURIComponent(p.id)}`} className="group flex items-center gap-3 py-2.5">
                  <LaunchLogo project={p} size="sm" />
                  <span className="min-w-0 truncate text-[14px]">
                    <span className="text-foreground group-hover:underline">{p.title}</span>
                    {p.tagline && <span className="text-muted-foreground"> · {p.tagline}</span>}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <SectionTitle>Questions</SectionTitle>
        <div className="mt-3 divide-y divide-border/70">
          {LAUNCH_FAQ.map(({ q, a }) => (
            <details key={q} className="group py-3">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[14.5px] text-foreground">
                <h3 className="font-sans font-normal">{q}</h3>
                <span className="text-muted-foreground transition-transform group-open:rotate-45" aria-hidden>
                  +
                </span>
              </summary>
              <p className="mt-2 max-w-[64ch] text-[14px] leading-6 text-muted-foreground">{a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
