import Link from "next/link";
import { Calculator } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { BreadcrumbSchema, JsonLd } from "@/components/seo/JsonLd";
import { apiPricing, blendedPrice, pricingUpdatedAt, type APIPricing } from "@/data/apiPricing";
import { CLAUDE_PRICING_CHECKED_AT, claudeModels } from "@/data/claudeModels";
import PricingTable from "./PricingTable";
import { formatDate, formatPrice, formatTokens } from "./format";

const SITE_URL = "https://www.claudeai.directory";

// Editorial pick: the current flagship or most-used model from each major lab.
// Ids that drop out of the catalog are skipped.
const FEATURED_IDS = [
  "claude-fable-5-1",
  "claude-opus-5-5",
  "claude-sonnet-5",
  "claude-haiku-4-5",
  "openai/gpt-6-astra",
  "openai/gpt-6-sol",
  "google/gemini-3.1-pro-preview",
  "google/gemini-3.8-flash",
  "x-ai/grok-4.7",
  "moonshotai/kimi-k3",
  "qwen/qwen3.8-max-0902",
  "z-ai/glm-5.3",
  "meta/muse-spark-1.3",
  "mistralai/mistral-medium-3-5",
  "deepseek/deepseek-v4-pro-0813",
  "minimax/minimax-m3",
];

const heading = "font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground";

const faqs = [
  {
    q: "How much does the Claude API cost?",
    a: `Claude Opus 5.5 costs $4 per million input tokens and $20 per million output tokens. Claude Sonnet 5 costs $2 and $10, Claude Haiku 4.5 costs $1 and $5, and Claude Fable 5.1 costs $10 and $50. The Batch API halves these prices, and cached input is billed at a fraction of the base input price.`,
  },
  {
    q: "What is the blended price?",
    a: "The blended price assumes 3 input tokens for every output token, which is close to a typical chat or coding workload. It gives one number per model so you can compare them quickly. Use the cost calculator for your own mix of input and output.",
  },
  {
    q: "Where does this data come from?",
    a: `Claude prices come from Anthropic's official pricing page (checked ${formatDate(CLAUDE_PRICING_CHECKED_AT)}). Prices for other providers come from the public OpenRouter model catalog, which lists each provider's pay-as-you-go rate. Direct contracts, regional endpoints and cloud marketplaces can be priced differently.`,
  },
  {
    q: "Why can the same prompt cost more on a newer model with the same price?",
    a: "Tokenizers differ between models. Anthropic notes that Claude 4.7 and later use a newer tokenizer that produces roughly 30% more tokens for the same text, so compare the cost of real requests, not only the per-token price.",
  },
];

function byIds(ids: string[]) {
  const map = new Map(apiPricing.map(m => [m.id, m]));
  return ids.map(id => map.get(id)).filter((m): m is APIPricing => Boolean(m));
}

function BarChart({
  title,
  note,
  rows,
  value,
  format,
}: {
  title: string;
  note: string;
  rows: APIPricing[];
  value: (m: APIPricing) => number;
  format: (n: number) => string;
}) {
  const max = Math.max(...rows.map(value));
  return (
    <figure className="rounded-xl border border-border bg-card p-5 sm:p-6">
      <figcaption>
        <h3 className="text-[15px] font-medium text-foreground">{title}</h3>
        <p className="mt-1 text-[13px] text-muted-foreground">{note}</p>
      </figcaption>
      <ol className="mt-5 space-y-2">
        {rows.map(m => {
          const v = value(m);
          const claude = m.provider === "Anthropic";
          return (
            <li key={m.id} className="grid grid-cols-[minmax(0,9.5rem)_1fr] items-center gap-3 text-[13px] sm:grid-cols-[11rem_1fr]">
              <span className={`truncate ${claude ? "font-medium text-foreground" : "text-muted-foreground"}`} title={m.model}>
                {m.model}
              </span>
              <span className="flex items-center gap-2">
                <span
                  className={`h-5 rounded-[3px] ${claude ? "bg-primary" : "bg-foreground/15"}`}
                  style={{ width: `${Math.max((v / max) * 100, 1.5)}%` }}
                />
                <span className="shrink-0 tabular-nums text-foreground">{format(v)}</span>
              </span>
            </li>
          );
        })}
      </ol>
    </figure>
  );
}

