import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PageBreadcrumb from "@/components/layout/PageBreadcrumb";
import BlogMarkdown from "@/components/blog/BlogMarkdown";
import TocNav from "@/components/blog/TocNav";
import { AuthorAvatar, PostMeta } from "@/components/blog/PostMeta";
import { BlogBreadcrumbSchema, BlogPostingSchema } from "@/components/blog/BlogSchema";
import { fetchApi } from "@/lib/api-server";
import {
  SITE_NAME,
  SITE_URL,
  articleBody,
  authorHref,
  isoDate,
  postSummary,
  postUrl,
  sourceLinks,
  tableOfContents,
} from "@/lib/blog";
import type { BlogPost } from "@/types";
import { pageTitle } from "@/lib/seo";

interface Props {
  params: Promise<{ slug: string }>;
}

// Upstream outages throw instead of caching a false 404.
const loadPost = (slug: string) => fetchApi<BlogPost>(`/blog/${encodeURIComponent(slug)}`, { throwOnError: true });

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await loadPost(slug);
  if (!post) return { title: "Article not found", robots: { index: false } };

  const description = postSummary(post).slice(0, 160);
  const url = postUrl(post.id);
  const profile = authorHref(post);
  return {
    title: pageTitle(post.title),
    description,
    // A post first published elsewhere points search engines at the original.
    alternates: { canonical: post.canonical_url || url },
    authors: [{ name: post.author, url: profile ? `${SITE_URL}${profile}` : undefined }],
    openGraph: {
      type: "article",
      url,
      siteName: SITE_NAME,
      title: post.title,
      description,
      publishedTime: isoDate(post.published_at),
      modifiedTime: isoDate(post.updated_at) ?? isoDate(post.published_at),
      authors: [post.author],
      section: post.category,
      tags: post.tags,
    },
    twitter: { card: "summary_large_image", title: post.title, description },
  };
}

