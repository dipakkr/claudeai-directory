"use client";

import { useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Clock, ArrowUpRight, Link as LinkIcon, Triangle } from "lucide-react";
import { useBlogPosts } from "@/hooks/use-blog";
import { CollectionPageSchema } from "@/components/seo/JsonLd";
import type { BlogPost } from "@/types";

const categories = ["All", "Tutorial", "Guide", "Deep Dive", "News", "Case Study"];

export default function BlogClient({
  initialData,
  initialParams,
}: {
  initialData: BlogPost[];
  initialParams: { category?: string; search?: string };
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const search = searchParams.get("search") ?? "";
  const category = searchParams.get("category") ?? "All";

  const { data: posts } = useBlogPosts(
    {
      search: search || undefined,
      category: category === "All" ? undefined : category,
    },
    { initialData }
  );

  const featuredPost = (posts ?? []).find((p) => p.featured);
  const otherPosts = (posts ?? []).filter((p) => p !== featuredPost);

  const setSearch = useCallback((value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set("search", value);
    else params.delete("search");
    router.push(`/blog?${params.toString()}`);
  }, [router, searchParams]);

  const setCategory = useCallback((value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "All") params.set("category", value);
    else params.delete("category");
    router.push(`/blog?${params.toString()}`);
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <CollectionPageSchema
        name="Blog"
        description="Articles, tutorials, and guides about Claude AI, MCP servers, prompt engineering, and building with AI."
        url="https://www.claudeai.directory/blog"
      />
      <Header />
      <main className="flex-1">
        <div className="container py-16 max-w-4xl mx-auto">
          <div className="flex items-start sm:items-center justify-between gap-4 mb-12 flex-col sm:flex-row">
            <div>
              <h1 className="text-2xl font-medium text-foreground mb-1">Blog</h1>
              <p className="text-sm text-muted-foreground">
                Explore what the community is talking about
              </p>
            </div>
            <Link
              href="/submit"
              className="px-4 py-1.5 text-sm font-medium rounded-full border border-border/80 text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors whitespace-nowrap z-20"
            >
              Submit Article
            </Link>
          </div>

          <div className="flex flex-col">
            {(posts ?? []).map((post) => (
              <div
                key={post.id}
                className="group relative flex items-start gap-4 py-6 border-b border-border/40 hover:bg-white/[0.02] transition-colors -mx-4 px-4 rounded-xl"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded bg-[#1abc9c]/20 text-[9px] font-bold text-[#1abc9c] uppercase">
                      {post.author?.[0] ?? "C"}
                    </div>
                    <span className="text-xs text-muted-foreground font-medium code-font">
                      {post.author || "Community"}
                    </span>
                  </div>

                  <Link href={`/blog/${post.id}`} className="absolute inset-0 z-10">
                    <span className="sr-only">View {post.title}</span>
                  </Link>

                  <h3 className="text-base font-medium text-foreground mb-2 flex items-center gap-2 pr-4">
                    {post.title}
                    <LinkIcon className="h-3 w-3 shrink-0 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>

                  <p className="text-sm text-muted-foreground line-clamp-2 pr-8 leading-relaxed">
                    {post.seo_description || post.content.substring(0, 160)}
                  </p>
                </div>

                <div className="relative z-20 shrink-0 mt-8">
                  <div className="flex items-center gap-1.5 rounded-full px-3 py-1 bg-white/5 hover:bg-white/10 text-muted-foreground transition-colors cursor-pointer text-[11px] font-medium border border-border/30">
                    {post.read_time ?? 5}
                    <Triangle className="h-2 w-2 mb-[1px]" strokeWidth={2.5} />
                  </div>
                </div>
              </div>
            ))}
          </div>

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
