"use client";

import { DofollowBanner } from "../DofollowBanner";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Check,
  Copy,
  ExternalLink,
  Linkedin,
  CreditCard,
  Home,
  Link2,
  MessageSquare,
  Loader2,
  Rocket,
  Sparkles,
} from "lucide-react";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { faviconFor } from "@/lib/directory";
import {
  useLaunchAutofill,
  useUploadConfig,
  useMyShowcaseProjects,
  useSubmitShowcaseProject,
  useVerifyShowcaseBadge,
  type LaunchAutofill,
} from "@/hooks/use-showcase";
import { MediaUpload } from "@/components/launches/MediaUpload";
import { FormSection, LaunchReading, LaunchStart } from "./LaunchStart";
import type { ShowcaseProject } from "@/types";

type Media = { logo: string[]; screenshot: string[]; video: string[] };

const SITE_URL = "https://www.claudeai.directory";

import { CATEGORIES } from "@/lib/launch-options";
import { SignInButton } from "@/components/auth/SignInDialog";
import { track } from "@/lib/analytics";

const STEPS = ["Details", "Badge", "Share"] as const;

type Step = 0 | 1 | 2;

const EMPTY_FORM = {
  app_url: "",
  title: "",
  tagline: "",
  category: "Web app",
  description: "",
  audience: "",
  problem: "",
  solution: "",
  unique: "",
  platforms: [] as string[],
  tags: "",
  use_cases: "",
  images: "",
  demo_video_url: "",
  github_url: "",
  twitter: "",
  github: "",
  linkedin: "",
  feedback_prompt: "",
  maker_comment: "",
};

type Form = typeof EMPTY_FORM;

// Filled, full-width fields (DevHunt-style): no visible border until focus.
const inputClass =
  "h-12 w-full rounded-[10px] border border-transparent bg-foreground/[0.06] px-4 text-[15px] text-foreground placeholder:text-muted-foreground/60 transition-colors focus:border-[var(--cad-line-hover)] focus:outline-none";
const textareaClass =
  "w-full rounded-[10px] border border-transparent bg-foreground/[0.06] px-4 py-3 text-[15px] leading-6 text-foreground placeholder:text-muted-foreground/60 transition-colors focus:border-[var(--cad-line-hover)] focus:outline-none";

function splitList(value: string, separator: RegExp = /[,\n]/) {
  return value
    .split(separator)
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function isValidUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function socialUrl(value: string, base: string) {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `${base}${trimmed.replace(/^@/, "")}`;
}

function listingUrl(app: ShowcaseProject) {
  return `${SITE_URL}/launches/${app.id}`;
}

type BadgeOption = { id: string; label: string; style: "launched" | "upvotes" | "minimal"; theme: "light" | "dark"; width: number; height: number };

// Every option is an image wrapped in a link to the listing, which is what
// badge verification looks for, so any of them verifies.
const BADGE_OPTIONS: BadgeOption[] = [
  { id: "launched-light", label: "Listed", style: "launched", theme: "light", width: 220, height: 54 },
  { id: "launched-dark", label: "Listed, dark", style: "launched", theme: "dark", width: 220, height: 54 },
  { id: "upvotes-light", label: "Live upvotes", style: "upvotes", theme: "light", width: 262, height: 54 },
  { id: "upvotes-dark", label: "Live upvotes, dark", style: "upvotes", theme: "dark", width: 262, height: 54 },
  { id: "minimal-light", label: "Compact", style: "minimal", theme: "light", width: 196, height: 28 },
  { id: "minimal-dark", label: "Compact, dark", style: "minimal", theme: "dark", width: 196, height: 28 },
];

function badgePath(app: ShowcaseProject, option: BadgeOption) {
  const params = new URLSearchParams();
  if (option.style !== "launched") params.set("style", option.style);
  if (option.theme !== "light") params.set("theme", option.theme);
  const qs = params.toString();
  return `/badge/${app.id}${qs ? `?${qs}` : ""}`;
}

function badgeSnippet(app: ShowcaseProject, option: BadgeOption, format: "html" | "markdown") {
  const img = `${SITE_URL}${badgePath(app, option)}`;
  const alt = `${app.title} - Listed on Claude AI Directory`;
  if (format === "markdown") return `[![${alt}](${img})](${listingUrl(app)})`;
  return `<a href="${listingUrl(app)}" target="_blank" rel="noopener"><img src="${img}" alt="${alt.replace(/"/g, "&quot;")}" width="${option.width}" height="${option.height}" /></a>`;
}

function errorDetail(error: unknown, fallback: string) {
  if (error instanceof ApiError && error.data && typeof error.data === "object" && "detail" in error.data) {
    return String((error.data as { detail: unknown }).detail);
  }
  return fallback;
}

/* ---------- small building blocks ---------- */

function Field({
  label,
  htmlFor,
  hint,
  required,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={htmlFor} className="flex items-baseline justify-between gap-3 text-[14px] text-muted-foreground">
        <span>
          {label}
          {required && <span className="ml-0.5 text-primary">*</span>}
        </span>
        {hint && <span className="text-xs font-normal text-muted-foreground">{hint}</span>}
      </label>
      {children}
    </div>
  );
}

function ChipGroup({
  options,
  value,
  onToggle,
  label,
}: {
  options: string[];
  value: string[];
  onToggle: (option: string) => void;
  label: string;
}) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = value.includes(option);
        return (
          <button
            key={option}
            type="button"
            aria-pressed={active}
            onClick={() => onToggle(option)}
            className={`inline-flex h-8 items-center gap-1 rounded-full border px-3 text-xs font-medium transition-colors ${
              active
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-card text-muted-foreground hover:border-[var(--cad-line-hover)] hover:text-foreground"
            }`}
          >
            {active && <Check className="h-3 w-3" />}
            {option}
          </button>
        );
      })}
    </div>
  );
}