function prettySlug(slug: string) {
  return slug.replace(/^mcp-/, "").replace(/[-_]+/g, " ");
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const [post, allPosts] = await Promise.all([loadPost(slug), fetchApi<BlogPost[]>("/blog?limit=50")]);
  if (!post) notFound();

  const body = articleBody(post.content);
  const toc = tableOfContents(body);
  const summary = postSummary(post);
  const community = post.source === "community";
  const sources = sourceLinks(post);
  const profile = authorHref(post);
  const others = (allPosts ?? []).filter((p) => p.id !== post.id);
  const related = [...others.filter((p) => p.category === post.category), ...others.filter((p) => p.category !== post.category)].slice(0, 3);
  const relatedResources = [
    ...post.related_skills.map((id) => ({ href: `/skills/${id}`, label: prettySlug(id), kind: "Skill" })),
    ...post.related_mcps.map((id) => ({ href: `/mcp/${id.replace(/^mcp-/, "")}`, label: prettySlug(id), kind: "MCP server" })),
  ];
  let originalHost: string | null = null;
  if (post.canonical_url) {
    try {
      originalHost = new URL(post.canonical_url).hostname.replace(/^www\./, "");
    } catch {
      originalHost = null;
    }
  }

  return (
    <div className="cad-shell flex flex-col">
      <BlogPostingSchema post={post} />
      <BlogBreadcrumbSchema
        items={[
          { name: "Home", url: SITE_URL },
          { name: "Blog", url: `${SITE_URL}/blog` },
          { name: post.title, url: postUrl(post.id) },
        ]}
      />
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-[1160px] px-4 pb-20 pt-8 md:px-8 md:pt-12">
          <PageBreadcrumb items={[{ label: "Blog", href: "/blog" }, { label: post.title }]} />

          <div className="grid gap-12 lg:grid-cols-[minmax(0,720px)_220px] lg:justify-between">
            <article className="min-w-0">
              <header>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] uppercase tracking-[0.14em]">
                  <Link href={`/blog?category=${encodeURIComponent(post.category)}`} className="text-primary hover:underline">
                    {post.category}
                  </Link>
                  {community ? <span className="text-muted-foreground">Community post</span> : null}
                </div>

                <h1 className="mt-4 text-balance text-[clamp(32px,4.4vw,46px)] font-normal leading-[1.1] text-foreground">
                  {post.title}
                </h1>

                <div className="mt-6 flex items-center gap-3">
                  <AuthorAvatar post={post} />
                  <div className="min-w-0 text-sm">
                    <p className="text-foreground">
                      By{" "}
                      {profile ? (
                        <Link href={profile} rel="author" className="underline decoration-border underline-offset-4 hover:decoration-foreground">
                          {post.author}
                        </Link>
                      ) : (
                        <span>{post.author}</span>
                      )}
                    </p>
                    <PostMeta post={post} className="mt-0.5" />
                  </div>
                </div>

                {summary ? (
                  <div className="mt-8 rounded-lg border border-border bg-card px-5 py-4">
                    <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">In short</p>
                    <p className="mt-2 text-pretty text-[16px] leading-7 text-foreground">{summary}</p>
                  </div>
                ) : null}

                {community || originalHost ? (
                  <p className="mt-4 text-[13px] leading-6 text-muted-foreground">
                    {community ? "Written by a community member and reviewed by the Claude Directory team before publishing. " : null}
                    {originalHost && post.canonical_url ? (
                      <>
                        Originally published on{" "}
                        <a href={post.canonical_url} rel="noopener noreferrer" target="_blank" className="underline underline-offset-4 hover:text-foreground">
                          {originalHost}
                        </a>
                        .
                      </>
                    ) : null}
                  </p>
                ) : null}
              </header>

              {toc.length > 1 ? (
                <details className="mt-8 rounded-lg border border-border lg:hidden">
                  <summary className="cursor-pointer select-none px-4 py-3 text-sm text-foreground">On this page</summary>
                  <ol className="space-y-1 border-t border-border px-4 py-3">
                    {toc.map((item) => (
                      <li key={item.id} className={item.level === 3 ? "pl-4" : undefined}>
                        <a href={`#${item.id}`} className="block py-1 text-sm text-muted-foreground hover:text-foreground">
                          {item.text}
                        </a>
                      </li>
                    ))}
                  </ol>
                </details>
              ) : null}

              <BlogMarkdown content={body} community={community} />

              {post.tags.length > 0 ? (
                <ul className="mt-12 flex flex-wrap gap-2" aria-label="Tags">
                  {post.tags.map((tag) => (
                    <li key={tag} className="rounded-full border border-border px-3 py-1 text-[12px] text-muted-foreground">
                      {tag}
                    </li>
                  ))}
                </ul>
              ) : null}

              {sources.links.length > 0 ? (
                <section aria-labelledby="sources" className="mt-12 border-t border-border pt-8">
                  <h2 id="sources" className="text-lg font-medium text-foreground">
                    {sources.label}
                  </h2>
                  <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-6 text-muted-foreground marker:text-muted-foreground">
                    {sources.links.map((link) => (
                      <li key={link.url} className="pl-1">
                        <a
                          href={link.url}
                          target="_blank"
                          rel={community ? "nofollow ugc noopener noreferrer" : "noopener noreferrer"}
                          className="text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground"
                        >
                          {link.text}
                        </a>{" "}
                        <span className="text-muted-foreground">({link.host})</span>
                      </li>
                    ))}
                  </ol>
                </section>
              ) : null}

              <section aria-label="About the author" className="mt-12 flex gap-4 rounded-lg border border-border bg-card p-5">
                <AuthorAvatar post={post} size="lg" />
                <div className="min-w-0">
                  <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Written by</p>
                  <p className="mt-1 text-[15px] text-foreground">
                    {profile ? (
                      <Link href={profile} rel="author" className="hover:underline">
                        {post.author}
                      </Link>
                    ) : (
                      post.author
                    )}
                  </p>
                  {post.author_bio ? <p className="mt-2 text-sm leading-6 text-muted-foreground">{post.author_bio}</p> : null}
                  {profile ? (
                    <Link href={profile} className="mt-3 inline-flex items-center gap-1 text-sm text-foreground underline underline-offset-4 hover:text-primary">
                      View profile
                    </Link>
                  ) : null}
                </div>
              </section>

              {/* Discussion slot: when blog comments get a backend, render
                  <Discussion /> from components/discussion here. */}
            </article>

            <aside className="hidden lg:block">
              <div className="sticky top-24 space-y-8">
                {toc.length > 1 ? <TocNav items={toc} /> : null}
                <div className="border-t border-border pt-6">
                  <p className="text-sm leading-6 text-muted-foreground">Built something with Claude worth writing up?</p>
                  <Link href="/blog/submit" className="mt-2 inline-flex items-center gap-1 text-sm text-foreground underline underline-offset-4 hover:text-primary">
                    Write for the blog
                  </Link>
                </div>
              </div>
            </aside>
          </div>

          {relatedResources.length > 0 ? (
            <section aria-labelledby="related-resources" className="mt-16 border-t border-border pt-10">
              <h2 id="related-resources" className="text-2xl font-normal text-foreground">
                Resources mentioned
              </h2>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {relatedResources.map((r) => (
                  <li key={r.href}>
                    <Link href={r.href} className="flex items-center justify-between gap-3 rounded-lg border border-border p-4 hover:border-foreground/30">
                      <span className="min-w-0">
                        <span className="block font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{r.kind}</span>
                        <span className="mt-1 block truncate text-[15px] capitalize text-foreground">{r.label}</span>
                      </span>
                      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {related.length > 0 ? (
            <section aria-labelledby="more-posts" className="mt-16 border-t border-border pt-10">
              <div className="flex items-baseline justify-between gap-4">
                <h2 id="more-posts" className="text-2xl font-normal text-foreground">
                  Keep reading
                </h2>
                <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground">
                  All articles
                </Link>
              </div>
              <ul className="mt-6 grid gap-6 md:grid-cols-3">
                {related.map((p) => (
                  <li key={p.id}>
                    <Link href={`/blog/${p.id}`} className="group block h-full rounded-lg border border-border p-5 hover:border-foreground/30">
                      <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-primary">{p.category}</span>
                      <span className="mt-2 block text-pretty text-[17px] leading-snug text-foreground group-hover:underline group-hover:decoration-border group-hover:underline-offset-4">
                        {p.title}
                      </span>
                      <PostMeta post={p} short className="mt-3" />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section aria-labelledby="explore" className="mt-16 grid gap-4 border-t border-border pt-10 md:grid-cols-3">
            <h2 id="explore" className="sr-only">
              Explore the directory
            </h2>
            {[
              { href: "/skills", title: "Claude Skills", text: "Install Skills that teach Claude your workflows." },
              { href: "/mcp", title: "MCP servers", text: "Connect Claude to your tools and data." },
              { href: "/agents", title: "Claude Agents", text: "Subagents for coding, review, testing and research." },
            ].map((item) => (
              <Link key={item.href} href={item.href} className="group rounded-lg border border-border p-5 hover:border-foreground/30">
                <span className="flex items-center justify-between text-[15px] text-foreground">
                  {item.title}
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </span>
                <span className="mt-1 block text-sm leading-6 text-muted-foreground">{item.text}</span>
              </Link>
            ))}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
