import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  BadgeCheck,
  CheckCircle2,
  ExternalLink,
  Github,
  Globe2,
  MessageCircle,
  
} from "lucide-react";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FavoriteButton from "@/components/shared/FavoriteButton";
import { TagList } from "@/components/directory/detail";
import { faviconFor } from "@/lib/directory";
import { fetchApi } from "@/lib/api-server";
import type { ShowcaseProject } from "@/types";
import {
  OverviewSection,
  GalleryCarousel,
  TechStackCard,
  DemoVideoSection,
  SimilarProductsCarousel,
  CollectionsSection,
  EnhancedCreatorCard,
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
    .map((item) => item.trim())
    .filter(Boolean);
}

function splitDescription(description: string) {
  return description
    .split(/\n{2,}|(?<=[.!?])\s+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function featureItems(project: ShowcaseProject) {
  const fromSkills = (project.skills_used ?? []).map((skill) => `Works with ${skill}`);
  const fromStack = (project.tech_stack ?? []).map((tech) => tech.charAt(0).toUpperCase() + tech.slice(1));
  const fromDescription = splitDescription(project.description)
    .filter((sentence) => sentence.length > 28)
    .slice(0, 2);

  const explicitItems = [...fromSkills, ...fromStack];
  const items = (explicitItems.length ? explicitItems : fromDescription)
    .map((item) => item.replace(/\.$/, ""))
    .filter(Boolean);

  return Array.from(new Set(items)).slice(0, 5);
}

function fallbackUseCases(project: ShowcaseProject) {
  const cases = splitUseCases(project.use_cases);
  if (cases.length) return cases;

  const category = project.category?.trim();
  const stack = project.tech_stack?.filter(Boolean) ?? [];
  return [
    category ? `${category} teams evaluating Claude-ready tools` : "Claude builders evaluating new tools",
    ...stack.map((item) => `${item} workflows`),
    "Collecting feedback from the Claude AI community",
  ].slice(0, 4);
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="font-mono text-[11px] font-normal uppercase tracking-[0.18em] text-muted-foreground">
      {children}
    </h2>
  );
}

function ProductLogo({ src, name, size = "base" }: { src?: string | null; name: string; size?: "base" | "large" }) {
  const dimension = size === "large" ? "h-20 w-20 rounded-2xl text-2xl" : "h-14 w-14 rounded-xl text-lg";

  return (
    <div className={`flex shrink-0 items-center justify-center overflow-hidden border border-border bg-card font-semibold text-muted-foreground shadow-sm ${dimension}`}>
      {src ? (
        <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" referrerPolicy="no-referrer" />
      ) : (
        initials(name)
      )}
    </div>
  );
}

function ProductPreview({
  project,
  image,
  logo,
  tags,
}: {
  project: ShowcaseProject;
  image?: string;
  logo?: string | null;
  tags: string[];
}) {
  if (image) {
    return (
      <div className="overflow-hidden rounded-2xl border border-border bg-card/50">
        <img
          src={image}
          alt={`${project.title} screenshot`}
          className="aspect-[16/10] h-full w-full object-cover"
          loading="eager"
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-[radial-gradient(circle_at_20%_18%,rgba(255,154,100,0.18),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))] p-8 shadow-[0_24px_90px_rgba(0,0,0,0.22)]">
      <div className="absolute inset-x-8 top-8 h-px bg-border/80" />
      <div className="absolute bottom-8 right-8 h-28 w-28 rounded-full border border-border/80" />
      <div className="relative flex min-h-[300px] flex-col justify-between">
        <div className="flex items-center justify-between gap-4">
          <ProductLogo src={logo} name={project.title} size="large" />
          <div className="rounded-full border border-border bg-background/70 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            Claude launch
          </div>
        </div>
        <div className="max-w-[620px]">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">{project.category || "Claude app"}</p>
          <h2 className="mt-3 text-balance text-3xl font-normal leading-tight text-foreground sm:text-4xl">{project.title}</h2>
          <p className="mt-4 max-w-[560px] text-base leading-7 text-muted-foreground">{project.tagline || project.description}</p>
          {tags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {tags.slice(0, 4).map((tag) => (
                <span key={tag} className="rounded-full border border-border bg-background/65 px-3 py-1 text-xs text-muted-foreground">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
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
  const techStack = project.tech_stack ?? [];
  const useCases = fallbackUseCases(project);
  const features = featureItems(project);
  const resourceType = project.category || "Claude app";
  const publisherHost = hostFromUrl(appUrl);
  const builderName = project.author_name || project.author_username || "Claude AI community member";
  const descriptionBlocks = splitDescription(project.description);
  const gallery = (project.images ?? []).filter(Boolean);
  const galleryImages = (project.gallery_images ?? gallery).filter(Boolean);
  const logo = faviconFor(appUrl);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-[1120px] px-4 pb-16 pt-8 md:px-8 md:pt-12">
        <Link
          href="/launches"
          aria-label="Back to app launches"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          App launches
        </Link>

        <section className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
          <div className="min-w-0">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <ProductLogo src={logo} name={project.title} size="large" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-border bg-card px-3 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                    {resourceType}
                  </span>
                  {project.badge_verified && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/25 bg-amber-400/10 px-3 py-1 text-xs text-amber-200">
                      <BadgeCheck className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      Listed
                    </span>
                  )}
                </div>
                <h1 className="mt-4 text-balance text-4xl font-normal leading-tight text-foreground sm:text-5xl">
                  {project.title}
                </h1>
                <p className="mt-4 max-w-[720px] text-lg leading-8 text-muted-foreground">
                  {project.tagline || project.description}
                </p>
                <div className="mt-6 flex flex-wrap gap-2.5">
                  {appUrl && (
                    <a
                      href={appUrl}
                      target="_blank"
                      rel="nofollow sponsored noopener noreferrer"
                      className="inline-flex h-11 items-center gap-2 rounded-full bg-foreground px-5 text-sm font-medium text-background transition-colors hover:bg-foreground/85"
                    >
                      Visit website
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                  <Link
                    href={feedbackHref}
                    className="inline-flex h-11 items-center gap-2 rounded-full border border-border px-4 text-sm text-foreground transition-colors hover:border-[var(--cad-line-hover)]"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Give feedback
                  </Link>
                  {project.github_url && (
                    <a
                      href={project.github_url}
                      target="_blank"
                      rel="nofollow noopener noreferrer"
                      className="inline-flex h-11 items-center gap-2 rounded-full border border-border px-4 text-sm text-foreground transition-colors hover:border-[var(--cad-line-hover)]"
                    >
                      <Github className="h-4 w-4" />
                      Source
                    </a>
                  )}
                  <FavoriteButton targetType="showcase" targetId={project.id} />
                </div>
              </div>
            </div>
          </div>

          <aside className="rounded-2xl border border-border bg-card/45 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Launch score</p>
                <p className="mt-2 text-3xl font-semibold text-foreground">{project.upvotes ?? 0}</p>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-background">
                <ArrowUp className="h-5 w-5 text-foreground" />
              </div>
            </div>
            <div className="mt-4 border-t border-border pt-4">
              <p className="text-sm text-muted-foreground">
                {listedDate ? `Launched on ${listedDate}` : "Recently launched"} by {builderName}.
              </p>
            </div>
          </aside>
        </section>

        <div className="mt-9">
          {galleryImages.length > 0 ? (
            <GalleryCarousel images={galleryImages} title={project.title} />
          ) : (
            <ProductPreview project={project} image={gallery[0]} logo={logo} tags={techStack} />
          )}
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
          <div className="space-y-10">
            <OverviewSection project={project} />

            <section className="space-y-4">
              <SectionTitle>What is {project.title}?</SectionTitle>
              <div className="rounded-2xl border border-border bg-card/35 p-6">
                <div className="space-y-4">
                  {(descriptionBlocks.length ? descriptionBlocks : [project.description]).slice(0, 4).map((block) => (
                    <p key={block} className="text-base leading-8 text-muted-foreground">
                      {block}
                    </p>
                  ))}
                </div>
              </div>
            </section>

            {features.length > 0 && (
              <section className="space-y-4">
                <SectionTitle>Features</SectionTitle>
                <div className="rounded-2xl border border-border bg-card/30">
                  {features.map((feature) => (
                    <div key={feature} className="flex items-center gap-3 border-b border-border px-5 py-3.5 last:border-b-0">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      <p className="text-sm leading-6 text-muted-foreground">{feature}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="space-y-4">
              <SectionTitle>Use cases</SectionTitle>
              <div className="rounded-2xl border border-border bg-card/30">
                {useCases.map((useCase) => (
                  <div key={useCase} className="flex gap-3 border-b border-border px-5 py-3.5 text-sm leading-6 text-muted-foreground last:border-b-0">
                    <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
                    <span>{useCase}</span>
                  </div>
                ))}
              </div>
            </section>

            <CollectionsSection project={project} />

            <DemoVideoSection project={project} />

            {project.feedback_prompt && (
              <section className="space-y-4">
                <SectionTitle>Community feedback</SectionTitle>
                <div className="rounded-2xl border border-primary/25 bg-primary/10 p-6">
                  <div className="flex gap-3">
                    <MessageCircle className="mt-1 h-5 w-5 shrink-0 text-primary" />
                    <div>
                      <p className="text-base leading-7 text-foreground">{project.feedback_prompt}</p>
                      <Link href={feedbackHref} className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-foreground underline underline-offset-4 hover:text-primary">
                        Give feedback
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </section>
            )}

            <SimilarProductsCarousel currentProject={project} projects={allProjects ?? []} />
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24">
            <EnhancedCreatorCard project={project} />

            <TechStackCard project={project} />

            <section className="rounded-2xl border border-border bg-card/40 p-5">
              <SectionTitle>Details</SectionTitle>
              <dl className="mt-4 space-y-4 text-sm">
                <div>
                  <dt className="text-muted-foreground">Website</dt>
                  <dd className="mt-1 truncate text-foreground">
                    {appUrl ? (
                      <a href={appUrl} target="_blank" rel="nofollow sponsored noopener noreferrer" className="inline-flex max-w-full items-center gap-1.5 hover:text-primary">
                        <Globe2 className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{publisherHost || "Open website"}</span>
                      </a>
                    ) : (
                      "Not recorded"
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Category</dt>
                  <dd className="mt-1 text-foreground">{resourceType}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Listed</dt>
                  <dd className="mt-1 text-foreground">{listedDate || "Recently"}</dd>
                </div>
              </dl>
            </section>

            {techStack.length > 0 && (
              <section className="rounded-2xl border border-border bg-card/40 p-5">
                <SectionTitle>Tags</SectionTitle>
                <div className="mt-4">
                  <TagList tags={techStack} />
                </div>
              </section>
            )}
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}
