import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, PenLine, Rss } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { AuthorAvatar, PostMeta } from "@/components/blog/PostMeta";
import { BlogBreadcrumbSchema, BlogIndexSchema } from "@/components/blog/BlogSchema";
import { fetchApi } from "@/lib/api-server";
import { BLOG_DESCRIPTION, SITE_URL, categoriesOf, postSummary } from "@/lib/blog";
import type { BlogPost } from "@/types";

type SearchParams = Promise<{ category?: string }>;

const TITLE = "Claude Blog: Guides for Claude Code, MCP and Skills";

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const { category } = await searchParams;
  return {
    title: { absolute: TITLE },
    description: BLOG_DESCRIPTION,
    alternates: {
      canonical: "/blog",
      types: { "application/rss+xml": `${SITE_URL}/blog/rss.xml` },
    },
    // Filtered views are for browsing, not for the index (CLAUDE.md technical SEO).
    robots: category ? { index: false, follow: true } : undefined,
    openGraph: { title: TITLE, description: BLOG_DESCRIPTION, url: "/blog", type: "website", images: ["/opengraph-image"] },
    twitter: { card: "summary_large_image", title: TITLE, description: BLOG_DESCRIPTION, images: ["/opengraph-image"] },
  };
}

function PostByline({ post }: { post: BlogPost }) {
  return (
    <div className="flex items-center gap-2.5">
      <AuthorAvatar post={post} />
      <div className="min-w-0">
        <p className="truncate text-[13px] text-foreground">{post.author}</p>
        <PostMeta post={post} short />
      </div>
    </div>
  );
}

