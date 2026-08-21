"use client";

import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useBlogPosts } from "@/hooks/use-blog";
import { CollectionPageSchema } from "@/components/seo/JsonLd";
import type { BlogPost } from "@/types";

export default function BlogClient({
  initialData,
}: {
  initialData: BlogPost[];
  initialParams: { category?: string; search?: string };
}) {
  const { data: posts } = useBlogPosts({}, { initialData });

  return (
    <div className="cad-shell flex flex-col">
      <CollectionPageSchema
        name="Blog"
        description="Articles, tutorials, and guides about Claude AI, MCP servers, prompt engineering, and building with AI."
        url="https://www.claudeai.directory/blog"
      />
      <Header />
      <main className="flex-1">
        <div className="mx-auto flex max-w-[860px] flex-col gap-3 px-8 pb-[34px] pt-[60px]">
          <h1 className="text-[clamp(32px,4vw,42px)] font-medium leading-[1.08]">Blog</h1>
          <div className="max-w-[60ch] text-base leading-[1.6] text-muted-foreground">
            Field notes on skills, MCP and connectors, written by the people maintaining the index.
          </div>
        </div>

        <div className="mx-auto flex max-w-[860px] flex-col px-8 pb-[88px]">
            {(posts ?? []).map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.id}`}
                className="flex flex-col gap-2 border-t border-border py-[26px] transition-opacity hover:opacity-70"
              >
                <div className="flex flex-wrap gap-3 text-[12.5px] text-[var(--cad-faint)]">
                  <span className="whitespace-nowrap">
                    {post.published_at ? new Date(post.published_at).toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric" }) : "Community"}
                  </span>
                  <span className="whitespace-nowrap">{post.read_time ?? 5} min</span>
                  <span className="whitespace-nowrap text-primary">{post.category}</span>
                </div>
                <h2 className="text-pretty text-[23px] font-medium leading-[1.22]">{post.title}</h2>
                <p className="text-pretty text-[15px] leading-[1.6] text-muted-foreground">
                  {post.seo_description || post.content.substring(0, 180)}
                </p>
              </Link>
            ))}

          {(posts ?? []).length === 0 && (
            <div className="py-20 text-center">
              <p className="text-sm text-muted-foreground">No articles found.</p>
            </div>
          )}


          <section className="mt-20 border-t border-border pt-12 max-w-3xl">
            <h2 className="text-lg font-semibold text-foreground mb-4">Claude AI Blog & Resources</h2>
            <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
              <p>
                Stay up to date with the latest tutorials, guides, and deep dives about
                <strong className="text-foreground"> Claude AI</strong>. Our blog covers everything
                from getting started with Claude to advanced prompt engineering, MCP server development, and real-world use cases.
              </p>
            </div>
          </section>

          <section className="mt-12 border-t border-border pt-10 max-w-3xl">
            <h3 className="text-lg font-medium text-foreground mb-3">Explore more from ClaudeAI Directory</h3>
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm">
              <Link href="/skills" className="text-primary hover:underline">Claude Skills</Link>
              <Link href="/mcp" className="text-primary hover:underline">MCP Connectors</Link>
              <Link href="/prompts" className="text-primary hover:underline">Prompt Library</Link>
              <Link href="/showcase" className="text-primary hover:underline">Community Showcase</Link>
              <Link href="/jobs" className="text-primary hover:underline">AI Jobs</Link>
              <Link href="/learn" className="text-primary hover:underline">Learn &amp; Resources</Link>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
