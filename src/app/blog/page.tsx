"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Clock, ArrowUpRight, BookOpen } from "lucide-react";
import { useBlogPosts } from "@/hooks/use-blog";
import { CollectionPageSchema } from "@/components/seo/JsonLd";

const categories = ["All", "Tutorial", "Guide", "Deep Dive", "News", "Case Study"];

const Blog = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const { data: posts, isLoading } = useBlogPosts({
    search: search || undefined,
    category: category === "All" ? undefined : category,
  });

  const featuredPost = (posts ?? []).find((p) => p.featured);
  const otherPosts = (posts ?? []).filter((p) => p !== featuredPost);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <CollectionPageSchema
        name="Blog"
        description="Articles, tutorials, and guides about Claude AI, MCP servers, prompt engineering, and building with AI."
        url="https://claudeai.directory/blog"
      />
      <Header />
      <main className="flex-1">
        <div className="container py-10">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-foreground mb-2">Blog</h1>
            <p className="text-sm text-muted-foreground">
              Articles, tutorials, and guides about Claude AI and the ecosystem
            </p>
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search articles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 bg-card border-border pl-10 text-sm"
            />
          </div>

          <div className="flex items-center gap-1.5 mb-6 overflow-x-auto">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-2.5 py-1 text-[11px] rounded-md border transition-colors whitespace-nowrap ${
                  category === c
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-40 rounded-lg" />
              ))}
            </div>
          ) : (
            <>
              {/* Featured post */}
              {featuredPost && !search && category === "All" && (
                <Link
                  href={`/blog/${featuredPost.id}`}
                  className="group block rounded-lg border border-border bg-card p-6 mb-6 hover:bg-accent/50 hover:border-primary/20 transition-all"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Badge className="text-[10px] px-1.5 py-0 bg-primary/10 text-primary border-0">
                      Featured
                    </Badge>
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                      {featuredPost.category}
                    </Badge>
                  </div>
                  <h2 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {featuredPost.title}
                  </h2>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {featuredPost.seo_description || featuredPost.content.substring(0, 200)}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{featuredPost.author}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {featuredPost.read_time} min read
                    </span>
                    {featuredPost.published_at && (
                      <span>
                        {new Date(featuredPost.published_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    )}
                  </div>
                </Link>
              )}

              <p className="mb-4 text-xs text-muted-foreground">
                {otherPosts.length} articles
              </p>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {otherPosts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.id}`}
                    className="group rounded-lg border border-border bg-card p-4 hover:bg-accent/50 hover:border-primary/20 transition-all flex flex-col"
                  >
                    <div className="flex items-center gap-2 mb-2.5">
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        {post.category}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                        {post.difficulty}
                      </Badge>
                    </div>
                    <h3 className="text-sm font-medium text-foreground mb-2 group-hover:text-primary transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3 flex-1">
                      {post.seo_description || post.content.substring(0, 150)}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-3">
                        <span>{post.author}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {post.read_time} min
                        </span>
                      </div>
                      <ArrowUpRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </Link>
                ))}
              </div>
              {(posts ?? []).length === 0 && (
                <div className="py-16 text-center">
                  <p className="text-sm text-muted-foreground">No articles found.</p>
                </div>
              )}
            </>
          )}

          {/* SEO section */}
          <section className="mt-20 border-t border-border pt-12 max-w-3xl">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Claude AI Blog & Resources
            </h2>
            <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
              <p>
                Stay up to date with the latest tutorials, guides, and deep dives about
                <strong className="text-foreground"> Claude AI</strong>. Our blog covers everything
                from getting started with Claude to advanced prompt engineering, MCP server
                development, and real-world use cases.
              </p>
              <h3 className="text-sm font-medium text-foreground pt-2">
                What you&apos;ll find here
              </h3>
              <ul className="list-disc list-inside space-y-1 pl-1">
                <li><strong className="text-foreground">Tutorials:</strong> Step-by-step guides to help you build with Claude AI.</li>
                <li><strong className="text-foreground">Deep Dives:</strong> Technical explorations of Claude&apos;s capabilities and architecture.</li>
                <li><strong className="text-foreground">Case Studies:</strong> Real-world examples of teams and developers using Claude effectively.</li>
                <li><strong className="text-foreground">News:</strong> The latest updates from the Claude AI ecosystem.</li>
              </ul>
            </div>
          </section>

          {/* Interlinks */}
          <section className="mt-12 border-t border-border pt-10 max-w-3xl">
            <h3 className="text-lg font-medium text-foreground mb-3">
              Explore more from Claude Directory
            </h3>
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
};

export default Blog;