// Price over time: each dot is a model, placed by release date and blended
// price (log scale, since prices span three orders of magnitude).
function PriceTimeline({ models }: { models: APIPricing[] }) {
  const points = models.filter(m => m.released && blendedPrice(m) > 0);
  const times = points.map(m => Date.parse(m.released!));
  const [t0, t1] = [Math.min(...times), Math.max(...times)];
  const prices = points.map(blendedPrice);
  const [l0, l1] = [Math.log10(Math.min(...prices)), Math.log10(Math.max(...prices))];
  const W = 720;
  const H = 300;
  const pad = { l: 48, r: 12, t: 12, b: 28 };
  const x = (t: number) => pad.l + ((t - t0) / (t1 - t0 || 1)) * (W - pad.l - pad.r);
  const y = (p: number) => H - pad.b - ((Math.log10(p) - l0) / (l1 - l0 || 1)) * (H - pad.t - pad.b);
  const ticks = [0.01, 0.1, 1, 10, 100].filter(p => Math.log10(p) >= l0 - 0.01 && Math.log10(p) <= l1 + 0.01);
  const years: number[] = [];
  for (let yr = new Date(t0).getUTCFullYear() + 1; Date.UTC(yr, 0, 1) <= t1; yr++) years.push(yr);
  const ordered = [...points].sort((a, b) => Number(a.provider === "Anthropic") - Number(b.provider === "Anthropic"));

  return (
    <figure className="rounded-xl border border-border bg-card p-5 sm:p-6">
      <figcaption>
        <h3 className="text-[15px] font-medium text-foreground">Price vs. release date</h3>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Blended price per 1M tokens on a log scale. <span className="text-primary">Claude</span> models are highlighted.
        </p>
      </figcaption>
      <div className="-mx-5 mt-4 overflow-x-auto px-5 sm:mx-0 sm:px-0">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full min-w-[620px]" role="img" aria-label="Scatter plot of model price against release date">
        {ticks.map(p => (
          <g key={p}>
            <line x1={pad.l} x2={W - pad.r} y1={y(p)} y2={y(p)} className="stroke-border" strokeDasharray="3 4" />
            <text x={pad.l - 8} y={y(p) + 4} textAnchor="end" className="fill-muted-foreground text-[11px]">
              ${p}
            </text>
          </g>
        ))}
        {years.map(yr => (
          <text key={yr} x={x(Date.UTC(yr, 0, 1))} y={H - 8} textAnchor="middle" className="fill-muted-foreground text-[11px]">
            {yr}
          </text>
        ))}
        {ordered.map(m => {
          const claude = m.provider === "Anthropic";
          return (
            <circle
              key={m.id}
              cx={x(Date.parse(m.released!))}
              cy={y(blendedPrice(m))}
              r={claude ? 5 : 3.5}
              className={claude ? "fill-primary stroke-card" : "fill-foreground/20"}
              strokeWidth={claude ? 1.5 : 0}
            >
              <title>{`${m.model} (${m.provider}): ${formatPrice(blendedPrice(m))} blended, released ${formatDate(m.released)}`}</title>
            </circle>
          );
        })}
      </svg>
      </div>
    </figure>
  );
}

