"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, BookOpen, Search } from "lucide-react";
import { useBlogPosts } from "@/hooks/use-blog";
import { COURSES } from "@/data/courses";
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
  const mastery = COURSES.find((course) => course.slug === "claude-mastery");
  const roleCourses = COURSES.filter((course) => ["claude-for-gtm", "claude-for-seo"].includes(course.slug));
  const learningCourses = [mastery, ...roleCourses].filter(
    (course): course is (typeof COURSES)[number] => Boolean(course),
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-[1120px] px-4 py-10 md:px-8">
          <section className="mb-12">
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">Learn Claude</p>
            <div className="mt-3 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
              <div>
                <h1 className="max-w-[760px] text-balance text-[36px] font-normal leading-tight text-foreground md:text-[52px]">
                  From prompting Claude to working with Claude.
                </h1>
                <p className="mt-5 max-w-[680px] text-base leading-7 text-muted-foreground">
                  Start with the free Claude Mastery course, then use role-specific courses and guides to apply the
                  same mental models to GTM, SEO, product work and Claude Code.
                </p>
                {mastery ? (
                  <div className="mt-7 flex flex-wrap gap-3">
                    <Link
                      href={`/courses/${mastery.slug}/learn`}
                      className="inline-flex h-10 items-center gap-2 rounded-full bg-foreground px-5 text-sm font-medium text-background transition-colors hover:bg-foreground/85"
                    >
                      Start free course <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                    <Link
                      href={`/courses/${mastery.slug}`}
                      className="inline-flex h-10 items-center rounded-full border border-border px-5 text-sm text-foreground transition-colors hover:border-[var(--cad-line-hover)]"
                    >
                      View course path
                    </Link>
                  </div>
                ) : null}
              </div>
              <div className="rounded-xl border border-border bg-card/45 p-5">
                <p className="text-sm font-medium text-foreground">Featured learning path</p>
                <div className="mt-4 space-y-4">
                  {learningCourses.map((course) => (
                    <Link
                      key={course.slug}
                      href={`/courses/${course.slug}`}
                      className="flex gap-3 border-t border-border pt-4 first:border-t-0 first:pt-0"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-primary">
                        <BookOpen className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <span>
                        <span className="block text-sm font-medium text-foreground">{course.title}</span>
                        <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                          {course.isFree ? "Free public course" : `${course.category} workflow course`}
                        </span>
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <div className="mb-8 border-t border-border pt-10">
            <h2 className="text-2xl font-normal text-foreground mb-2">Articles and guides</h2>
            <p className="text-sm text-muted-foreground">
              Tutorials, guides, and articles about Claude AI.
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
                      ? "bg-foreground text-background border-primary"
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
