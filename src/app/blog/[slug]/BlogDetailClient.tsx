"use client";

import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { Clock, User, Calendar } from "lucide-react";
import PageBreadcrumb from "@/components/layout/PageBreadcrumb";
import { useMemo, useEffect, useState } from "react";
import type { BlogPost } from "@/types";

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
  const codeBlocks: string[] = [];

  // Code blocks (``` ... ```)
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_match, lang, code) => {
    const formattedCode = escapeHtml(code.trim());
    codeBlocks.push(`<pre class="rounded-xl bg-[#0a0a0a] border border-border/50 p-5 overflow-x-auto my-8 shadow-sm"><code class="text-[13px] leading-[1.7] text-zinc-300 font-mono">${formattedCode}</code></pre>`);
    return `__CODE_BLOCK_${codeBlocks.length - 1}__`;
  });

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code class="bg-muted/80 px-1.5 py-0.5 rounded border border-border/30 text-[13px] text-foreground font-mono">$1</code>');

  // Headings with IDs for TOC
  html = html.replace(/^### (.+)$/gm, (_match, text) => {
    const id = text.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
    return `<h3 id="${id}" class="text-lg font-semibold text-foreground mt-8 mb-4 scroll-mt-20 tracking-tight">${text}</h3>`;
  });
  html = html.replace(/^## (.+)$/gm, (_match, text) => {
    const id = text.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
    return `<h2 id="${id}" class="text-xl font-bold text-foreground mt-12 mb-5 scroll-mt-20 tracking-tight pb-2 border-b border-border/40">${text}</h2>`;
  });
  html = html.replace(/^# (.+)$/gm, (_match, text) => {
    const id = text.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
    return `<h1 id="${id}" class="text-2xl font-extrabold text-foreground mt-12 mb-6 scroll-mt-20 tracking-tight">${text}</h1>`;
  });

  // Bold and italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong class="text-foreground"><em>$1</em></strong>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>');
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary hover:text-primary/80 transition-colors font-medium underline underline-offset-4 decoration-primary/30 hover:decoration-primary/80" target="_blank" rel="noopener noreferrer">$1</a>');

  // Unordered lists
  html = html.replace(/^- (.+)$/gm, '<li class="ml-5 list-disc text-[15px] text-muted-foreground/90 leading-relaxed">$1</li>');
  html = html.replace(/(<li[^>]*>.*<\/li>\n?)+/g, '<ul class="my-5 space-y-2">$&</ul>');

  // Ordered lists
  html = html.replace(/^\d+\. (.+)$/gm, '<li class="ml-5 list-decimal text-[15px] text-muted-foreground/90 leading-relaxed">$1</li>');

  // Blockquotes
  html = html.replace(/^> (.+)$/gm, '<blockquote class="border-l-[3px] border-primary/40 bg-muted/30 pl-5 py-3 pr-4 rounded-r-lg my-6 text-[15px] text-muted-foreground italic">$1</blockquote>');

  // Horizontal rules
  html = html.replace(/^---$/gm, '<hr class="my-10 border-border/60" />');

  // Paragraphs - wrap remaining lines
  html = html.replace(/^(?!<[a-z]|__CODE_BLOCK_)((?!^$).+)$/gm, '<p class="text-[15px] text-muted-foreground/90 leading-relaxed mb-6">$1</p>');

  // Clean up empty paragraphs
  html = html.replace(/<p[^>]*>\s*<\/p>/g, "");

  // Restore code blocks
  html = html.replace(/__CODE_BLOCK_(\d+)__/g, (_match, index) => {
    return codeBlocks[Number(index)];
  });

  return html;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const BlogDetailClient = ({ post }: { post: BlogPost | null }) => {
  const [activeId, setActiveId] = useState("");

  const contentWithoutMainTitle = useMemo(() => {
    if (!post) return "";
    let content = post.content.trimStart();
    if (content.startsWith("# ")) {
      const firstNewline = content.indexOf("\n");
      if (firstNewline !== -1) {
        content = content.substring(firstNewline).trimStart();
      } else {
        content = "";
      }
    }
    return content;
  }, [post]);

  const toc = useMemo(() => extractTOC(contentWithoutMainTitle), [contentWithoutMainTitle]);
  const renderedContent = useMemo(() => renderMarkdown(contentWithoutMainTitle), [contentWithoutMainTitle]);

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
        <div className="container py-16">
          <PageBreadcrumb items={[
            { label: "Blog", href: "/blog" },
            { label: post.title },
          ]} />

          <div className="flex gap-10">
            {/* Main content */}
            <article className="min-w-0 flex-1">
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
                        className={`block text-xs leading-relaxed transition-colors ${item.level === 1
                          ? "pl-0"
                          : item.level === 2
                            ? "pl-3"
                            : "pl-6"
                          } ${activeId === item.id
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
