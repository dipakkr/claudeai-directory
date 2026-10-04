import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Fragment, type ReactNode } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { CopyButton } from "@/components/directory/detail";
import { BreadcrumbSchema, JsonLd } from "@/components/seo/JsonLd";
import { connectorGuides, findGuide, liveGuides } from "@/data/connector-guides";
import {
  AUTH_LABEL,
  KIND_LABEL,
  SURFACE_LABEL,
  guideH1,
  guideTitle,
  isLive,
  publishGaps,
  tallyReports,
  type GuideReport,
  type Method,
} from "@/lib/connector-guides";
import { DEFAULT_OG_IMAGE } from "@/lib/seo";
import { fetchApi } from "@/lib/api-server";
import GuideDiscussion from "./GuideDiscussion";

const SITE_URL = "https://www.claudeai.directory";
const CONTACT = "claudeai.directory@gmail.com";

export const dynamicParams = false;

export function generateStaticParams() {
  const guides = process.env.NODE_ENV === "production" ? liveGuides() : connectorGuides;
  return guides.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const g = findGuide(slug);
  if (!g) return { title: "Guide Not Found" };
  const title = guideTitle(g);
  const url = `${SITE_URL}/connectors/${g.slug}`;
  return {
    title: { absolute: `${title} | claudeai.directory` },
    description: g.description,
    alternates: { canonical: url },
    robots: isLive(g) ? undefined : { index: false, follow: false },
    openGraph: { images: [DEFAULT_OG_IMAGE], title, description: g.description, url, type: "article" },
    twitter: { images: [DEFAULT_OG_IMAGE.url], card: "summary_large_image", title, description: g.description },
  };
}

const heading = "text-[24px] font-normal leading-tight text-foreground md:text-[28px]";
const muted = "text-[15px] leading-relaxed text-muted-foreground";

const fmtDate = (d: string) =>
  new Date(`${d}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

/** `backticks` become inline code; everything else is plain text. */
function inline(text: string): ReactNode {
  return text.split(/(`[^`]+`)/).map((part, i) =>
    part.startsWith("`") && part.endsWith("`") ? (
      <code key={i} className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.88em] text-foreground">
        {part.slice(1, -1)}
      </code>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    )
  );
}

function StatusPill({ status }: { status: Method["status"] }) {
  const tone =
    status === "active"
      ? "border-emerald-500/30 text-emerald-400"
      : status === "unverified"
        ? "border-border text-muted-foreground"
        : "border-amber-500/30 text-amber-400";
  return <span className={`inline-block rounded-full border px-2 py-0.5 text-[12px] capitalize ${tone}`}>{status}</span>;
}

