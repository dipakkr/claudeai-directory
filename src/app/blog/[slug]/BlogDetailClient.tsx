"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, User, Calendar } from "lucide-react";
import PageBreadcrumb from "@/components/layout/PageBreadcrumb";
import { useBlogPost } from "@/hooks/use-blog";
import { useMemo, useEffect, useState } from "react";

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

function extractTOC(content: string): TOCItem[] {
  const headingRegex = /^(#{1,3})\s+(.+)$/gm;
  const items: TOCItem[] = [];
  let match;
  while ((match = headingRegex.exec(content)) !== null) {
    const id = match[2]
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");
    items.push({
      id,
      text: match[2],
      level: match[1].length,
    });
  }
  return items;
}

function renderMarkdown(content: string): string {
  let html = content;

  // Code blocks (``` ... ```)
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_match, lang, code) => {
    return `<pre class="rounded-lg bg-muted/50 border border-border p-4 overflow-x-auto my-4"><code class="text-sm text-foreground">${escapeHtml(code.trim())}</code></pre>`;
  });

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code class="bg-muted px-1.5 py-0.5 rounded text-sm text-foreground">$1</code>');

  // Headings with IDs for TOC
  html = html.replace(/^### (.+)$/gm, (_match, text) => {
    const id = text.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
    return `<h3 id="${id}" class="text-base font-semibold text-foreground mt-8 mb-3 scroll-mt-20">${text}</h3>`;
  });
  html = html.replace(/^## (.+)$/gm, (_match, text) => {
    const id = text.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
    return `<h2 id="${id}" class="text-lg font-semibold text-foreground mt-10 mb-4 scroll-mt-20">${text}</h2>`;
  });
  html = html.replace(/^# (.+)$/gm, (_match, text) => {
    const id = text.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
    return `<h1 id="${id}" class="text-xl font-bold text-foreground mt-10 mb-4 scroll-mt-20">${text}</h1>`;
  });

  // Bold and italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong class="text-foreground"><em>$1</em></strong>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="text-foreground">$1</strong>');
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary hover:underline" target="_blank" rel="noopener noreferrer">$1</a>');

  // Unordered lists
  html = html.replace(/^- (.+)$/gm, '<li class="ml-4 list-disc text-sm text-muted-foreground leading-relaxed">$1</li>');
  html = html.replace(/(<li[^>]*>.*<\/li>\n?)+/g, '<ul class="my-3 space-y-1">$&</ul>');

  // Ordered lists
  html = html.replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal text-sm text-muted-foreground leading-relaxed">$1</li>');

  // Blockquotes
  html = html.replace(/^> (.+)$/gm, '<blockquote class="border-l-2 border-primary/30 pl-4 my-4 text-sm text-muted-foreground italic">$1</blockquote>');

  // Horizontal rules
  html = html.replace(/^---$/gm, '<hr class="my-6 border-border" />');

  // Paragraphs - wrap remaining lines
  html = html.replace(/^(?!<[a-z])((?!^$).+)$/gm, '<p class="text-sm text-muted-foreground leading-relaxed mb-4">$1</p>');

  // Clean up empty paragraphs
  html = html.replace(/<p[^>]*>\s*<\/p>/g, "");

  return html;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const BlogDetailClient = () => {
  const params = useParams();
  const slug = params.slug as string;
  const { data: post, isLoading } = useBlogPost(slug);
  const [activeId, setActiveId] = useState("");

  const toc = useMemo(() => (post ? extractTOC(post.content) : []), [post]);
  const renderedContent = useMemo(() => (post ? renderMarkdown(post.content) : ""), [post]);

  // Track active heading on scroll
  useEffect(() => {
    if (toc.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -80% 0px" }
    );

    for (const item of toc) {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [toc]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1">
          <div className="container py-10 max-w-4xl">
            <Skeleton className="h-8 w-3/4 mb-4" />
            <Skeleton className="h-4 w-1/2 mb-8" />
            <Skeleton className="h-96 w-full" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">Article not found</p>
            <Link href="/blog" className="text-sm text-primary hover:underline">
              Back to blog
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container py-10">
          <PageBreadcrumb items={[
            { label: "Blog", href: "/blog" },
            { label: post.title },
          ]} />

          <div className="flex gap-10">
            {/* Main content */}
            <article className="min-w-0 flex-1 max-w-3xl">
              {/* Header */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                    {post.category}
                  </Badge>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                    {post.difficulty}
                  </Badge>
                </div>

                <h1 className="text-2xl font-bold text-foreground mb-4 leading-tight">
                  {post.title}
                </h1>

                {post.seo_description && (
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                    {post.seo_description}
                  </p>
                )}

                <div className="flex items-center gap-4 text-xs text-muted-foreground pb-6 border-b border-border">
                  <span className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" />
                    {post.author}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    {post.read_time} min read
                  </span>
                  {post.published_at && (
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(post.published_at).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  )}
                </div>
              </div>

              {/* Article body */}
              <div
                className="prose-custom"
                dangerouslySetInnerHTML={{ __html: renderedContent }}
              />

              {/* Tags */}
              {post.tags.length > 0 && (
                <div className="mt-10 pt-6 border-t border-border">
                  <div className="flex flex-wrap gap-1.5">
                    {post.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-[10px] px-2 py-0.5">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Back link */}
              <div className="mt-8">
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                >
                  &larr; Back to all articles
                </Link>
              </div>
            </article>

            {/* TOC Sidebar */}
            {toc.length > 0 && (
              <aside className="hidden lg:block w-56 shrink-0">
                <div className="sticky top-20">
                  <p className="text-xs font-medium text-foreground uppercase tracking-wider mb-3">
                    On this page
                  </p>
                  <nav className="space-y-1">
                    {toc.map((item) => (
                      <a
                        key={item.id}
                        href={`#${item.id}`}
                        className={`block text-xs leading-relaxed transition-colors ${
                          item.level === 1
                            ? "pl-0"
                            : item.level === 2
                            ? "pl-3"
                            : "pl-6"
                        } ${
                          activeId === item.id
                            ? "text-primary font-medium"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {item.text}
                      </a>
                    ))}
                  </nav>
                </div>
              </aside>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BlogDetailClient;
