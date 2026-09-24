import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  ExternalLink,
  Github,
  Linkedin,
  MessageCircle,
  Tag,
  UserRound,
} from "lucide-react";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FavoriteButton from "@/components/shared/FavoriteButton";
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
} from "@/components/launches";

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

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function MakerAvatar({ name, size = "base" }: { name?: string; size?: "sm" | "base" }) {
  const dimension = size === "sm" ? "h-9 w-9 text-xs" : "h-12 w-12 text-sm";
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full border border-border bg-card font-semibold text-muted-foreground ${dimension}`}
    >
      {name ? initials(name) : <UserRound className="h-5 w-5" />}
    </span>
  );
}

function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="border-b border-border px-5 py-5 last:border-b-0 md:px-8">
      <h3 className="text-sm font-semibold text-foreground">{label}</h3>
      <div className="mt-2.5 flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await fetchApi<ShowcaseProject>(`/showcase/${slug}`);

  if (!project) return { title: "App Not Found" };

  const title = `${project.title} | Claude App Showcase`;
  const description =
    project.tagline || project.description?.slice(0, 155) || `${project.title} in the Claude AI community`;

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
      title,
      description,
      url: `${SITE_URL}/launches/${slug}`,
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
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

  const appUrl = project.app_url || project.demo_url;
  const listedDate = formatDate(project.listed_at || project.created_at);
  const feedbackHref = `/community?search=${encodeURIComponent(project.title)}`;
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-[960px] px-4 pb-16 pt-8 md:px-8 md:pt-10">
        <Link
          href="/launches"
          aria-label="Back to app launches"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          App launches
        </Link>

        <article className="mt-6 overflow-hidden rounded-2xl border border-border bg-background [&>section:last-child]:border-b-0">
          {/* Hero */}
          <header className="border-b border-border bg-gradient-to-br from-primary/12 via-primary/[0.04] to-transparent px-5 py-8 md:px-8 md:py-10">
            <div className="flex items-start gap-5 md:gap-6">
              <FaviconBox
                src={logo}
                name={project.title}
                className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border bg-card text-xl font-semibold text-muted-foreground shadow-sm md:h-24 md:w-24 md:text-2xl"
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  <h1 className="text-balance text-3xl font-semibold leading-tight text-foreground md:text-4xl">
                    {project.title}
                  </h1>
                  {project.badge_verified && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
                      <BadgeCheck className="h-3.5 w-3.5" />
                      Listed
                    </span>
                  )}
                </div>
                {project.tagline && (
                  <p className="mt-2 max-w-[640px] text-base leading-7 text-muted-foreground md:text-lg">
                    {project.tagline}
                  </p>
                )}
                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
                  {listedDate && (
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="h-4 w-4" />
                      {listedDate}
                    </span>
                  )}
                  {project.category && (
                    <span className="inline-flex items-center gap-1.5">
                      <Tag className="h-4 w-4" />
                      {project.category}
                    </span>
                  )}
                </div>
              </div>
              <div className="hidden sm:block">
                <UpvoteBox slug={project.id} title={project.title} initialCount={upvotes} />
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-2.5 md:pl-30">
              <div className="sm:hidden">
                <UpvoteBox slug={project.id} title={project.title} initialCount={upvotes} compact />
              </div>
              {appUrl && (
                <a
                  href={appUrl}
                  target="_blank"
                  rel="nofollow sponsored noopener noreferrer"
                  className="inline-flex h-10 items-center gap-2 rounded-full bg-foreground px-5 text-sm font-medium text-background transition-colors hover:bg-foreground/85"
                >
                  Visit website
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
              {project.github_url && (
                <a href={project.github_url} target="_blank" rel="nofollow noopener noreferrer" className={secondaryButton}>
                  <Github className="h-4 w-4" />
                  Source
                </a>
              )}
              <FavoriteButton targetType="showcase" targetId={project.id} />
            </div>
          </header>

          {/* Activity strip */}
          <div className="grid border-b border-border sm:grid-cols-2">
            <div className="flex items-center gap-3 border-b border-border px-5 py-5 sm:border-b-0 sm:border-r md:px-8">
              <span className="text-2xl font-semibold tabular-nums text-foreground">{upvotes}</span>
              <span className="text-sm text-muted-foreground">
                {upvotes === 0 ? "No upvotes yet. Be the first." : upvotes === 1 ? "upvote" : "upvotes"}
              </span>
            </div>
            <a href="#discussion" className="group flex min-w-0 items-center gap-3 px-5 py-5 transition-colors hover:bg-card/60 md:px-8">
              <MakerAvatar name={project.author_name} size="sm" />
              <div className="min-w-0">
                <p className="text-sm text-foreground">
                  {builderName}
                  <span className="text-muted-foreground"> · Maker</span>
                </p>
                <p className="truncate text-sm text-muted-foreground group-hover:text-foreground">
                  {project.feedback_prompt || "Share feedback with the maker"}
                </p>
              </div>
            </a>
          </div>

          {aboutBlocks.length > 0 && (
            <LaunchSection title={`About ${project.title}`}>
              <div className="space-y-5">
                {aboutBlocks.map((block) => (
                  <p key={block} className="whitespace-pre-line text-base leading-8 text-foreground/85">
                    {block}
                  </p>
                ))}
              </div>
            </LaunchSection>
          )}

          <GalleryCarousel images={galleryImages} title={project.title} />

          <DemoVideoSection project={project} />

          <OverviewSection project={project} useCases={useCases} />

          <LaunchSection title="Built by">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <MakerAvatar name={project.author_name} />
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
            {project.category && (
              <DetailRow label="Category">
                <Chip>{project.category}</Chip>
              </DetailRow>
            )}
            {appUrl && (
              <DetailRow label="Website">
                <a
                  href={appUrl}
                  target="_blank"
                  rel="nofollow sponsored noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-foreground hover:text-primary"
                >
                  {publisherHost || "Open website"}
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </DetailRow>
            )}
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
            <DetailRow label="Launched">
              <span className="text-sm text-muted-foreground">{listedDate || "Recently"}</span>
            </DetailRow>
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

          <div className="flex items-center justify-center gap-3 border-b border-border px-5 py-6">
            <span className="text-sm text-muted-foreground">Share this launch</span>
            <a href={shareOnX} target="_blank" rel="noopener noreferrer" aria-label="Share on X" className="text-muted-foreground transition-colors hover:text-foreground">
              <XIcon className="h-4 w-4" />
            </a>
            <a href={shareOnLinkedIn} target="_blank" rel="noopener noreferrer" aria-label="Share on LinkedIn" className="text-muted-foreground transition-colors hover:text-foreground">
              <Linkedin className="h-4 w-4" />
            </a>
          </div>

          <LaunchSection id="discussion" title="Discussion">
            {project.feedback_prompt && (
              <div className="flex gap-3">
                <MakerAvatar name={project.author_name} size="sm" />
                <div className="min-w-0">
                  <p className="text-sm">
                    <span className="font-semibold text-foreground">{builderName}</span>
                    <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">Maker</span>
                  </p>
                  <p className="mt-1.5 text-sm leading-7 text-foreground/85">{project.feedback_prompt}</p>
                </div>
              </div>
            )}
            <Link
              href={feedbackHref}
              className={`${project.feedback_prompt ? "mt-6" : ""} flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground transition-colors hover:border-[var(--cad-line-hover)] hover:text-foreground`}
            >
              <MessageCircle className="h-4 w-4 shrink-0" />
              Share your feedback on {project.title} in the community
            </Link>
          </LaunchSection>

          <SimilarProductsCarousel currentProject={project} projects={allProjects ?? []} />
        </article>
      </main>
      <Footer />
    </div>
  );
}
