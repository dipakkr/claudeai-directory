import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import { ArrowUpRight } from "lucide-react";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FavoriteButton from "@/components/shared/FavoriteButton";
import { Badge } from "@/components/ui/badge";
import { BreadcrumbSchema } from "@/components/seo/JsonLd";
import { serverFetch } from "@/lib/server/api";
import type { Resource } from "@/types";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.claudeai.directory";

async function getResource(slug: string): Promise<Resource | null> {
    try {
        return (await serverFetch(`/resources/${slug}`)) as Resource;
    } catch {
        return null;
    }
}

function initials(name?: string | null) {
    if (!name) return "?";
    const clean = name.replace(/\s*\(@[^)]+\)\s*$/, "").trim();
    return clean.split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "?";
}

function formatDate(value?: string | null) {
    if (!value) return null;
    return new Date(value).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}): Promise<Metadata> {
    const { slug } = await params;
    const resource = await getResource(slug);

    if (!resource) {
        return { title: "Resource not found: ClaudeAI Directory" };
    }

    return {
        title: `${resource.title}: ClaudeAI Directory`,
        description: resource.description,
        authors: resource.author ? [{ name: resource.author }] : undefined,
        // Point search engines at the author's original. This is a mirror with
        // permission, not the canonical home of the piece.
        alternates: { canonical: resource.url },
        openGraph: {
            title: resource.title,
            description: resource.description,
            type: "article",
            images: resource.cover_image ? [resource.cover_image] : undefined,
        },
    };
}

export default async function ResourcePage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const resource = await getResource(slug);

    if (!resource) notFound();

    const published = formatDate(resource.published_at);

    return (
        <>
            <BreadcrumbSchema
                items={[
                    { name: "Home", url: SITE_URL },
                    { name: "Resources", url: `${SITE_URL}/resources` },
                    { name: resource.title, url: `${SITE_URL}/resources/${slug}` },
                ]}
            />
            <div className="min-h-screen bg-background flex flex-col">
                <Header />
                <main className="flex-1">
                    <article className="container max-w-3xl py-10">
                        <div className="mb-4 text-xs text-muted-foreground">
                            <Link href="/resources" className="hover:text-foreground transition-colors">
                                Resources
                            </Link>
                            <span className="mx-1.5">/</span>
                            <span className="capitalize">{resource.category}</span>
                        </div>

                        <div className="mb-3 flex items-center gap-2">
                            <Badge variant="outline" className="text-[10px] capitalize">
                                {resource.category}
                            </Badge>
                            {resource.curated && (
                                <Badge variant="secondary" className="text-[10px]">
                                    Editor pick
                                </Badge>
                            )}
                            <FavoriteButton targetType="resource" targetId={resource.id || slug} compact />
                        </div>

                        <h1 className="text-2xl font-semibold tracking-tight text-foreground mb-3">
                            {resource.title}
                        </h1>

                        {resource.cover_image && (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                                src={resource.cover_image}
                                alt=""
                                className="mb-8 w-full rounded-lg border border-border"
                            />
                        )}

                        {resource.body ? (
                            <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-a:text-primary prose-pre:border prose-pre:border-border">
                                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSlug]}>
                                    {resource.body}
                                </ReactMarkdown>
                            </div>
                        ) : (
                            <div className="rounded-lg border border-dashed border-border p-6">
                                <p className="text-sm text-muted-foreground mb-3">
                                    {resource.description}
                                </p>
                                <a
                                    href={resource.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                                >
                                    Read it at the source
                                    <ArrowUpRight className="h-3 w-3" />
                                </a>
                            </div>
                        )}

                        {/* Author profile sits at the end, so the reader meets the
                            writer after the piece rather than before it. */}
                        <div className="mt-12 rounded-lg border border-border bg-muted/40 p-5">
                            <div className="flex items-start gap-4">
                                {resource.author_avatar ? (
                                    /* eslint-disable-next-line @next/next/no-img-element */
                                    <img
                                        src={resource.author_avatar}
                                        alt={resource.author || "Author"}
                                        className="h-12 w-12 shrink-0 rounded-full border border-border object-cover"
                                    />
                                ) : (
                                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-muted text-sm text-muted-foreground">
                                        {initials(resource.author)}
                                    </span>
                                )}

                                <div className="min-w-0 flex-1">
                                    <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                                        Written by
                                    </p>
                                    <p className="text-sm font-medium text-foreground">
                                        {resource.author_url ? (
                                            <a
                                                href={resource.author_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="hover:underline"
                                            >
                                                {resource.author || "Unknown"}
                                            </a>
                                        ) : (
                                            resource.author || "Unknown"
                                        )}
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Originally published
                                        {resource.source ? ` on ${resource.source}` : ""}
                                        {published ? ` · ${published}` : ""}. Republished here as part
                                        of the ClaudeAI Directory library.
                                    </p>
                                    <a
                                        href={resource.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                                    >
                                        Read the original
                                        <ArrowUpRight className="h-3 w-3" />
                                    </a>
                                </div>
                            </div>
                        </div>

                        {resource.tags && resource.tags.length > 0 && (
                            <div className="mt-6 flex flex-wrap gap-1.5">
                                {resource.tags.map((tag) => (
                                    <Badge key={tag} variant="outline" className="text-xs">
                                        #{tag}
                                    </Badge>
                                ))}
                            </div>
                        )}

                        <div className="mt-8">
                            <Link href="/resources" className="text-xs text-primary hover:underline">
                                ← Back to resources
                            </Link>
                        </div>
                    </article>
                </main>
                <Footer />
            </div>
        </>
    );
}
