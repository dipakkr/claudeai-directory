import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { launchTheme } from "@/lib/launch-theme";
import { notFound, permanentRedirect } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  ExternalLink,
  Github,
  Linkedin,
} from "lucide-react";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FavoriteButton from "@/components/shared/FavoriteButton";
import LaunchDiscussion from "@/components/launches/LaunchDiscussion";
import { faviconFor } from "@/lib/directory";
import { fetchApi } from "@/lib/api-server";
import type { ShowcaseProject } from "@/types";
import {
  OverviewSection,
  GalleryCarousel,
  DemoVideoSection,
  SimilarProductsCarousel,
  FaviconBox,
  LaunchSection,
  Chip,
  UpvoteBox,
  UpvoteSummary,
  OwnerEditButton,
} from "@/components/launches";
import { trackAttrs } from "@/lib/track-attrs";
import { ViewTracker } from "@/components/tracking/ViewTracker";
import { MakerPhoto } from "@/components/launches/MakerPhoto";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.claudeai.directory";

function hostFromUrl(url?: string) {
  if (!url) return "";
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
  }
}

function formatDate(value?: string) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function splitUseCases(useCases?: string[]) {
  return (useCases ?? [])
    .flatMap((item) => item.split(";"))
    // Some listings pack use cases into one string as "1. ... 2. ... 3. ...";
    // split those into separate items too.
    .flatMap((item) => item.split(/(?:^|\s)\d+\.\s+/))
    .map((item) => item.trim())
    .filter(Boolean);
}


function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="border-b border-border py-4 last:border-b-0">
      <h3 className="text-sm font-semibold text-foreground">{label}</h3>
      <div className="mt-2.5 flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] uppercase tracking-[0.06em] text-muted-foreground">{label}</p>
      <div className="mt-1 text-sm tabular-nums text-foreground">{children}</div>
    </div>
  );
}

/** Cut text at a word boundary so it fits `max` characters. */
function fitText(text: string, max: number) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max + 1);
  const space = cut.lastIndexOf(" ");
  return (space > max * 0.6 ? cut.slice(0, space) : text.slice(0, max))
    .replace(/[\s,;:.-]+$/, "")
    // Never end on a dangling joining word ("... clients and").
    .replace(/\s+(and|or|the|of|for|with|to|a|an|in|on|your|&)$/i, "")
    .replace(/[\s,;:.-]+$/, "");
}