export default async function ConnectorGuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const g = findGuide(slug);
  if (!g) notFound();

  const url = `${SITE_URL}/connectors/${g.slug}`;
  const h1 = guideH1(g);
  const gaps = publishGaps(g);
  const related = g.related
    .map((s) => connectorGuides.find((x) => x.slug === s))
    .filter((x): x is NonNullable<typeof x> => !!x && isLive(x));
  const listed = g.methods.filter((m) => m.mcpSlug);
  // Community reports are part of the page's content, so render them on the server.
  const reports = (await fetchApi<GuideReport[]>(`/connector-guides/${g.slug}/replies`, { revalidate: 60 })) ?? [];
  const tally = tallyReports(reports);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <BreadcrumbSchema
        items={[
          { name: "Home", url: SITE_URL },
          { name: "Connectors", url: `${SITE_URL}/connectors` },
          { name: g.app, url },
        ]}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "HowTo",
          name: h1,
          description: g.description,
          dateModified: g.verifiedOn,
          step: g.setup[0].steps.map((s, i) => ({ "@type": "HowToStep", position: i + 1, text: s.text.replace(/`/g, "") })),
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "TechArticle",
          headline: h1,
          description: g.description,
          url,
          datePublished: g.publishedOn,
          dateModified: g.verifiedOn,
          author: { "@type": "Organization", name: "claudeai.directory", url: SITE_URL },
          publisher: { "@type": "Organization", name: "claudeai.directory", url: SITE_URL },
          about: [{ "@type": "SoftwareApplication", name: g.app }, { "@type": "SoftwareApplication", name: "Claude" }],
          image: g.evidence.map((e) => `${SITE_URL}${e.src}`),
          commentCount: reports.length,
          comment: reports.slice(0, 20).map((r) => ({
            "@type": "Comment",
            text: r.body,
            dateCreated: r.created_at,
            author: { "@type": "Person", name: r.author },
          })),
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: g.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
        }}
      />
      <Header />
      <main className="flex-1 px-4 md:px-6">
        <article className="mx-auto max-w-[860px] pb-24">
          {gaps.length > 0 || g.status === "draft" ? (
            <div className="mt-6 rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 text-[14px] text-amber-200">
              <strong>Draft, not public.</strong> Shown only in development.
              {gaps.length > 0 && (
                <ul className="mt-2 list-disc pl-5">
                  {gaps.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              )}
            </div>
          ) : null}

          <section className="pt-10 md:pt-12">
            <nav aria-label="Breadcrumb" className="text-[13px] text-muted-foreground">
              <Link href="/" className="hover:text-foreground">Home</Link>
              <span className="px-2">/</span>
              <Link href="/connectors" className="hover:text-foreground">Connectors</Link>
              <span className="px-2">/</span>
              <span className="text-foreground">{g.app}</span>
            </nav>
            <h1 className="mt-5 text-[clamp(34px,4.6vw,52px)] font-normal leading-[1.05] text-foreground">{h1}</h1>
            <p className="mt-3 text-[13px] text-muted-foreground">
              By the claudeai.directory team · Tested with {g.testedWith} · Last verified{" "}
              <time dateTime={g.verifiedOn}>{fmtDate(g.verifiedOn)}</time>
            </p>

            <div className="mt-8 rounded-xl border border-border bg-card p-5 md:p-6">
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Quick answer</p>
              <p className="mt-2 text-[16px] leading-relaxed text-foreground md:text-[17px]">{inline(g.quickAnswer)}</p>
            </div>

            <h2 className="mt-10 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Key facts</h2>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[15px] leading-relaxed text-foreground marker:text-muted-foreground">
              {g.keyFacts.map((f) => (
                <li key={f}>{inline(f)}</li>
              ))}
            </ul>
          </section>

          <section className="mt-16" aria-labelledby="options">
            <h2 id="options" className={`${heading} scroll-mt-24`}>Which way should you connect {g.app} to Claude?</h2>
            <p className={`mt-3 ${muted}`}>Every way to connect {g.app} to Claude that we could verify, official and community.</p>
            <div className="mt-5 overflow-x-auto rounded-lg border border-border">
              <table className="w-full min-w-[720px] text-left text-[14px]">
                <thead className="bg-muted/50 text-[12px] uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-normal">Method</th>
                    <th className="px-4 py-3 font-normal">Works in</th>
                    <th className="px-4 py-3 font-normal">Auth</th>
                    <th className="px-4 py-3 font-normal">Last update</th>
                    <th className="px-4 py-3 font-normal">Status</th>
                    <th className="px-4 py-3 font-normal">Reader reports</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {g.methods.map((m) => (
                    <tr key={m.name} className="align-top">
                      <td className="px-4 py-3">
                        <a href={m.url} target="_blank" rel="noopener" className="text-foreground underline-offset-4 hover:underline">
                          {m.name}
                        </a>
                        <div className="mt-0.5 text-[12px] text-muted-foreground">
                          {KIND_LABEL[m.kind]} · {m.maintainer}
                        </div>
                        {m.needs && <div className="mt-1 text-[12px] text-muted-foreground">Needs: {m.needs}</div>}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{m.worksIn.map((s) => SURFACE_LABEL[s]).join(", ")}</td>
                      <td className="px-4 py-3 text-muted-foreground">{AUTH_LABEL[m.auth]}</td>
                      <td className="px-4 py-3 text-muted-foreground">{m.lastActivity ? fmtDate(m.lastActivity) : "n/a"}</td>
                      <td className="px-4 py-3"><StatusPill status={m.status} /></td>
                      <td className="px-4 py-3 text-muted-foreground">
                        <a href="#community" className="hover:text-foreground">
                          {tally[m.name] ? `${tally[m.name].worked} worked, ${tally[m.name].failed} didn't` : "None yet"}
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {g.methods.some((m) => m.note) && (
              <ul className={`mt-4 space-y-1.5 text-[14px] text-muted-foreground`}>
                {g.methods.filter((m) => m.note).map((m) => (
                  <li key={m.name}><span className="text-foreground">{m.name}:</span> {inline(m.note!)}</li>
                ))}
              </ul>
            )}
          </section>

          {g.setup.map((block, bi) => {
            const m = g.methods[block.method];
            return (
              <section key={block.title} className="mt-16" aria-labelledby={`setup-${bi}`}>
                <h2 id={`setup-${bi}`} className={`${heading} scroll-mt-24`}>{block.title}</h2>
                <p className={`mt-3 ${muted}`}>
                  {bi === 0 ? "Recommended" : "Alternative"} · {block.surface} · uses{" "}
                  <a href={m.url} target="_blank" rel="noopener" className="underline underline-offset-4 hover:text-foreground">{m.name}</a>
                </p>
                <ol className="mt-5 space-y-5">
                  {block.steps.map((s, i) => (
                    <li key={i} className="grid grid-cols-[28px_1fr] gap-3">
                      <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full border border-border font-mono text-[12px] text-muted-foreground">
                        {i + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="text-[15px] leading-relaxed text-foreground">{inline(s.text)}</p>
                        {s.code && (
                          <div className="mt-3 overflow-hidden rounded-lg border border-border bg-muted/40">
                            <div className="flex items-center justify-between border-b border-border px-3 py-1.5">
                              <span className="font-mono text-[11px] text-muted-foreground">{s.code.label ?? ""}</span>
                              {s.code.copyable !== false && (
                                <CopyButton
                                  text={s.code.value}
                                  event={m.mcpSlug ? "mcp_command_copied" : "install_command_copied"}
                                  eventProps={m.mcpSlug ? { resource_type: "mcp", resource_id: m.mcpSlug } : { guide: g.slug }}
                                />
                              )}
                            </div>
                            <pre className="overflow-x-auto p-3 font-mono text-[13px] leading-relaxed text-foreground"><code>{s.code.value}</code></pre>
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
                {bi === 0 && g.evidence.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-[18px] font-normal text-foreground">We tested it</h3>
                    <p className={`mt-1 ${muted}`}>Real runs with {g.testedWith}. Screenshots are cropped, not edited.</p>
                    <div className="mt-4 space-y-6">
                      {g.evidence.map((e) => (
                        <figure key={e.src}>
                          <a href={e.src} target="_blank" rel="noopener" aria-label="Open full-size screenshot">
                          <Image
                            src={e.src}
                            width={e.width}
                            height={e.height}
                            alt={e.alt}
                            sizes="(max-width: 860px) 100vw, 860px"
                            className="w-full rounded-lg border border-border"
                          />
                          </a>
                          <figcaption className="mt-2 text-[13px] text-muted-foreground">
                            {inline(e.caption)} Captured {fmtDate(e.capturedOn)}.
                          </figcaption>
                        </figure>
                      ))}
                    </div>
                  </div>
                )}
                <p className="mt-4 text-[13px] text-muted-foreground">
                  Checked against{" "}
                  <a href={block.source.url} target="_blank" rel="noopener" className="underline underline-offset-4 hover:text-foreground">the source</a>{" "}
                  on {fmtDate(block.source.verifiedOn)}.
                </p>
              </section>
            );
          })}

          <section className="mt-16" aria-labelledby="permissions">
            <h2 id="permissions" className={`${heading} scroll-mt-24`}>Access and permissions</h2>
            <dl className="mt-5 divide-y divide-border border-y border-border">
              {g.permissions.map((p) => (
                <div key={p.heading} className="grid gap-1 py-4 md:grid-cols-[220px_1fr] md:gap-6">
                  <dt className="text-[15px] text-foreground">{p.heading}</dt>
                  <dd className={muted}>{inline(p.body)}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="mt-16" aria-labelledby="prompts">
            <h2 id="prompts" className={`${heading} scroll-mt-24`}>What can you do after connecting {g.app} to Claude?</h2>
            <ul className="mt-5 grid gap-3">
              {g.prompts.map((p) => (
                <li key={p.prompt} className="rounded-lg border border-border bg-card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-[15px] text-foreground">&ldquo;{p.prompt}&rdquo;</p>
                    <CopyButton text={p.prompt} />
                  </div>
                  <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">{inline(p.outcome)}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-16" aria-labelledby="troubleshooting">
            <h2 id="troubleshooting" className={`${heading} scroll-mt-24`}>Troubleshooting</h2>
            <dl className="mt-5 divide-y divide-border border-y border-border">
              {g.troubleshooting.map((t) => (
                <div key={t.problem} className="py-4">
                  <dt className="text-[15px] text-foreground">{inline(t.problem)}</dt>
                  <dd className={`mt-1.5 ${muted}`}>
                    {inline(t.fix)}{" "}
                    <a href={t.sourceUrl} target="_blank" rel="noopener" className="whitespace-nowrap text-[13px] underline underline-offset-4 hover:text-foreground">Source</a>
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="mt-16" aria-labelledby="faq">
            <h2 id="faq" className={`${heading} scroll-mt-24`}>FAQ</h2>
            <div className="mt-5 divide-y divide-border border-y border-border">
              {g.faq.map((f) => (
                <div key={f.q} className="py-4">
                  <h3 className="text-[16px] text-foreground">{f.q}</h3>
                  <p className={`mt-2 ${muted}`}>{f.a}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="mt-16 scroll-mt-24" id="community">
            <GuideDiscussion slug={g.slug} app={g.app} methods={g.methods.map((m) => m.name)} initialReports={reports} />
          </div>

          <section className="mt-16" aria-labelledby="related">
            <h2 id="related" className={`${heading} scroll-mt-24`}>Related</h2>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {related.map((r) => (
                <li key={r.slug}>
                  <Link href={`/connectors/${r.slug}`} className="block rounded-lg border border-border bg-card p-4 hover:border-foreground/30">
                    <span className="text-[15px] text-foreground">{guideH1(r)}</span>
                  </Link>
                </li>
              ))}
              {listed.map((m) => (
                <li key={m.mcpSlug}>
                  <Link href={`/mcp/${m.mcpSlug}`} className="block rounded-lg border border-border bg-card p-4 hover:border-foreground/30">
                    <span className="text-[15px] text-foreground">{m.name}</span>
                    <span className="mt-1 block text-[13px] text-muted-foreground">MCP server listing</span>
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/connectors" className="block rounded-lg border border-border bg-card p-4 hover:border-foreground/30">
                  <span className="text-[15px] text-foreground">All connectors</span>
                  <span className="mt-1 block text-[13px] text-muted-foreground">Connect other apps to Claude</span>
                </Link>
              </li>
              <li>
                <Link href="/mcp" className="block rounded-lg border border-border bg-card p-4 hover:border-foreground/30">
                  <span className="text-[15px] text-foreground">Browse MCP servers</span>
                  <span className="mt-1 block text-[13px] text-muted-foreground">Install commands for Claude Code</span>
                </Link>
              </li>
            </ul>
          </section>

          <footer className="mt-16 flex flex-wrap gap-x-6 gap-y-2 border-t border-border pt-6 text-[13px] text-muted-foreground">
            <span>Last verified {fmtDate(g.verifiedOn)}</span>
            <a
              href={`mailto:${CONTACT}?subject=${encodeURIComponent(`Error on ${h1}`)}`}
              className="underline underline-offset-4 hover:text-foreground"
            >
              Report an error
            </a>
            <a
              href={`mailto:${CONTACT}?subject=${encodeURIComponent(`I maintain a ${g.app} connector`)}`}
              className="underline underline-offset-4 hover:text-foreground"
            >
              Maintain an integration for {g.app}? Tell us
            </a>
          </footer>
        </article>
      </main>
      <Footer />
    </div>
  );
}
