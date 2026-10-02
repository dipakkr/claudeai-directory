import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PageBreadcrumb from "@/components/layout/PageBreadcrumb";
import { CopyLinkButton, FilterBar } from "./TimelineClient";
import {
  CHRONO,
  CORRECTIONS_EMAIL,
  CURRENT_MODELS,
  ENTRIES,
  FAMILY_LABELS,
  GAP_BEFORE,
  GROUPS,
  GROUP_LABELS,
  LAST_UPDATED,
  PAGE_PATH,
  STATS,
  formatDate,
  groupOf,
  names,
  yearOf,
  type TimelineEntry,
} from "./timeline-data";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.claudeai.directory";
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`;

const TITLE = "Claude Release Timeline: Every Claude Model, Dated";
const DESCRIPTION = `Every Claude model from Claude 1 (March 2023) to ${STATS.last.title}, plus Claude Code, MCP, Skills and plugins. ${STATS.models} models, exact dates, official sources.`;

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: PAGE_PATH },
  openGraph: { title: TITLE, description: DESCRIPTION, url: PAGE_PATH, type: "article" },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

// Newest first, grouped by year.
const NEWEST = [...CHRONO].reverse();
const YEARS = [...new Set(NEWEST.map((e) => yearOf(e.date)))];

const enc = encodeURIComponent;
const shareX = (text: string, url: string) => `https://x.com/intent/post?text=${enc(text)}&url=${enc(url)}`;
const shareReddit = (title: string, url: string) => `https://www.reddit.com/submit?url=${enc(url)}&title=${enc(title)}`;
const shareLinkedIn = (url: string) => `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`;

const PAGE_SHARE_TEXT = `${STATS.models} Claude models in ${Math.round(STATS.spanDays / 30.44)} months. The fastest gap between releases: ${STATS.fastest.days} days. Every Claude release, dated and sourced:`;

function entryShareText(e: TimelineEntry) {
  const when = formatDate(e.date, { month: "long", day: "numeric", year: "numeric" });
  return e.kind === "model" ? `${e.title} came out on ${when}. Every Claude model release, dated:` : `${e.title}: ${when}. The full Claude release timeline:`;
}

const btn =
  "inline-flex h-9 items-center gap-1.5 rounded-[6px] border border-border px-3 text-[13px] font-medium text-foreground transition-colors hover:border-[var(--cad-line-hover)] hover:bg-card";
const action = "inline-flex items-center gap-1 text-[12px] text-muted-foreground transition-colors hover:text-primary";

// CSS-only filtering: the client island flips data-filter on #timeline.
const FILTER_CSS = GROUPS.map(
  (g) =>
    `#timeline[data-filter="${g}"] [data-group]:not([data-group="${g}"]),#timeline[data-filter="${g}"] [data-groups]:not([data-groups~="${g}"]){display:none}`,
).join("");

function SectionLabel({ children, aside }: { children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <h2 className="shrink-0 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{children}</h2>
      <span className="h-px flex-1 bg-border" />
      {aside && <span className="shrink-0 font-mono text-[11px] text-muted-foreground">{aside}</span>}
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-background p-4">
      <p className="font-mono text-[11px] text-muted-foreground">{label}</p>
      <p className="mt-1.5 text-[22px] font-semibold tabular-nums leading-none text-foreground">{value}</p>
      {sub && <p className="mt-1.5 text-[12px] leading-5 text-muted-foreground">{sub}</p>}
    </div>
  );
}

function ShareBar() {
  return (
    <div className="flex flex-wrap gap-2">
      <CopyLinkButton url={PAGE_URL} className={btn} />
      <a href={shareX(PAGE_SHARE_TEXT, PAGE_URL)} target="_blank" rel="noopener noreferrer" className={btn}>
        Share on X
      </a>
      <a href={shareReddit(`Every Claude model release, dated (${STATS.models} models since March 2023)`, PAGE_URL)} target="_blank" rel="noopener noreferrer" className={btn}>
        Reddit
      </a>
      <a href={shareLinkedIn(PAGE_URL)} target="_blank" rel="noopener noreferrer" className={btn}>
        LinkedIn
      </a>
    </div>
  );
}