export default async function BlogPage({ searchParams }: { searchParams: SearchParams }) {
  const { category } = await searchParams;
  const posts = (await fetchApi<BlogPost[]>("/blog?limit=100")) ?? [];
  const categories = categoriesOf(posts);
  const active = category && categories.includes(category) ? category : null;
  const visible = active ? posts.filter((post) => post.category === active) : posts;
  const featured = active ? null : (posts.find((post) => post.featured) ?? posts[0] ?? null);
  const list = featured ? visible.filter((post) => post.id !== featured.id) : visible;

  return (
    <div className="cad-shell flex flex-col">
      <BlogIndexSchema posts={posts} />
      <BlogBreadcrumbSchema
        items={[
          { name: "Home", url: SITE_URL },
          { name: "Blog", url: `${SITE_URL}/blog` },
        ]}
      />
      <Header />
      <main className="flex-1">
        <section className="mx-auto max-w-[1120px] px-4 pb-10 pt-12 md:px-8 md:pt-16">
          <div className="flex flex-col gap-8 border-b border-border pb-10 md:flex-row md:items-end md:justify-between">
            <div className="max-w-[640px]">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-primary">Blog</p>
              <h1 className="mt-3 text-balance text-[clamp(34px,5vw,52px)] font-normal leading-[1.05] text-foreground">
                Guides and field notes for building with Claude
              </h1>
              <p className="mt-4 max-w-[58ch] text-pretty text-[16px] leading-7 text-muted-foreground">
                Hands-on articles about Claude Code, MCP servers, Skills and Agents. Every post shows who wrote it,
                when, and the links it relies on. Community posts are reviewed by our team before they go live.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <Link
                href="/blog/submit"
                className="inline-flex h-10 items-center gap-2 rounded-full bg-foreground px-5 text-sm font-medium text-background hover:bg-foreground/85"
              >
                <PenLine className="h-4 w-4" aria-hidden="true" />
                Write for the blog
              </Link>
              <a
                href="/blog/rss.xml"
                className="inline-flex h-10 items-center gap-2 rounded-full border border-border px-4 text-sm text-foreground hover:border-foreground/30"
              >
                <Rss className="h-4 w-4" aria-hidden="true" />
                RSS
              </a>
            </div>
          </div>

          {categories.length > 1 ? (
            <nav aria-label="Filter by category" className="-mx-4 mt-6 overflow-x-auto px-4 md:mx-0 md:px-0">
              <ul className="flex w-max gap-2">
                {[null, ...categories].map((cat) => {
                  const selected = cat === active;
                  return (
                    <li key={cat ?? "all"}>
                      <Link
                        href={cat ? `/blog?category=${encodeURIComponent(cat)}` : "/blog"}
                        scroll={false}
                        aria-current={selected ? "page" : undefined}
                        className={`inline-flex h-8 items-center rounded-full border px-3.5 text-[13px] transition-colors ${
                          selected
                            ? "border-foreground bg-foreground text-background"
                            : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                        }`}
                      >
                        {cat ?? "All"}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          ) : null}
        </section>

        <section className="mx-auto max-w-[1120px] px-4 pb-20 md:px-8" aria-label="Articles">
          {featured ? (
            <Link
              href={`/blog/${featured.id}`}
              className="group mb-10 grid gap-6 rounded-xl border border-border bg-card p-6 transition-colors hover:border-foreground/30 md:grid-cols-[minmax(0,1fr)_240px] md:p-8"
            >
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  {featured.featured ? "Featured" : "Latest"} · <span className="text-primary">{featured.category}</span>
                </p>
                <h2 className="mt-3 text-balance text-[clamp(26px,3.2vw,36px)] font-normal leading-tight text-foreground group-hover:underline group-hover:decoration-border group-hover:underline-offset-[6px]">
                  {featured.title}
                </h2>
                <p className="mt-4 max-w-[68ch] text-pretty text-[16px] leading-7 text-muted-foreground">{postSummary(featured)}</p>
              </div>
              <div className="flex items-end justify-between gap-4 border-t border-border pt-5 md:flex-col md:items-start md:justify-end md:border-l md:border-t-0 md:pl-6 md:pt-0">
                <PostByline post={featured} />
                <span className="inline-flex items-center gap-1.5 text-sm text-foreground">
                  Read article
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </span>
              </div>
            </Link>
          ) : null}

          {list.length > 0 ? (
            <ul className="grid gap-5 md:grid-cols-2">
              {list.map((post) => (
                <li key={post.id}>
                  <Link
                    href={`/blog/${post.id}`}
                    className="group flex h-full flex-col rounded-xl border border-border p-6 transition-colors hover:border-foreground/30"
                  >
                    <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-primary">
                      {post.category}
                      {post.source === "community" ? <span className="text-muted-foreground"> · Community</span> : null}
                    </p>
                    <h2 className="mt-2.5 text-pretty text-[21px] font-normal leading-snug text-foreground group-hover:underline group-hover:decoration-border group-hover:underline-offset-4">
                      {post.title}
                    </h2>
                    <p className="mt-3 line-clamp-3 flex-1 text-pretty text-[15px] leading-7 text-muted-foreground">
                      {postSummary(post)}
                    </p>
                    <div className="mt-5 border-t border-border pt-4">
                      <PostByline post={post} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}

          {posts.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border px-6 py-16 text-center">
              <p className="text-[15px] text-foreground">No articles yet</p>
              <p className="mt-1.5 text-sm text-muted-foreground">Be the first to write one.</p>
              <Link href="/blog/submit" className="mt-4 inline-flex text-sm text-foreground underline underline-offset-4">
                Write for the blog
              </Link>
            </div>
          ) : null}

          <section
            aria-labelledby="write"
            className="mt-16 grid gap-6 rounded-xl border border-border bg-card p-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:p-8"
          >
            <div>
              <h2 id="write" className="text-2xl font-normal text-foreground">
                Write for the Claude Directory blog
              </h2>
              <p className="mt-2 max-w-[62ch] text-sm leading-7 text-muted-foreground">
                Share something you built or learned with Claude: a workflow, a Skill, an MCP setup, a lesson from
                production. Posts go out under your name and link to your profile. We read every submission and publish
                the ones that are specific, accurate and useful.
              </p>
            </div>
            <Link
              href="/blog/submit"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-border px-5 text-sm text-foreground hover:border-foreground/30"
            >
              Submit a post
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </section>

          <nav aria-label="Explore the directory" className="mt-10 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
            <span>Explore:</span>
            <Link href="/skills" className="text-foreground underline underline-offset-4 hover:text-primary">
              Claude Skills
            </Link>
            <Link href="/mcp" className="text-foreground underline underline-offset-4 hover:text-primary">
              MCP servers
            </Link>
            <Link href="/agents" className="text-foreground underline underline-offset-4 hover:text-primary">
              Claude Agents
            </Link>
            <Link href="/guides" className="text-foreground underline underline-offset-4 hover:text-primary">
              Guides
            </Link>
          </nav>
        </section>
      </main>
      <Footer />
    </div>
  );
}
