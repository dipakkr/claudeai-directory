"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";
import { useBlogPosts } from "@/hooks/use-blog";
import type { BlogPost } from "@/types";

const categories = ["All", "Tutorial", "Guide", "Deep Dive", "News", "Case Study"];

function formatDate(dateStr?: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "numeric", day: "numeric", year: "2-digit" });
}

function BlogCard({ post }: { post: BlogPost }) {
  return (
    <Link
      href={`/learn/${post.id}`}
      className="group block rounded-lg border border-border bg-card overflow-hidden hover:border-primary/20 transition-all"
    >
      {/* Cover image */}
      <div className="aspect-[16/9] bg-muted overflow-hidden">
        {post.cover_image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.cover_image}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 via-primary/10 to-muted flex items-center justify-center">
            <span className="text-3xl font-bold text-primary/30">
              {post.title[0]?.toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Tags + Date */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 flex-wrap min-w-0">
            {post.tags.slice(0, 3).map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="text-[10px] px-1.5 py-0 capitalize"
              >
                {tag}
              </Badge>
            ))}
          </div>
          <span className="text-[11px] text-muted-foreground whitespace-nowrap shrink-0">
            {formatDate(post.published_at || post.created_at)}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-sm font-medium text-foreground mb-3 line-clamp-2 group-hover:text-primary transition-colors">
          {post.title}
        </h3>

        {/* Author */}
        <div className="flex items-center gap-2">
          {post.author_avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.author_avatar}
              alt={post.author}
              className="h-5 w-5 rounded-full object-cover"
            />
          ) : (
            <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center text-[10px] font-medium text-muted-foreground">
              {post.author?.[0]?.toUpperCase()}
            </div>
          )}
          <span className="text-xs text-muted-foreground">{post.author}</span>
        </div>
      </div>
    </Link>
  );
}

const Learn = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const { data: posts, isLoading } = useBlogPosts({
    search: search || undefined,
    category: category === "All" ? undefined : category,
  });

  const featured = (posts ?? []).filter((p) => p.featured);
  const rest = (posts ?? []).filter((p) => !p.featured);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container py-10">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-foreground mb-2">Learn</h1>
            <p className="text-sm text-muted-foreground">
              Tutorials, guides, and articles about Claude AI
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search articles..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 bg-card border-border pl-10 text-sm"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
                    category === c
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-lg border border-border bg-card overflow-hidden">
                  <Skeleton className="aspect-[16/9] w-full" />
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Featured section */}
              {featured.length > 0 && (
                <div className="mb-10">
                  <h2 className="text-base font-medium text-foreground mb-4">Featured</h2>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {featured.map((post) => (
                      <BlogCard key={post.id} post={post} />
                    ))}
                  </div>
                </div>
              )}

              {/* All posts */}
              {rest.length > 0 && (
                <div>
                  {featured.length > 0 && (
                    <h2 className="text-base font-medium text-foreground mb-4">All Articles</h2>
                  )}
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {rest.map((post) => (
                      <BlogCard key={post.id} post={post} />
                    ))}
                  </div>
                </div>
              )}

              {(posts ?? []).length === 0 && (
                <div className="py-16 text-center">
                  <p className="text-sm text-muted-foreground">No articles found.</p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Learn;