export default function LlmApiPricingPage() {
  const featured = byIds(FEATURED_IDS);
  const byPrice = [...featured].sort((a, b) => blendedPrice(b) - blendedPrice(a));
  const byContext = [...featured].sort((a, b) => b.contextWindow - a.contextWindow);
  const providers = new Set(apiPricing.map(m => m.provider)).size;
  const current = claudeModels.filter(m => m.status === "current");
  const cheapest = [...apiPricing].sort((a, b) => blendedPrice(a) - blendedPrice(b))[0];
  const newest = apiPricing[0];

  const stats = [
    { label: "Models compared", value: String(apiPricing.length), sub: `${providers} providers` },
    { label: "Newest model", value: newest?.model ?? "-", sub: newest ? `${newest.provider}, ${formatDate(newest.released)}` : "" },
    { label: "Recommended Claude model", value: "Claude Opus 5.5", sub: "$4 input / $20 output" },
    { label: "Lowest blended price", value: cheapest ? formatPrice(blendedPrice(cheapest)) : "-", sub: cheapest?.model ?? "" },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <BreadcrumbSchema
        items={[
          { name: "Home", url: SITE_URL },
          { name: "LLM API Pricing", url: `${SITE_URL}/llm-api-pricing` },
        ]}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map(f => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
        }}
      />
      <Header />
      <main className="flex-1">
        <section className="mx-auto max-w-[1180px] px-4 pb-10 pt-12 md:px-8 md:pt-16">
          <nav aria-label="Breadcrumb" className="text-[13px] text-muted-foreground">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <span className="px-2">/</span>
            <span className="text-foreground">LLM API Pricing</span>
          </nav>
          <div className="mt-5 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-[680px]">
              <h1 className="text-[clamp(34px,4.6vw,52px)] font-normal leading-[1.05] text-foreground">LLM API Pricing</h1>
              <p className="mt-4 text-pretty text-[16px] leading-relaxed text-muted-foreground md:text-[17px]">
                Compare input, output and cache prices, context windows and release dates for {apiPricing.length} models
                from {providers} providers. Claude prices come straight from Anthropic&apos;s official price list.
              </p>
              <p className="mt-3 text-[13px] text-muted-foreground">Updated {formatDate(pricingUpdatedAt)}. Prices in USD per 1M tokens.</p>
            </div>
            <Link
              href="/llm-api-pricing/cost-calculator"
              className="inline-flex h-10 shrink-0 items-center gap-2 self-start rounded-full bg-foreground px-5 text-sm text-background hover:bg-foreground/85 md:self-auto"
            >
              <Calculator className="h-4 w-4" />
              Cost calculator
            </Link>
          </div>

          <dl className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border lg:grid-cols-4">
            {stats.map(s => (
              <div key={s.label} className="min-w-0 bg-card p-4 sm:p-5">
                <dt className="text-[12px] text-muted-foreground">{s.label}</dt>
                <dd className="mt-1.5 text-[18px] font-medium leading-tight text-foreground sm:text-[22px]">
                  {s.value}
                </dd>
                <dd className="mt-0.5 truncate text-[12px] text-muted-foreground">{s.sub}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mx-auto max-w-[1180px] px-4 md:px-8" aria-labelledby="highlights">
          <h2 id="highlights" className={heading}>Highlights: flagship models</h2>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <BarChart
              title="Blended price"
              note="USD per 1M tokens, 3 input tokens per output token. Lower is cheaper."
              rows={byPrice}
              value={blendedPrice}
              format={formatPrice}
            />
            <BarChart
              title="Context window"
              note="Maximum input tokens per request. Higher fits more code and documents."
              rows={byContext}
              value={m => m.contextWindow}
              format={formatTokens}
            />
          </div>
          <div className="mt-4">
            <PriceTimeline models={apiPricing} />
          </div>
        </section>

        <section className="mx-auto mt-16 max-w-[1180px] px-4 md:px-8" aria-labelledby="claude-pricing">
          <h2 id="claude-pricing" className={heading}>Claude API pricing</h2>
          <p className="mt-3 max-w-[70ch] text-[15px] leading-relaxed text-muted-foreground">
            Official first-party rates from Anthropic. Batch requests are 50% off. Cache reads cost 10% of the base
            input price (2.5% on Fable 5.1, 5% on Opus 5.5).
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {current.map(m => (
              <article key={m.apiId} className="flex flex-col rounded-xl border border-border bg-card p-5">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="text-[16px] font-medium text-foreground">{m.name}</h3>
                  {m.latency && <span className="shrink-0 text-[12px] text-muted-foreground">{m.latency}</span>}
                </div>
                <p className="mt-1.5 text-[13px] leading-snug text-muted-foreground">{m.summary}</p>
                <div className="mt-5 flex items-baseline gap-1.5">
                  <span className="text-[26px] font-medium tabular-nums text-foreground">{formatPrice(m.input)}</span>
                  <span className="text-[13px] text-muted-foreground">in</span>
                  <span className="ml-2 text-[26px] font-medium tabular-nums text-foreground">{formatPrice(m.output)}</span>
                  <span className="text-[13px] text-muted-foreground">out</span>
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2 border-t border-border pt-4 text-[12px]">
                  <dt className="text-muted-foreground">Context</dt>
                  <dd className="text-right tabular-nums text-foreground">{formatTokens(m.contextWindow)}</dd>
                  <dt className="text-muted-foreground">Max output</dt>
                  <dd className="text-right tabular-nums text-foreground">{formatTokens(m.maxOutput)}</dd>
                  <dt className="text-muted-foreground">Knowledge</dt>
                  <dd className="text-right text-foreground">{m.knowledgeCutoff}</dd>
                  <dt className="text-muted-foreground">Thinking</dt>
                  <dd className="text-right text-foreground">{m.thinking}</dd>
                </dl>
                <code className="mt-4 block truncate rounded-md bg-muted px-2.5 py-1.5 font-mono text-[12px] text-foreground">{m.apiId}</code>
              </article>
            ))}
          </div>

          <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-card">
            <table className="w-full min-w-[880px] text-sm">
              <caption className="sr-only">Claude API prices per million tokens</caption>
              <thead>
                <tr className="border-b border-border text-left text-[12px] uppercase tracking-wide text-muted-foreground">
                  <th scope="col" className="px-4 py-3 font-medium">Model</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">Input</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">Output</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">5m cache write</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">1h cache write</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">Cache read</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">Batch in / out</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">Context</th>
                </tr>
              </thead>
              <tbody>
                {claudeModels.map(m => (
                  <tr key={m.apiId} className="border-b border-border/60 last:border-0">
                    <th scope="row" className="px-4 py-3 text-left font-normal">
                      <span className="font-medium text-foreground">{m.name}</span>
                      {m.status === "legacy" && <span className="ml-2 text-[12px] text-muted-foreground">Legacy</span>}
                      <div className="mt-0.5 font-mono text-[11px] text-muted-foreground">{m.apiId}</div>
                    </th>
                    <td className="px-4 py-3 text-right tabular-nums">{formatPrice(m.input)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{formatPrice(m.output)}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{formatPrice(m.cacheWrite5m)}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{formatPrice(m.cacheWrite1h)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{formatPrice(m.cacheRead)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums text-muted-foreground">
                      {formatPrice(m.batchInput)} / {formatPrice(m.batchOutput)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">{formatTokens(m.contextWindow)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-[13px] text-muted-foreground">
            Source:{" "}
            <a
              href="https://platform.claude.com/docs/en/about-claude/pricing"
              className="underline underline-offset-4 hover:text-foreground"
              rel="noopener"
              target="_blank"
            >
              Anthropic pricing docs
            </a>
            , checked {formatDate(CLAUDE_PRICING_CHECKED_AT)}. US-only inference adds 10%. Amazon Bedrock and Google Cloud set their own prices.
          </p>
        </section>

        <section className="mx-auto mt-16 max-w-[1180px] px-4 md:px-8" aria-labelledby="all-models">
          <h2 id="all-models" className={heading}>All models</h2>
          <div className="mt-4">
            <PricingTable models={apiPricing} />
          </div>
        </section>

        <section className="mx-auto mb-24 mt-20 max-w-[840px] px-4 md:px-8" aria-labelledby="faq">
          <h2 id="faq" className="text-[26px] font-normal text-foreground">Questions about LLM API pricing</h2>
          <div className="mt-6 divide-y divide-border border-y border-border">
            {faqs.map(f => (
              <details key={f.q} className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[16px] text-foreground">
                  {f.q}
                  <span aria-hidden className="text-muted-foreground transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