function Entry({ e }: { e: TimelineEntry }) {
  const url = `${PAGE_URL}#${e.id}`;
  const gap = GAP_BEFORE[e.id];
  const isModel = e.kind === "model";
  const dot = !isModel
    ? "border border-muted-foreground bg-background"
    : e.restricted
      ? "border border-primary bg-background"
      : "bg-primary";
  const kindLabel = isModel ? FAMILY_LABELS[e.family!] : e.kind === "product" ? "Product" : "Milestone";
  return (
    <li id={e.id} data-group={groupOf(e)} className="group relative scroll-mt-24 pb-7 pl-6 last:pb-0">
      <span className={`absolute left-0 top-[5px] h-[9px] w-[9px] rounded-full ${dot}`} aria-hidden />
      <div className="-mx-2 rounded-[6px] px-2 py-2 transition-colors group-target:bg-card group-target:ring-1 group-target:ring-primary/40">
        <p className="font-mono text-[11px] text-muted-foreground">
          <time dateTime={e.date}>{formatDate(e.date)}</time>
          <span className="mx-1.5">·</span>
          <span className={isModel ? "text-primary" : ""}>{kindLabel}</span>
          {gap !== undefined && (
            <>
              <span className="mx-1.5">·</span>
              {`${gap} day${gap === 1 ? "" : "s"} after the previous release`}
            </>
          )}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <h3 className="font-sans text-[16px] font-semibold leading-snug text-foreground">
            <a href={`#${e.id}`} className="hover:text-primary">
              {e.title}
            </a>
          </h3>
          {e.current && <span className="rounded-[4px] bg-primary/15 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-primary">Current</span>}
          {e.restricted && (
            <span className="rounded-[4px] border border-border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Restricted access</span>
          )}
        </div>
        <p className="mt-1 max-w-[62ch] text-[14px] leading-6 text-muted-foreground">{e.description}</p>
        {(e.modelId || e.context) && (
          <div className="mt-2 flex flex-wrap gap-1.5 font-mono text-[11px] text-muted-foreground">
            {e.modelId && <code className="rounded-[4px] border border-border px-1.5 py-0.5">{e.modelId}</code>}
            {e.context && <span className="rounded-[4px] border border-border px-1.5 py-0.5">{e.context} context</span>}
          </div>
        )}
        <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5">
          <a href={e.sourceUrl} target="_blank" rel="noopener noreferrer" className={action} title={e.sourceLabel}>
            Source <ArrowUpRight className="h-3 w-3" />
          </a>
          <CopyLinkButton url={url} className={action} />
          <a href={shareX(entryShareText(e), url)} target="_blank" rel="noopener noreferrer" className={action}>
            Share on X
          </a>
          {e.related && (
            <Link href={e.related.href} className={action}>
              {e.related.label}
            </Link>
          )}
        </div>
      </div>
    </li>
  );
}

