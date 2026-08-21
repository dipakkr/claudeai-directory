import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  ExternalLink,
  Github,
  MessageSquareText,
  ShieldCheck,
  ThumbsUp,
  UserRound,
} from "lucide-react";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fetchApi } from "@/lib/api-server";
import type { ShowcaseProject } from "@/types";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.claudeai.directory";

function cleanUrl(url?: string) {
  return url?.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

function formatDate(value?: string) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
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
    alternates: { canonical: `/showcase/${slug}` },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/showcase/${slug}`,
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default async function ShowcaseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await fetchApi<ShowcaseProject>(`/showcase/${slug}`);

  if (!project) notFound();

  const appUrl = project.app_url || project.demo_url;
  const authorHref = project.author_username ? `/u/${project.author_username}` : null;
  const listedDate = formatDate(project.listed_at || project.created_at);
  const feedbackHref = `/community?search=${encodeURIComponent(project.title)}`;
  const techStack = project.tech_stack ?? [];
  const useCases = project.use_cases ?? [];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="border-b border-border bg-card/35">
          <div className="mx-auto max-w-[1080px] px-6 py-8 sm:px-8">
            <Button variant="ghost" size="sm" asChild className="-ml-3 mb-5">
              <Link href="/showcase">
                <ArrowLeft className="h-4 w-4" />
                App showcase
              </Link>
            </Button>

            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  {project.badge_verified && (
                    <Badge variant="secondary" className="gap-1 rounded-md">
                      <BadgeCheck className="h-3 w-3" />
                      Badge verified
                    </Badge>
                  )}
                  {project.category && (
                    <Badge variant="outline" className="rounded-md">
                      {project.category}
                    </Badge>
                  )}
                </div>
                <h1 className="mt-4 max-w-[16ch] text-balance text-[clamp(34px,6vw,54px)] font-medium leading-[1.04] tracking-normal text-foreground">
                  {project.title}
                </h1>
                <p className="mt-4 max-w-[62ch] text-base leading-[1.65] text-muted-foreground">
                  {project.tagline || project.description}
                </p>
              </div>

              <div className="rounded-[14px] border border-border bg-background p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[10px] bg-primary/12 text-base font-semibold text-primary">
                    {project.title.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{project.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{cleanUrl(appUrl)}</p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded-[10px] border border-border p-3">
                    <p className="text-xs text-muted-foreground">Upvotes</p>
                    <p className="mt-1 flex items-center gap-1.5 font-semibold text-foreground">
                      <ThumbsUp className="h-4 w-4" />
                      {project.upvotes}
                    </p>
                  </div>
                  <div className="rounded-[10px] border border-border p-3">
                    <p className="text-xs text-muted-foreground">Listed</p>
                    <p className="mt-1 font-semibold text-foreground">{listedDate || "Recently"}</p>
                  </div>
                </div>
                {appUrl && (
                  <Button className="mt-4 w-full" asChild>
                    <a
                      href={appUrl}
                      target="_blank"
                      rel="nofollow sponsored noopener noreferrer"
                    >
                      Visit app
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-[1080px] gap-6 px-6 py-8 sm:px-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            <div className="rounded-[14px] border border-border bg-card p-5">
              <h2 className="text-xl font-semibold text-foreground">What it does</h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-7 text-muted-foreground">
                {project.description}
              </p>
            </div>

            {useCases.length > 0 && (
              <div className="rounded-[14px] border border-border bg-card p-5">
                <h2 className="text-xl font-semibold text-foreground">Use cases</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {useCases.map((useCase) => (
                    <Badge key={useCase} variant="secondary" className="rounded-md">
                      {useCase}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-[14px] border border-primary/25 bg-primary/10 p-5">
              <div className="flex items-start gap-3">
                <MessageSquareText className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Feedback request</h2>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    {project.feedback_prompt || "Share practical feedback for the builder and how this could be more useful for Claude AI workflows."}
                  </p>
                  <Button className="mt-4" variant="outline" asChild>
                    <Link href={feedbackHref}>Discuss in community</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-[14px] border border-border bg-card p-5">
              <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Builder
              </h2>
              {authorHref ? (
                <Link href={authorHref} className="mt-4 flex items-center gap-3 rounded-[10px] border border-border bg-background p-3 hover:border-primary/35">
                  <UserRound className="h-5 w-5 text-primary" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {project.author_name || project.author_username}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">@{project.author_username}</p>
                  </div>
                </Link>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">Claude AI community member</p>
              )}
            </div>

            <div className="rounded-[14px] border border-border bg-card p-5">
              <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Built with
              </h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {techStack.length > 0 ? (
                  techStack.map((tag) => (
                    <Badge key={tag} variant="secondary" className="rounded-md">
                      {tag}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Claude AI</p>
                )}
              </div>
            </div>

            <div className="rounded-[14px] border border-border bg-card p-5">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 text-primary" />
                <div>
                  <h2 className="text-sm font-semibold text-foreground">Directory badge</h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    This listing is public because the builder added a Claude AI
                    Directory badge to their site.
                  </p>
                </div>
              </div>
            </div>

            {project.github_url && (
              <Button variant="outline" className="w-full" asChild>
                <a
                  href={project.github_url}
                  target="_blank"
                  rel="nofollow noopener noreferrer"
                >
                  <Github className="h-4 w-4" />
                  View source
                </a>
              </Button>
            )}
          </aside>
        </section>
      </main>
      <Footer />
    </div>
  );
}
