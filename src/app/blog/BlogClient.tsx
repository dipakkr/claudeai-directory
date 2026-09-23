"use client";

import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useBlogPosts } from "@/hooks/use-blog";
import { CollectionPageSchema } from "@/components/seo/JsonLd";
import { ArrowRight } from "lucide-react";
import type { BlogPost } from "@/types";

function formatDate(date?: string) {
  if (!date) return "Community";
  return new Date(date).toLocaleDateString("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function postHref(post: BlogPost) {
  return `/blog/${post.id}`;
}

function postSummary(post: BlogPost) {
  return post.seo_description || post.content.replace(/^# .+\n+/, "").slice(0, 180);
}

export default function BlogClient({
  initialData,
}: {
  initialData: BlogPost[];
  initialParams: { category?: string; search?: string };
}) {
  const { data: posts } = useBlogPosts({}, { initialData });
  const allPosts = posts ?? [];
  const featuredPost = allPosts.find((post) => post.featured) ?? allPosts[0];
  const remainingPosts = featuredPost ? allPosts.filter((post) => post.id !== featuredPost.id) : allPosts;

  return (
    <div className="cad-shell flex flex-col">
      <CollectionPageSchema
        name="Blog"
        description="Articles, tutorials, and guides about Claude AI, MCP servers, prompt engineering, and building with AI."
        url="https://www.claudeai.directory/blog"
      />
      <Header />
      <main className="flex-1">
        <section className="mx-auto max-w-[1120px] px-4 pb-8 pt-12 md:px-8 md:pb-12 md:pt-16">
          <div className="grid gap-8 border-b border-border pb-10 lg:grid-cols-[minmax(0,620px)_minmax(260px,1fr)] lg:items-end">
            <div>
              <p className="mb-3 font-mono text-xs uppercase tracking-[0.16em] text-primary">Claude AI blog</p>
              <h1 className="max-w-[12ch] text-balance text-4xl font-normal leading-[1.05] text-foreground md:text-5xl">
                Field notes for building with Claude
              </h1>
            </div>
            <p className="max-w-[48ch] text-pretty text-lg leading-8 text-muted-foreground lg:justify-self-end">
              Practical guides on Claude, tool use, MCP servers, Skills, agents and production patterns. Written for
              builders who want fewer demos and more reliable systems.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-[1120px] px-4 pb-20 md:px-8">
          {featuredPost ? (
            <Link
              href={postHref(featuredPost)}
              className="group grid gap-6 border-b border-border pb-9 transition-colors lg:grid-cols-[minmax(0,1fr)_260px]"
            >
              <div>
                <div className="mb-4 flex flex-wrap gap-3 text-sm text-muted-foreground">
                  <span>{formatDate(featuredPost.published_at)}</span>
                  <span>{featuredPost.read_time} min read</span>
                  <span className="text-primary">{featuredPost.category}</span>
                </div>
                <h2 className="max-w-[18ch] text-balance text-3xl font-normal leading-tight text-foreground md:text-4xl">
                  {featuredPost.title}
                </h2>
                <p className="mt-4 max-w-[68ch] text-pretty text-base leading-7 text-muted-foreground">
                  {postSummary(featuredPost)}
                </p>
              </div>
              <div className="flex items-end justify-between gap-4 border-t border-border pt-5 lg:border-t-0 lg:pt-0">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Featured</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Start here if you are designing production Claude workflows.
                  </p>
                </div>
                <ArrowRight
                  className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-foreground"
                  aria-hidden="true"
                />
              </div>
            </Link>
          ) : null}

          <div className="divide-y divide-border">
            {remainingPosts.map((post) => (
              <Link
                key={post.id}
                href={postHref(post)}
                className="group grid gap-4 py-7 transition-colors md:grid-cols-[150px_minmax(0,1fr)_32px]"
              >
                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground md:block md:space-y-2">
                  <p>{formatDate(post.published_at)}</p>
                  <p>{post.read_time} min</p>
                  <p className="text-primary">{post.category}</p>
                </div>
                <div>
                  <h2 className="text-pretty text-2xl font-medium leading-snug text-foreground">{post.title}</h2>
                  <p className="mt-2 max-w-[72ch] text-pretty text-[15px] leading-7 text-muted-foreground">
                    {postSummary(post)}
                  </p>
                </div>
                <ArrowRight
                  className="mt-1 hidden h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-foreground md:block"
                  aria-hidden="true"
                />
              </Link>
            ))}
          </div>

          {allPosts.length === 0 && (
            <div className="border-y border-border py-20 text-center">
              <p className="text-sm text-muted-foreground">No articles found.</p>
            </div>
          )}

          <section className="mt-16 grid gap-6 border-t border-border pt-9 md:grid-cols-[minmax(0,1fr)_minmax(260px,360px)]">
            <div>
              <h2 className="text-2xl font-normal text-foreground">Explore the directory</h2>
              <p className="mt-3 max-w-[62ch] text-sm leading-7 text-muted-foreground">
                Pair the articles with the live directory: compare Skills, MCP servers, prompts and community projects
                while you build.
              </p>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm md:justify-end">
              <Link href="/skills" className="text-foreground underline underline-offset-4 hover:text-primary">
                Skills
              </Link>
              <Link href="/mcp" className="text-foreground underline underline-offset-4 hover:text-primary">
                MCP servers
              </Link>
              <Link href="/prompts" className="text-foreground underline underline-offset-4 hover:text-primary">
                Prompts
              </Link>
              <Link href="/showcase" className="text-foreground underline underline-offset-4 hover:text-primary">
                Showcase
              </Link>
              <Link href="/learn" className="text-foreground underline underline-offset-4 hover:text-primary">
                Learn
              </Link>
            </div>
          </section>
        </section>
      </main>
      <Footer />
    </div>
  );
}