/** "{App}: {tagline}" within 60 characters; just the app name when there is no room. */
function launchTitle(name: string, tagline?: string | null) {
  const clean = (tagline || "").trim().replace(/[.!]+$/, "");
  if (!clean) return `${name}: Built with Claude`;
  const full = `${name}: ${clean}`;
  if (full.length <= 60) return full;
  const room = 60 - name.length - 2;
  return room >= 20 ? `${name}: ${fitText(clean, room)}` : name;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await fetchApi<ShowcaseProject>(`/showcase/${slug}`);

  if (!project) return { title: "App Not Found" };

  const title = { absolute: launchTitle(project.title, project.tagline) };
  const maker = project.author_name || project.author_username;
  const pitch = (project.tagline || project.description || "").trim().replace(/\s+/g, " ");
  const description = fitText(
    [pitch.replace(/[.!]*$/, "."), maker ? `Built with Claude by ${maker}.` : "Built with Claude.", "See it, upvote it and share feedback."]
      .filter((part) => part !== ".")
      .join(" "),
    160,
  );

  return {
    title,
    description,
    alternates: { canonical: `/launches/${slug}` },
    robots: {
      index: true,
      follow: false,
      googleBot: {
        index: true,
        follow: false,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      title: title.absolute,
      description,
      url: `${SITE_URL}/launches/${slug}`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: title.absolute,
      description,
    },
  };
}

export default async function LaunchDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [project, allProjects] = await Promise.all([
    fetchApi<ShowcaseProject>(`/showcase/${slug}`),
    fetchApi<ShowcaseProject[]>(`/showcase?limit=100`),
  ]);

  if (!project) notFound();
  // Merged duplicates keep their old slugs as aliases: send those URLs to the real one.
  if (project.id && project.id !== slug) permanentRedirect(`/launches/${project.id}`);

  const appUrl = project.app_url || project.demo_url;
  // Verified badge = the maker links back to us, so the website link is dofollow.
  // Paid-only listings are paid links, so they are marked sponsored (Google's rule for paid links).
  const websiteRel = project.badge_verified
    ? "noopener noreferrer"
    : project.paid_listing
      ? "sponsored nofollow noopener noreferrer"
      : "nofollow noopener noreferrer";
  const listedDate = formatDate(project.listed_at || project.created_at);
  const useCases = splitUseCases(project.use_cases);
  const publisherHost = hostFromUrl(appUrl);
  const builderName = project.author_name || project.author_username || "Claude AI community member";
  const authorHref = project.author_username ? `/u/${project.author_username}` : null;
  const socials = project.creator_socials ?? {};
  const upvotes = project.upvotes ?? 0;
  const aboutBlocks = (project.description || "")
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);
  const galleryImages = (project.gallery_images?.length ? project.gallery_images : project.images ?? []).filter(Boolean);
  const platforms = project.platforms ?? [];
  const techStack = (project.tech_stack ?? []).filter((tech) => !platforms.includes(tech));
  const collections = project.collections ?? [];
  const comparisons = project.comparisons ?? [];
  const logo = project.logo_url || faviconFor(appUrl);

  const pageUrl = `${SITE_URL}/launches/${slug}`;
  const shareText = `${project.title}: ${project.tagline || "launched on Claude Directory"}`;
  const shareOnX = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(pageUrl)}`;
  const shareOnLinkedIn = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}`;

  const secondaryButton =
    "inline-flex h-10 items-center gap-2 rounded-full border border-border bg-card px-4 text-sm text-foreground transition-colors hover:border-[var(--cad-line-hover)]";

  // The launch's colour (same as its share card), as a soft band behind the header.
  const theme = launchTheme(project.id);

  return (
    <div className="relative min-h-screen bg-background">
      <Header />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-0 hidden h-[420px] opacity-70 dark:block"
        style={{ background: `linear-gradient(180deg, ${theme.bottom} 0%, ${theme.top}99 45%, transparent 100%)` }}
      />
      <main className="relative mx-auto max-w-[820px] px-4 pb-20 pt-8 md:px-8 md:pt-10">
        <Link
          href="/launches"
          aria-label="Back to app launches"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          App launches
        </Link>

        <article className="mt-6">
          {/* Header: logo, name, pitch, then one row of actions. No boxes. */}
          <header>
            <div className="flex items-start gap-4 md:gap-5">
              <FaviconBox
                src={logo}
                name={project.title}
                className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[12px] border border-white/10 bg-black/20 text-xl font-semibold text-muted-foreground md:h-[72px] md:w-[72px]"
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                  <h1 className="text-balance text-[26px] font-semibold leading-tight text-foreground md:text-[32px]">{project.title}</h1>
                  {project.badge_verified && <BadgeCheck className="h-5 w-5 shrink-0 fill-amber-400 text-background" aria-label="Badge verified" />}
                </div>
                {project.tagline && <p className="mt-1.5 max-w-[640px] text-[15px] leading-7 text-muted-foreground md:text-base">{project.tagline}</p>}
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2.5">
              {appUrl && (
                <a
                  href={appUrl}
                  target="_blank"
                  rel={websiteRel}
                  data-launch-click={project.id}
                  {...trackAttrs("website_clicked", { slug: project.id })}
                  className="inline-flex h-10 items-center gap-2 rounded-full bg-foreground px-5 text-sm font-medium text-background transition-colors hover:bg-foreground/85"
                >
                  Visit website
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
              <UpvoteBox slug={project.id} title={project.title} initialCount={upvotes} websiteUrl={appUrl} websiteRel={websiteRel} compact />
              {project.github_url && (
                <a href={project.github_url} target="_blank" rel="nofollow noopener noreferrer" className={secondaryButton}>
                  <Github className="h-4 w-4" />
                  Source
                </a>
              )}
              <FavoriteButton targetType="showcase" targetId={project.id} />
              <OwnerEditButton slug={project.id} authorId={project.author_id} />
            </div>

            {/* One quiet meta line */}
            <p className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[12px] text-muted-foreground">
              {[project.category, (project.views ?? 0) > 0 ? `${(project.views ?? 0).toLocaleString()} ${project.views === 1 ? "view" : "views"}` : null, listedDate ? `launched ${listedDate}` : null]
                .filter(Boolean)
                .map((item, i) => (
                  <span key={i} className="inline-flex items-center gap-2">
                    {i > 0 && <span aria-hidden>·</span>}
                    {item}
                  </span>
                ))}
            </p>
            <div className="mt-4">
              <UpvoteSummary slug={project.id} initialCount={upvotes} />
            </div>
          </header>

          <ViewTracker type="launch" id={project.id} />

          {/* Section tabs, sticky under the site header */}
          <nav aria-label="Launch sections" className="sticky top-16 z-20 -mx-4 mt-8 border-b border-border bg-background/95 px-4 backdrop-blur md:-mx-8 md:px-8">
            <div className="flex gap-6 overflow-x-auto text-sm">
              {[
                ["#discussion", "Comments"],
                ["#about", "About"],
                ["#maker", "Maker"],
                ["#related", "Related"],
              ].map(([href, label]) => (
                <a key={href} href={href} className="-mb-px whitespace-nowrap border-b-2 border-transparent py-3 text-muted-foreground transition-colors hover:border-foreground hover:text-foreground">
                  {label}
                </a>
              ))}
            </div>
          </nav>

          <div className="mt-8 space-y-12">
            <section id="discussion" className="scroll-mt-32">
            <LaunchDiscussion
              slug={project.id}
              title={project.title}
              intro={
                project.feedback_prompt ? (
                  <div className="flex gap-3">
                    <MakerPhoto src={project.author_avatar} name={project.author_name} size="sm" />
                    <div className="min-w-0">
                      <p className="text-sm">
                        <span className="font-semibold text-foreground">{builderName}</span>
                        <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">Maker</span>
                      </p>
                      <p className="mt-1.5 text-sm leading-7 text-foreground/85">{project.feedback_prompt}</p>
                    </div>
                  </div>
                ) : undefined
              }
            />
            </section>

            {aboutBlocks.length > 0 && (
              <LaunchSection id="about" title={`About ${project.title}`}>
                <div className="space-y-4">
                  {aboutBlocks.map((block) => (
                    <p key={block} className="whitespace-pre-line text-[15px] leading-7 text-foreground/85">
                      {block}
                    </p>
                  ))}
                </div>
              </LaunchSection>
            )}

          <GalleryCarousel images={galleryImages} title={project.title} />

          <DemoVideoSection project={project} />

          <OverviewSection project={project} useCases={useCases} />

          <LaunchSection id="maker" title="The maker">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <MakerPhoto src={project.author_avatar} name={project.author_name} />
                <div className="min-w-0">
                  {authorHref ? (
                    <Link href={authorHref} className="font-semibold text-foreground hover:text-primary">
                      {builderName}
                    </Link>
                  ) : (
                    <p className="font-semibold text-foreground">{builderName}</p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Maker{project.author_username ? ` · @${project.author_username}` : ""}
                  </p>
                </div>
              </div>
              {(socials.twitter || socials.github || socials.linkedin) && (
                <div className="flex gap-2">
                  {socials.twitter && (
                    <a href={socials.twitter} target="_blank" rel="noopener noreferrer" aria-label="X" className={`${secondaryButton} w-10 justify-center px-0`}>
                      <XIcon className="h-3.5 w-3.5" />
                    </a>
                  )}
                  {socials.github && (
                    <a href={socials.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub" className={`${secondaryButton} w-10 justify-center px-0`}>
                      <Github className="h-4 w-4" />
                    </a>
                  )}
                  {socials.linkedin && (
                    <a href={socials.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className={`${secondaryButton} w-10 justify-center px-0`}>
                      <Linkedin className="h-4 w-4" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </LaunchSection>

          <LaunchSection title="Details" padded={false}>
            {/* Short facts on one line (wraps on phones); multi-value rows follow. */}
            <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-x-6 gap-y-4 border-b border-border py-4 last:border-b-0">
              {project.category && <Fact label="Category">{project.category}</Fact>}
              {appUrl && (
                <Fact label="Website">
                  <a
                    href={appUrl}
                    target="_blank"
                    rel={websiteRel}
                    data-launch-click={project.id}
                    className="inline-flex items-center gap-1.5 text-foreground hover:text-primary"
                  >
                    {publisherHost || "Open website"}
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </Fact>
              )}
              <Fact label="Launched">{listedDate || "Recently"}</Fact>
            </div>
            {platforms.length > 0 && (
              <DetailRow label="Platforms">
                {platforms.map((item) => (
                  <Chip key={item}>{item}</Chip>
                ))}
              </DetailRow>
            )}
            {techStack.length > 0 && (
              <DetailRow label="Tech stack">
                {techStack.map((item) => (
                  <Chip key={item}>{item}</Chip>
                ))}
              </DetailRow>
            )}
            {collections.length > 0 && (
              <DetailRow label="Collections">
                {collections.map((item) => (
                  <Chip key={item}>{item}</Chip>
                ))}
              </DetailRow>
            )}
          </LaunchSection>

          {comparisons.length > 0 && (
            <LaunchSection title="Compare">
              <div className="flex flex-wrap gap-2">
                {comparisons.map((item) => (
                  <Chip key={item}>{item}</Chip>
                ))}
              </div>
            </LaunchSection>
          )}

            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span>Share this launch</span>
              <a href={shareOnX} target="_blank" rel="noopener noreferrer" aria-label="Share on X" className="transition-colors hover:text-foreground">
                <XIcon className="h-4 w-4" />
              </a>
              <a href={shareOnLinkedIn} target="_blank" rel="noopener noreferrer" aria-label="Share on LinkedIn" className="transition-colors hover:text-foreground">
                <Linkedin className="h-4 w-4" />
              </a>
            </div>

            <div id="related" className="scroll-mt-32">
              <SimilarProductsCarousel currentProject={project} projects={allProjects ?? []} />
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