function Stepper({ step }: { step: Step }) {
  return (
    <ol className="flex items-center gap-2 text-sm" aria-label="Launch progress">
      {STEPS.map((label, index) => {
        const done = index < step;
        const current = index === step;
        return (
          <li key={label} className="flex items-center gap-2">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full border text-xs font-medium ${
                done
                  ? "border-foreground bg-foreground text-background"
                  : current
                    ? "border-primary text-primary"
                    : "border-border text-muted-foreground"
              }`}
              aria-current={current ? "step" : undefined}
            >
              {done ? <Check className="h-3 w-3" /> : index + 1}
            </span>
            <span className={current ? "font-medium text-foreground" : "text-muted-foreground"}>{label}</span>
            {index < STEPS.length - 1 && <span className="mx-1 h-px w-6 bg-border sm:w-10" aria-hidden="true" />}
          </li>
        );
      })}
    </ol>
  );
}

function Logo({ url, logoUrl, name, className }: { url?: string; logoUrl?: string | null; name: string; className: string }) {
  const normalized = url ? normalizeUrl(url) : "";
  const src = logoUrl || (normalized && isValidUrl(normalized) ? faviconFor(normalized) : null);
  return (
    <span className={`flex shrink-0 items-center justify-center overflow-hidden border border-border bg-card font-semibold text-muted-foreground ${className}`}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
      ) : (
        (name.trim()[0] || "?").toUpperCase()
      )}
    </span>
  );
}

/* ---------- right column ---------- */

function LivePreview({ form, media }: { form: Form; media: Media }) {
  const cover = media.screenshot[0] || splitList(form.images)[0];
  const tags = splitList(form.tags).slice(0, 3);
  return (
    <section aria-label="Listing preview" className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="border-b border-border px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
        Preview
      </div>
      {cover && isValidUrl(cover) && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={cover}
          src={cover}
          alt=""
          className="aspect-[16/9] w-full border-b border-border bg-background object-cover"
          referrerPolicy="no-referrer"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />
      )}
      <div className="bg-gradient-to-br from-primary/10 via-primary/[0.03] to-transparent p-4">
        <div className="flex items-start gap-3">
          <Logo url={form.app_url} logoUrl={media.logo[0]} name={form.title || "?"} className="h-12 w-12 rounded-lg text-base" />
          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-foreground">{form.title || "Your app name"}</p>
            <p className="mt-0.5 line-clamp-2 text-sm leading-5 text-muted-foreground">
              {form.tagline || "Your one-line pitch shows here."}
            </p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <span className="rounded-md border border-border bg-card px-2 py-0.5 text-[11px] text-foreground">{form.category}</span>
          {tags.map((tag) => (
            <span key={tag} className="rounded-md border border-border bg-card px-2 py-0.5 text-[11px] text-muted-foreground">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function MyLaunches({
  apps,
  activeId,
  onContinue,
}: {
  apps: ShowcaseProject[];
  activeId?: string;
  onContinue: (app: ShowcaseProject) => void;
}) {
  if (!apps.length) return null;
  return (
    <section className="rounded-lg border border-border bg-card">
      <h2 className="border-b border-border px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
        Your launches
      </h2>
      <ul>
        {apps.slice(0, 6).map((app) => (
          <li key={app.id} className="flex items-center gap-3 border-b border-border px-4 py-3 last:border-b-0">
            <Logo url={app.app_url} logoUrl={app.logo_url} name={app.title} className="h-8 w-8 rounded-lg text-xs" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{app.title}</p>
              <p className={`text-xs ${app.badge_verified ? "text-success" : "text-muted-foreground"}`}>
                {app.badge_verified ? "Live" : app.status === "rejected" ? "Not approved" : "Waiting for badge"}
              </p>
            </div>
            <Link href={`/launches/${app.id}/edit`} className="text-xs text-muted-foreground hover:text-foreground">
              Edit
            </Link>
            {app.status === "rejected" ? null : app.badge_verified ? (
              <Link href={`/launches/${app.id}`} className="text-xs font-medium text-foreground hover:text-primary">
                View
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => onContinue(app)}
                disabled={app.id === activeId}
                className="rounded-full border border-border px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:border-primary/50 disabled:opacity-50"
              >
                {app.id === activeId ? "Open" : "Add badge"}
              </button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ---------- steps ---------- */

function BadgeStep({
  app,
  onVerified,
  onBack,
}: {
  app: ShowcaseProject;
  onVerified: (app: ShowcaseProject) => void;
  onBack: () => void;
}) {
  const verify = useVerifyShowcaseBadge();
  const [badgePage, setBadgePage] = useState(app.badge_page_url || app.app_url || "");
  const [copied, setCopied] = useState(false);
  const [option, setOption] = useState<BadgeOption>(BADGE_OPTIONS[0]);
  const [format, setFormat] = useState<"html" | "markdown">("html");
  const snippet = badgeSnippet(app, option, format);
  const [paying, setPaying] = useState(false);
  // The $29 option only shows when online checkout is set up on the server.
  const { data: checkout } = useQuery({
    queryKey: ["sponsors", "config"],
    queryFn: () => api.get<{ enabled: boolean; listing?: number }>("/sponsors/config"),
    staleTime: 5 * 60_000,
    retry: false,
  });
  const listingPrice = checkout?.enabled && checkout.listing ? checkout.listing / 100 : null;

  const payToList = () => {
    setPaying(true);
    api
      .post<{ url: string }>("/sponsors/launch-listing", { slug: app.id })
      .then(({ url }) => window.location.assign(url))
      .catch((error) => {
        setPaying(false);
        toast.error(errorDetail(error, "Could not start checkout. Try again in a minute."));
      });
  };

  const copy = async () => {
    await navigator.clipboard.writeText(snippet);
    setCopied(true);
    toast.success("Badge code copied");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerify = () => {
    const page = normalizeUrl(badgePage);
    if (!isValidUrl(page)) {
      toast.error("Enter the full URL of the page with the badge");
      return;
    }
    verify.mutate(
      { slug: app.id, badge_page_url: page },
      {
        onSuccess: (updated) => {
          toast.success(`${updated.title} is live`);
          onVerified(updated);
        },
        onError: (error) =>
          toast.error(errorDetail(error, "Badge not found yet. Check it is on the page, then try again.")),
      },
    );
  };

  return (
    <div>
      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-primary">Go live · {app.title}</p>
      <h2 className="mt-3 max-w-[22ch] font-sans text-3xl font-semibold tracking-tight text-foreground md:text-[40px] md:leading-[1.1]">
        Put {app.title} in front of people building with Claude
      </h2>
      <p className="mt-3 max-w-[62ch] text-[15px] leading-7 text-muted-foreground">
        {app.title} is saved. It goes live free when you add our badge to your site{listingPrice !== null ? `, or right away for a one-time $${listingPrice}` : ""}.
      </p>

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
        <div className="min-w-0 space-y-12">
          <LaunchBenefits />

          <section id="badge-steps" className="scroll-mt-28">
            <div className="flex items-center gap-3">
              <h3 className="shrink-0 font-mono text-[11px] uppercase tracking-[0.16em] text-foreground">Free: add the badge</h3>
              <span className="h-px flex-1 bg-border" aria-hidden />
            </div>
            <p className="mt-3 text-[14px] leading-6 text-muted-foreground">
              Paste the badge anywhere on your site (the footer is fine) or your GitHub README. We check it, and {app.title} goes
              live with a dofollow link to your site.
            </p>

            <ol className="mt-6 space-y-8">
              <li>
                <p className="text-[14px] text-muted-foreground"><span className="font-mono text-primary">1</span>  Pick a badge and copy the code</p>
                <div role="radiogroup" aria-label="Badge style" className="mt-3 grid gap-2 sm:grid-cols-2">
                  {BADGE_OPTIONS.map((item) => {
                    const active = item.id === option.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => setOption(item)}
                        className={`flex items-center justify-between gap-3 rounded-[10px] border p-3 text-left transition-colors ${
                          active ? "border-primary ring-1 ring-primary/40" : "border-border hover:border-[var(--cad-line-hover)]"
                        } ${item.theme === "dark" ? "bg-[#2a2622]" : "bg-[#f6f3ee]"}`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element -- live SVG badge preview */}
                        <img src={badgePath(app, item)} alt={item.label} width={item.width} height={item.height} className="max-w-[75%]" />
                        <span className={`shrink-0 text-[11px] ${item.theme === "dark" ? "text-[#e9e2d8]" : "text-[#4a4239]"}`}>{active ? "✓" : ""}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-4 flex items-center gap-4 text-xs">
                  {(["html", "markdown"] as const).map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setFormat(item)}
                      aria-pressed={format === item}
                      className={format === item ? "font-medium text-foreground underline underline-offset-4" : "text-muted-foreground hover:text-foreground"}
                    >
                      {item === "html" ? "HTML (website)" : "Markdown (GitHub README)"}
                    </button>
                  ))}
                </div>
                <div className="relative mt-2">
                  <pre className="whitespace-pre-wrap break-all rounded-[10px] bg-foreground/[0.06] p-4 pr-24 font-mono text-xs leading-5 text-muted-foreground">{snippet}</pre>
                  <button
                    type="button"
                    onClick={copy}
                    className="absolute right-2 top-2 inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-background px-2.5 text-xs font-medium text-foreground hover:border-[var(--cad-line-hover)]"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
              </li>
              <li>
                <Field label="2  Where did you add it?" htmlFor="badge_page" hint="Homepage or GitHub README">
                  <input
                    id="badge_page"
                    type="url"
                    inputMode="url"
                    value={badgePage}
                    onChange={(event) => setBadgePage(event.target.value)}
                    placeholder="https://yourapp.com"
                    className={inputClass}
                  />
                </Field>
              </li>
              <li>
                <button
                  type="button"
                  onClick={handleVerify}
                  disabled={verify.isPending}
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[12px] bg-foreground text-[15px] font-medium text-background transition-colors hover:bg-foreground/85 disabled:opacity-60"
                >
                  {verify.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />}
                  {verify.isPending ? "Checking your page..." : "Verify badge and go live"}
                </button>
                <p className="mt-2 text-center text-xs text-muted-foreground">Just deployed? Give it a minute, then verify.</p>
              </li>
            </ol>
          </section>

          <div className="flex items-center justify-between border-t border-border pt-4 text-sm">
            <button type="button" onClick={onBack} className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-3.5 w-3.5" />
              Launch another app
            </button>
            <span className="text-xs text-muted-foreground">Not ready? It stays saved under Your launches.</span>
          </div>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24">
          {listingPrice !== null ? (
            <div className="rounded-[14px] border border-border bg-card p-5">
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-[15px] font-medium text-foreground">Skip the badge</p>
                <p>
                  <span className="text-[28px] font-semibold tabular-nums text-foreground">${listingPrice}</span>
                  <span className="ml-1 text-sm text-muted-foreground">one-time</span>
                </p>
              </div>
              <button
                type="button"
                onClick={payToList}
                disabled={paying}
                className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-[12px] bg-primary text-[15px] font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {paying ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
                {paying ? "Opening checkout..." : `Go live now for $${listingPrice}`}
              </button>
              <ul className="mt-5 space-y-2.5 text-[13.5px] leading-5 text-muted-foreground">
                {[
                  "Live as soon as payment clears, no code to add",
                  "Same launch page with upvotes and comments",
                  "On the homepage and the launches list",
                  "Your analytics: impressions, views and clicks",
                ].map((item) => (
                  <li key={item} className="flex gap-2.5">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-5 border-t border-border pt-4 text-xs leading-5 text-muted-foreground">
                Paid listings link to your site as sponsored. Badge listings get a dofollow link. Secure payment by Stripe, no
                subscription.
              </p>
            </div>
          ) : null}
          <div className="text-center text-[13px] leading-6 text-muted-foreground">
            <a href="#badge-steps" className="font-medium text-foreground underline underline-offset-4">Go live free with the badge</a>
            <p>Takes a minute, and you keep a dofollow link.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}

/** Why go live: what a launch gets, with the directory's real last-30-day numbers. */
function LaunchBenefits() {
  const { data } = useQuery({
    queryKey: ["stats", "open"],
    queryFn: () => api.get<{ summary: Record<string, { range?: number; all_time?: number }> }>("/stats/open"),
    staleTime: 10 * 60_000,
  });
  const s = data?.summary;
  const items = [
    { icon: Home, title: "On the homepage", body: "Live launches are listed in Built with Claude on the homepage, the launches page and the community feed sidebar, ranked by upvotes." },
    { icon: MessageSquare, title: "A launch page people can respond to", body: "Upvotes, comments and your first comment as the maker, so visitors can ask questions and give feedback." },
    { icon: BarChart3, title: "Your own analytics", body: "See impressions, page views and clicks to your website for your launch, day by day." },
    { icon: Link2, title: "A dofollow backlink", body: "Launches with our badge link to your site with a dofollow link, which helps you rank in search." },
  ];
  return (
    <div>
      <ul className="space-y-7">
        {items.map(({ icon: Icon, title, body }) => (
          <li key={title} className="flex gap-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] border border-border bg-card text-primary">
              <Icon className="h-4 w-4" />
            </span>
            <div>
              <p className="text-[16px] font-medium text-foreground">{title}</p>
              <p className="mt-1 text-[14.5px] leading-6 text-muted-foreground">{body}</p>
            </div>
          </li>
        ))}
      </ul>
      {s && (
        <div className="mt-10">
          <div className="flex items-center gap-3">
            <p className="shrink-0 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Claude AI Directory, last 30 days</p>
            <span className="h-px flex-1 bg-border" aria-hidden />
            <Link href="/stats" className="shrink-0 text-xs text-primary hover:underline">Open stats ↗</Link>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-[10px] border border-border bg-border sm:grid-cols-4">
            {[
              ["listing_views", s.listing_views?.range],
              ["install_actions", s.installs?.range],
              ["new_members", s.members?.range],
              ["apps_launched", s.launches?.all_time],
            ].map(([label, value]) => (
              <div key={label as string} className="bg-card px-4 py-3">
                <p className="font-mono text-[11px] text-muted-foreground">{label}</p>
                <p className="mt-1 font-mono text-[18px] tabular-nums text-foreground">{typeof value === "number" ? value.toLocaleString("en-US") : "-"}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ShareStep({ app, onAnother }: { app: ShowcaseProject; onAnother: () => void }) {
  const url = listingUrl(app);
  const text = `I just launched ${app.title} on Claude AI Directory. ${app.tagline || ""}`.trim();
  const shareOnX = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
  const shareOnLinkedIn = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;

  const copy = async () => {
    await navigator.clipboard.writeText(url);
    toast.success("Link copied");
  };

  const button =
    "inline-flex h-10 items-center justify-center gap-2 rounded-full border border-border bg-card px-4 text-sm font-medium text-foreground transition-colors hover:border-[var(--cad-line-hover)]";

  return (
    <div className="rounded-lg border border-border bg-card p-5 sm:p-7">
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-success/15 text-success">
        <Check className="h-5 w-5" />
      </span>
      <h2 className="mt-4 text-xl font-semibold text-foreground">{app.title} is live</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        Share your listing to collect upvotes and feedback. Launches with early upvotes rank higher on the launches page.
      </p>

      <div className="mt-5 flex items-center gap-2 rounded-lg border border-border bg-background p-1.5 pl-3.5">
        <span className="min-w-0 flex-1 truncate text-sm text-foreground">{url}</span>
        <button type="button" onClick={copy} className="inline-flex h-8 items-center gap-1.5 rounded-md bg-foreground px-3 text-xs font-medium text-background">
          <Copy className="h-3.5 w-3.5" />
          Copy
        </button>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <a href={shareOnX} target="_blank" rel="noopener noreferrer" className={button}>
          Share on X
        </a>
        <a href={shareOnLinkedIn} target="_blank" rel="noopener noreferrer" className={button}>
          <Linkedin className="h-4 w-4" />
          LinkedIn
        </a>
        <Link href={`/launches/${app.id}`} className={button}>
          View listing
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>

      <button type="button" onClick={onAnother} className="mt-6 text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground">
        Launch another app
      </button>
    </div>
  );
}

/* ---------- page ---------- */

export default function SubmitLaunchClient() {
  const { isAuthenticated, isLoading } = useAuth();
  const submit = useSubmitShowcaseProject();
  const autofill = useLaunchAutofill();
  const { data: myApps } = useMyShowcaseProjects({ enabled: !isLoading && isAuthenticated });

  // Back from Stripe: the webhook puts the launch live a few seconds after payment.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const listing = params.get("listing");
    if (!listing) return;
    const launch = params.get("launch");
    const timer = window.setTimeout(() => {
      if (listing === "paid") {
        toast.success("Payment received. Your launch goes live in a few seconds.", {
          action: launch ? { label: "View", onClick: () => window.location.assign(`/launches/${launch}`) } : undefined,
          duration: 10000,
        });
      } else if (listing === "cancelled") {
        toast("Checkout cancelled. Your launch is still saved.");
      }
    }, 400);
    window.history.replaceState(null, "", window.location.pathname);
    return () => window.clearTimeout(timer);
  }, []);

  const [form, setForm] = useState<Form>(EMPTY_FORM);
  const [step, setStep] = useState<Step>(0);
  // Step 0 has three stages: the website, reading it, then reviewing the filled-in form.
  const [stage, setStage] = useState<"url" | "reading" | "form">("url");
  const [activeApp, setActiveApp] = useState<ShowcaseProject | null>(null);
  const [filledFrom, setFilledFrom] = useState<string | null>(null);
  const { data: uploadConfig } = useUploadConfig();
  const [media, setMedia] = useState<Media>({ logo: [], screenshot: [], video: [] });
  const [uploading, setUploading] = useState<Record<keyof Media, boolean>>({ logo: false, screenshot: false, video: false });
  const [mediaKey, setMediaKey] = useState(0);
  const anyUploading = Object.values(uploading).some(Boolean);

  const set = <K extends keyof Form>(key: K, value: Form[K]) => setForm((current) => ({ ...current, [key]: value }));

  const apps = useMemo(() => {
    const list = myApps ?? [];
    // Show the app being worked on even before the list refetches.
    if (activeApp && !list.some((app) => app.id === activeApp.id)) return [activeApp, ...list];
    return list.map((app) => (app.id === activeApp?.id ? activeApp : app));
  }, [myApps, activeApp]);

  const fillFrom = (meta: LaunchAutofill) =>
    // Only fill empty fields: never overwrite what the creator typed.
    setForm((current) => ({
      ...current,
      title: current.title || meta.name || "",
      tagline: current.tagline || meta.tagline || "",
      description: current.description || meta.description || "",
      images: current.images || meta.image || "",
      twitter: current.twitter || meta.twitter || "",
    }));

  // A starting point for the maker's first comment; they edit it before submitting.
  const draftMakerComment = () =>
    setForm((current) =>
      current.maker_comment
        ? current
        : {
            ...current,
            maker_comment: `Hey everyone, I'm the maker of ${current.title || "this app"}.${current.tagline ? ` ${current.tagline.replace(/[.!]*$/, ".")}` : ""}\n\nI built it because ...\n\nI'd love your feedback on ...`,
          },
    );

  // "What are you launching?" -> read the site (at least as long as the progress screen) -> review.
  const startFromUrl = async (raw: string) => {
    const url = normalizeUrl(raw);
    if (!isValidUrl(url)) {
      toast.error("That doesn't look like a website. Try something like yourapp.com");
      return;
    }
    set("app_url", url);
    setStage("reading");
    track("launch_url_entered", {});
    const started = Date.now();
    try {
      fillFrom(await autofill.mutateAsync(url));
    } catch {
      // Reading is a convenience: on failure the form is simply filled in by hand.
    }
    setFilledFrom(url);
    await new Promise((resolve) => window.setTimeout(resolve, Math.max(0, 3600 - (Date.now() - started))));
    draftMakerComment();
    setStage("form");
  };

  const runAutofill = (raw: string) => {
    const url = normalizeUrl(raw);
    if (!isValidUrl(url) || url === filledFrom || autofill.isPending) return;
    autofill.mutate(url, {
      onSuccess: (meta) => {
        setFilledFrom(url);
        fillFrom(meta);
      },
      // Auto-fill is a convenience: on any failure, the form just stays manual.
      onError: () => setFilledFrom(url),
    });
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const appUrl = normalizeUrl(form.app_url);
    if (!isValidUrl(appUrl)) {
      toast.error("Add your app's full URL, like https://yourapp.com");
      return;
    }
    if (anyUploading) {
      toast.error("Wait for your uploads to finish");
      return;
    }
    if (!form.title.trim() || !form.description.trim()) {
      toast.error("Name and description are required");
      return;
    }
    if (form.maker_comment.trim().length < 20 || /because \.\.\.|feedback on \.\.\./.test(form.maker_comment)) {
      toast.error("Finish your first comment: replace the ... parts with your own words");
      document.getElementById("maker_comment")?.focus();
      return;
    }
    const overview = {
      audience: form.audience.trim() || undefined,
      problem: form.problem.trim() || undefined,
      solution: form.solution.trim() || undefined,
      unique: form.unique.trim() || undefined,
    };
    const socials = {
      twitter: socialUrl(form.twitter, "https://x.com/"),
      github: socialUrl(form.github, "https://github.com/"),
      linkedin: socialUrl(form.linkedin, "https://www.linkedin.com/in/"),
    };
    submit.mutate(
      {
        title: form.title.trim(),
        tagline: form.tagline.trim() || undefined,
        description: form.description.trim(),
        app_url: appUrl,
        demo_url: appUrl,
        badge_page_url: appUrl,
        github_url: form.github_url.trim() || undefined,
        category: form.category,
        tech_stack: splitList(form.tags),
        skills_used: [],
        use_cases: splitList(form.use_cases, /\n/),
        feedback_prompt: form.feedback_prompt.trim() || undefined,
        maker_comment: form.maker_comment.trim(),
        gallery_images: [...media.screenshot, ...splitList(form.images, /\s*\n\s*/).filter(isValidUrl)].slice(0, 8),
        logo_url: media.logo[0],
        video_url: media.video[0],
        demo_video_url: form.demo_video_url.trim() || undefined,
        platforms: form.platforms,
        overview: Object.values(overview).some(Boolean) ? overview : undefined,
        creator_socials: Object.values(socials).some(Boolean) ? socials : undefined,
      },
      {
        onSuccess: (project) => {
          track("launch_submitted", { slug: project.id, category: form.category });
          setActiveApp(project);
          setStep(1);
          window.scrollTo({ top: 0, behavior: "smooth" });
        },
        onError: (error) =>
          toast.error(
            error instanceof ApiError && error.status === 409
              ? "That app URL is already listed. Check Your launches."
              : errorDetail(error, "Could not save your launch. Please try again."),
          ),
      },
    );
  };

  const startOver = () => {
    setForm(EMPTY_FORM);
    setMedia({ logo: [], screenshot: [], video: [] });
    setUploading({ logo: false, screenshot: false, video: false });
    setMediaKey((key) => key + 1);
    setFilledFrom(null);
    setActiveApp(null);
    setStage("url");
    setStep(0);
  };

  const continueApp = (app: ShowcaseProject) => {
    setActiveApp(app);
    setStep(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (isLoading) return null;
  // The details step is a single quiet column, like DevHunt; badge and share keep the stepper and side panel.
  const focused = isAuthenticated && step === 0;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className={`mx-auto px-4 pb-20 pt-8 md:px-8 md:pt-12 ${focused ? "max-w-[680px]" : "max-w-[1080px]"}`}>
          <Link href="/launches" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" />
            App launches
          </Link>
          {!isAuthenticated && (
            <>
              <h1 className="mt-5 text-3xl font-semibold text-foreground md:text-4xl">Launch your app</h1>
              <p className="mt-2 max-w-[60ch] text-base leading-7 text-muted-foreground">
                Get a public page for what you built with Claude, collect upvotes and feedback from builders. It takes about a minute.
              </p>
              <div className="mt-6 max-w-[760px]">
                <DofollowBanner cta={false} />
              </div>
            </>
          )}

          {!isAuthenticated ? (
            <div className="mt-8 max-w-[560px] rounded-lg border border-border bg-card p-6">
              <ol className="space-y-3 text-sm text-muted-foreground">
                <li><span className="font-medium text-foreground">1. Details.</span> Paste your URL, we fill in the rest.</li>
                <li><span className="font-medium text-foreground">2. Badge.</span> Add a small badge to your site and verify.</li>
                <li><span className="font-medium text-foreground">3. Share.</span> Your page goes live and ranks by upvotes.</li>
              </ol>
              <SignInButton
                reason="launch your app"
                className="mt-6 inline-flex h-11 cursor-pointer items-center gap-2 rounded-full bg-foreground px-5 text-sm font-medium text-background hover:bg-foreground/85"
              >
                Sign in to launch
                <ArrowRight className="h-4 w-4" />
              </SignInButton>
            </div>
          ) : (
            <>
              {!focused && (
                <div className="mt-8">
                  <Stepper step={step} />
                </div>
              )}

              <div className={focused || step === 1 ? "mt-10" : "mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start"}>
                <div className="min-w-0">
                  {step === 1 && activeApp ? (
                    <BadgeStep
                      app={activeApp}
                      onBack={startOver}
                      onVerified={(updated) => {
                        setActiveApp(updated);
                        setStep(2);
                      }}
                    />
                  ) : step === 2 && activeApp ? (
                    <ShareStep app={activeApp} onAnother={startOver} />
                  ) : stage === "url" ? (
                    <>
                      <LaunchStart initialUrl={form.app_url} onContinue={(url) => void startFromUrl(url)} onManual={() => {
                          draftMakerComment();
                          setStage("form");
                        }} />
                      {apps.length > 0 && (
                        <div className="mt-14">
                          <MyLaunches apps={apps} onContinue={continueApp} />
                        </div>
                      )}
                    </>
                  ) : stage === "reading" ? (
                    <LaunchReading url={form.app_url} />
                  ) : (
                    <form onSubmit={handleSubmit} noValidate>
                      <div className="mb-10">
                        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-primary">Launch</p>
                        <h2 className="mt-3 font-sans text-3xl font-semibold tracking-tight text-foreground md:text-4xl">Review your launch</h2>
                        {autofill.isSuccess && filledFrom ? (
                          <p className="mt-3 rounded-lg border border-green-500/30 bg-green-500/[0.06] px-3.5 py-2.5 font-mono text-xs text-green-600 dark:text-green-400">
                            ✓ Filled in from {filledFrom.replace(/^https?:\/\//, "")}. Check everything, then continue.
                          </p>
                        ) : filledFrom ? (
                          <p className="mt-3 text-sm text-muted-foreground">We couldn&apos;t read that page, so fill in the details below.</p>
                        ) : (
                          <p className="mt-2 text-sm text-muted-foreground">Tell builders what you made. Only the basics are required.</p>
                        )}
                      </div>

                      <div className="space-y-12">
                        <FormSection n="01" title="The basics">
                        <Field label="Your app's URL" htmlFor="app_url" required>
                          <div className="flex gap-2">
                            <input
                              id="app_url"
                              type="url"
                              inputMode="url"
                              autoFocus
                              value={form.app_url}
                              onChange={(event) => set("app_url", event.target.value)}
                              onBlur={(event) => runAutofill(event.target.value)}
                              placeholder="https://yourapp.com"
                              className={inputClass}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setFilledFrom(null);
                                runAutofill(form.app_url);
                              }}
                              disabled={autofill.isPending || !form.app_url.trim()}
                              className="inline-flex h-12 shrink-0 items-center gap-1.5 rounded-[10px] bg-foreground/[0.06] px-4 text-sm font-medium text-foreground transition-colors hover:bg-foreground/[0.1] disabled:opacity-50"
                            >
                              {autofill.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                              <span className="hidden sm:inline">{autofill.isPending ? "Reading..." : "Auto-fill"}</span>
                            </button>
                          </div>
                          {autofill.isPending && <p className="text-xs text-muted-foreground" aria-live="polite">Reading your page...</p>}
                        </Field>

                        <div className="space-y-6">
                          <Field label="Name" htmlFor="title" required>
                            <input id="title" value={form.title} onChange={(e) => set("title", e.target.value)} maxLength={80} placeholder="Claude Desk" className={inputClass} />
                          </Field>
                          <Field label="One-line pitch" htmlFor="tagline" hint={`${form.tagline.length}/140`}>
                            <input id="tagline" value={form.tagline} onChange={(e) => set("tagline", e.target.value)} maxLength={140} placeholder="Turn customer notes into Claude workflows" className={inputClass} />
                          </Field>
                        </div>

                        <div className="space-y-1.5">
                          <p className="text-sm font-medium text-foreground">Category</p>
                          <ChipGroup label="Category" options={CATEGORIES} value={[form.category]} onToggle={(option) => set("category", option)} />
                        </div>

                        <Field label="What does it do?" htmlFor="description" required hint={`${form.description.length}/2000`}>
                          <textarea
                            id="description"
                            value={form.description}
                            onChange={(e) => set("description", e.target.value)}
                            maxLength={2000}
                            rows={5}
                            placeholder="Who is it for, how does it use Claude, and what should people try first?"
                            className={textareaClass}
                          />
                        </Field>
                        </FormSection>

                        <FormSection n="02" title="Media" hint="Optional. Screenshots get more upvotes.">
                      {uploadConfig?.enabled && (
                        <div key={mediaKey} className="space-y-5">
                          <MediaUpload
                            kind="logo"
                            max={1}
                            limits={uploadConfig.limits.logo}
                            label="Logo"
                            hint="Square PNG, JPG or WEBP, up to 2 MB"
                            onChange={(urls) => setMedia((m) => ({ ...m, logo: urls }))}
                            onBusyChange={(busy) => setUploading((u) => ({ ...u, logo: busy }))}
                          />
                          <MediaUpload
                            kind="screenshot"
                            max={6}
                            limits={uploadConfig.limits.screenshot}
                            label="Screenshots"
                            hint="Up to 6, 5 MB each. The first one is your cover."
                            onChange={(urls) => setMedia((m) => ({ ...m, screenshot: urls }))}
                            onBusyChange={(busy) => setUploading((u) => ({ ...u, screenshot: busy }))}
                          />
                        </div>
                      )}

                          {!uploadConfig?.enabled && (
                            <Field label="Screenshots" htmlFor="images" hint="Image URLs, one per line">
                              <textarea id="images" value={form.images} onChange={(e) => set("images", e.target.value)} rows={3} placeholder="https://yourapp.com/screenshot.png" className={textareaClass} />
                            </Field>
                          )}
                        </FormSection>

                        <FormSection n="03" title="Your first comment">
                          <Field label="Say hi as the maker" htmlFor="maker_comment" required hint={`${form.maker_comment.length}/2000`}>
                            <p className="text-xs leading-5 text-muted-foreground">
                              Posted on your launch page under your name, so visitors know you&apos;re around. Say why you built it and what
                              feedback you want. We drafted a start: replace the ... parts.
                            </p>
                            <textarea
                              id="maker_comment"
                              value={form.maker_comment}
                              onChange={(e) => set("maker_comment", e.target.value)}
                              maxLength={2000}
                              rows={6}
                              className={textareaClass}
                            />
                          </Field>
                        </FormSection>
                      </div>

                      <div className="mt-12 space-y-3">
                        <button
                          type="submit"
                          disabled={submit.isPending || anyUploading}
                          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[12px] bg-primary text-[15px] font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
                        >
                          {submit.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                          {submit.isPending ? "Saving..." : anyUploading ? "Uploading..." : "Continue to badge"}
                          {!submit.isPending && <ArrowRight className="h-4 w-4" />}
                        </button>
                        <p className="text-center text-xs text-muted-foreground">Nothing is public until the badge is verified. Add the story, video, platforms and links any time from Edit.</p>
                      </div>
                    </form>
                  )}
                </div>

                {!focused && step !== 1 && <aside className="space-y-4 lg:sticky lg:top-24">
                  {step === 0 && stage === "form" && <LivePreview form={form} media={media} />}
                  <MyLaunches apps={apps} onContinue={continueApp} />
                </aside>}
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