function jsonLd() {
  const data = [
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Claude release timeline",
      description: DESCRIPTION,
      url: PAGE_URL,
      dateModified: LAST_UPDATED,
      numberOfItems: ENTRIES.length,
      itemListOrder: "https://schema.org/ItemListOrderAscending",
      itemListElement: CHRONO.map((e, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${PAGE_URL}#${e.id}`,
        item: {
          "@type": e.kind === "model" ? "SoftwareApplication" : "Thing",
          name: e.title,
          description: e.description,
          ...(e.kind === "model" ? { applicationCategory: "AI model", datePublished: e.date, author: { "@type": "Organization", name: "Anthropic" } } : {}),
          sameAs: e.sourceUrl,
        },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Claude release timeline", item: PAGE_URL },
      ],
    },
  ];
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export default function TimelinePage() {
  const s = STATS;
  const maxPerYear = Math.max(...s.perYear.map((y) => y.count));
  const filterOptions = [
    { value: "all", label: "All", count: ENTRIES.length },
    ...GROUPS.map((g) => ({ value: g, label: GROUP_LABELS[g], count: ENTRIES.filter((e) => groupOf(e) === g).length })),
  ];
  const citation = `Claude AI Directory, "Claude Release Timeline", updated ${formatDate(LAST_UPDATED, { month: "long", day: "numeric", year: "numeric" })}. ${PAGE_URL}`;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd() }} />
      <style>{FILTER_CSS}</style>
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-[920px] px-4 pb-20 pt-8 md:px-8">
          <PageBreadcrumb items={[{ label: "Claude release timeline" }]} />
          <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.16em] text-primary">Claude release timeline</p>
          <h1 className="mt-2 text-[clamp(30px,4.5vw,44px)] font-semibold leading-tight tracking-tight text-foreground">Every Claude model, dated</h1>
          <p className="mt-3 max-w-[64ch] text-[15px] leading-7 text-muted-foreground">
            {s.models} generally available models in {Math.round(s.spanDays / 30.44)} months, from {s.first.title} on {formatDate(s.first.date)} to {s.last.title} on{" "}
            {formatDate(s.last.date)}. Plus the products that changed how people use them: Claude Code, MCP, Skills and plugins. Every date links to
            Anthropic&apos;s own announcement.
          </p>
          <p className="mt-3 font-mono text-[11px] text-muted-foreground">
            Last updated <time dateTime={LAST_UPDATED}>{formatDate(LAST_UPDATED)}</time> · {ENTRIES.length} entries · {s.products} product launches and milestones
          </p>
          <div className="mt-5">
            <ShareBar />
          </div>

          {/* By the numbers */}
          <section className="mt-12">
            <SectionLabel aside={`as of ${formatDate(LAST_UPDATED)}`}>By the numbers</SectionLabel>
            <div className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-[6px] border border-border bg-border md:grid-cols-4">
              <Stat label="models_released" value={String(s.models)} sub={`plus ${s.restricted} restricted Mythos models`} />
              <Stat label="avg_gap" value={`${s.avgGap} days`} sub={`between ${s.releaseDays} release days`} />
              <Stat label="fastest_gap" value={`${s.fastest.days} days`} sub={`${names(s.fastest.from)} to ${names(s.fastest.to)}`} />
              <Stat label="longest_wait" value={`${s.longest.days} days`} sub={`${names(s.longest.from)} to ${names(s.longest.to)}`} />
              <Stat label="opus_versions" value={String(s.opus)} sub={`${s.opusLastYear} in the last 12 months`} />
              <Stat label="sonnet_versions" value={String(s.sonnet)} sub="the most of any tier" />
              <Stat label="haiku_versions" value={String(s.haiku)} sub="counting Claude Instant" />
              <Stat label="busiest_year" value={String(s.busiestYear.year)} sub={`${s.busiestYear.count} models${s.busiestYear.year === yearOf(LAST_UPDATED) ? " so far" : ""}`} />
            </div>

            <div className="mt-6">
              <p className="font-mono text-[11px] text-muted-foreground">models per year</p>
              <ul className="mt-2 space-y-1.5">
                {s.perYear.map((y) => (
                  <li key={y.year} className="flex items-center gap-3 text-[13px]">
                    <span className="w-10 shrink-0 font-mono text-muted-foreground">{y.year}</span>
                    <span className="h-2 rounded-[2px] bg-primary/85" style={{ width: `${(y.count / maxPerYear) * 70}%` }} />
                    <span className="font-mono tabular-nums text-foreground">{y.count}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Current lineup */}
          <section className="mt-12">
            <SectionLabel aside="per Anthropic's models overview">Current lineup</SectionLabel>
            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
              {CURRENT_MODELS.map((m) => (
                <a key={m.id} href={`#${m.id}`} className="block rounded-[6px] border border-border bg-card p-4 transition-colors hover:border-[var(--cad-line-hover)]">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-primary">{FAMILY_LABELS[m.family!]}</span>
                  <span className="mt-1 block font-sans text-[15px] font-semibold text-foreground">{m.title}</span>
                  <span className="mt-1 block font-mono text-[11px] text-muted-foreground">
                    {formatDate(m.date)}
                    {m.context ? ` · ${m.context}` : ""}
                  </span>
                </a>
              ))}
            </div>
          </section>

          {/* Timeline */}
          <section className="mt-12">
            <SectionLabel aside="newest first">Timeline</SectionLabel>
            <div className="mt-4">
              <FilterBar targetId="timeline" options={filterOptions} />
            </div>
            <div id="timeline" data-filter="all" className="mt-8">
              {YEARS.map((year) => {
                const items = NEWEST.filter((e) => yearOf(e.date) === year);
                const groups = [...new Set(items.map(groupOf))].join(" ");
                const models = items.filter((e) => e.kind === "model" && !e.restricted).length;
                return (
                  <section key={year} data-groups={groups} className="mb-10" aria-labelledby={`y${year}`}>
                    <div className="mb-5 flex items-baseline gap-3">
                      <h2 id={`y${year}`} className="text-[26px] font-semibold leading-none text-foreground">
                        {year}
                      </h2>
                      <span className="font-mono text-[11px] text-muted-foreground">
                        {models} model{models === 1 ? "" : "s"}
                      </span>
                    </div>
                    <ol className="relative ml-1 border-l border-border pl-0 [&>li]:-ml-[5px]">
                      {items.map((e) => (
                        <Entry key={e.id} e={e} />
                      ))}
                    </ol>
                  </section>
                );
              })}
            </div>
          </section>

          {/* Cite and corrections */}
          <section className="mt-6 grid gap-3 md:grid-cols-2">
            <div className="rounded-[6px] border border-border bg-card p-4">
              <p className="font-sans text-sm font-semibold text-foreground">Cite or link this timeline</p>
              <p className="mt-1 text-[13px] leading-6 text-muted-foreground">
                Free to quote and link. Every entry has its own anchor, so you can point to a single release.
              </p>
              <code className="mt-3 block break-words rounded-[4px] border border-border bg-background p-2.5 font-mono text-[11px] leading-5 text-muted-foreground">{citation}</code>
              <CopyLinkButton url={citation} label="Copy citation" className={`${action} mt-2.5`} />
            </div>
            <div className="rounded-[6px] border border-border bg-card p-4">
              <p className="font-sans text-sm font-semibold text-foreground">Spot a mistake or a missing release?</p>
              <p className="mt-1 text-[13px] leading-6 text-muted-foreground">
                Email <span className="font-mono text-foreground">{CORRECTIONS_EMAIL}</span> with a link to the official source and we will update the page.
              </p>
              <a href={`mailto:${CORRECTIONS_EMAIL}?subject=${enc("Claude timeline correction")}`} className={`${action} mt-2.5`}>
                Suggest a correction <ArrowUpRight className="h-3 w-3" />
              </a>
            </div>
          </section>

          <p className="mt-6 max-w-[70ch] text-[12px] leading-5 text-muted-foreground">
            Dates are US Pacific publication dates of Anthropic&apos;s announcements. Stats count generally available model releases only; the
            restricted Mythos models are listed but not counted. Gaps are measured between distinct release days, so models launched together count once.
            Claude AI Directory is a community site and is not affiliated with Anthropic.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
