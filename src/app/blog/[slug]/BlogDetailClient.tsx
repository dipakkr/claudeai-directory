"use client";

import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Clock, User } from "lucide-react";
import PageBreadcrumb from "@/components/layout/PageBreadcrumb";
import { useMemo, useEffect, useState, type ReactNode } from "react";
import type { BlogPost } from "@/types";

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

function headingId(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function textFromChildren(children: ReactNode): string {
  if (typeof children === "string" || typeof children === "number") return String(children);
  if (Array.isArray(children)) return children.map(textFromChildren).join("");
  return "";
}

function extractTOC(content: string): TOCItem[] {
  const headingRegex = /^(#{2,3})\s+(.+)$/gm;
  const items: TOCItem[] = [];
  let match;
  while ((match = headingRegex.exec(content)) !== null) {
    items.push({
      id: headingId(match[2]),
      text: match[2],
      level: match[1].length,
    });
  }
  return items;
}

function formatDate(date?: string) {
  if (!date) return null;
  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function ArticleMarkdown({ content }: { content: string }) {
  return (
    <div className="blog-prose">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => {
            const text = textFromChildren(children);
            return (
              <h2 id={headingId(text)} className="scroll-mt-24">
                {children}
              </h2>
            );
          },
          h2: ({ children }) => {
            const text = textFromChildren(children);
            return (
              <h2 id={headingId(text)} className="scroll-mt-24">
                {children}
              </h2>
            );
          },
          h3: ({ children }) => {
            const text = textFromChildren(children);
            return (
              <h3 id={headingId(text)} className="scroll-mt-24">
                {children}
              </h3>
            );
          },
          a: ({ href, children }) => (
            <a href={href} target={href?.startsWith("/") ? undefined : "_blank"} rel="noopener noreferrer">
              {children}
            </a>
          ),
          pre: ({ children }) => <pre>{children}</pre>,
          code: ({ className, children }) => {
            const isBlock = Boolean(className);
            return <code className={isBlock ? className : undefined}>{children}</code>;
          },
          table: ({ children }) => (
            <div className="not-prose my-7 overflow-x-auto rounded-lg border border-border">
              <table>{children}</table>
            </div>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

const BlogDetailClient = ({ post }: { post: BlogPost | null }) => {
  const [activeId, setActiveId] = useState("");

  const contentWithoutMainTitle = useMemo(() => {
    if (!post) return "";
    let content = post.content.trimStart();
    if (content.startsWith("# ")) {
      const firstNewline = content.indexOf("\n");
      content = firstNewline !== -1 ? content.substring(firstNewline).trimStart() : "";
    }
    return content;
  }, [post]);

  const toc = useMemo(() => extractTOC(contentWithoutMainTitle), [contentWithoutMainTitle]);
  const publishedDate = formatDate(post?.published_at);

  useEffect(() => {
    if (toc.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        }
      },
      { rootMargin: "-96px 0px -72% 0px" }
    );

    for (const item of toc) {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [toc]);

  if (!post) {
    return (
      <div className="cad-shell flex flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center px-4">
          <div className="text-center">
            <p className="mb-4 text-sm text-muted-foreground">Article not found</p>
            <Link href="/blog" className="text-sm text-primary underline underline-offset-4">
              Back to blog
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="cad-shell flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-[1180px] px-4 pb-20 pt-8 md:px-8 md:pt-12">
          <PageBreadcrumb items={[{ label: "Blog", href: "/blog" }, { label: post.title }]} />

          <div className="mt-7 grid gap-10 lg:grid-cols-[minmax(0,740px)_260px] lg:items-start lg:justify-between">
            <article className="min-w-0">
              <Link
                href="/blog"
                className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Blog
              </Link>

              <header className="border-b border-border pb-8">
                <div className="mb-4 flex flex-wrap gap-2">
                  <Badge variant="secondary" className="rounded-full px-2.5 py-1 text-[11px]">
                    {post.category}
                  </Badge>
                  <Badge variant="outline" className="rounded-full px-2.5 py-1 text-[11px]">
                    {post.difficulty}
                  </Badge>
                </div>

                <h1 className="max-w-[760px] text-balance text-3xl font-normal leading-[1.08] text-foreground md:text-4xl">
                  {post.title}
                </h1>

                {post.seo_description && (
                  <p className="mt-5 max-w-[66ch] text-pretty text-lg leading-8 text-muted-foreground">
                    {post.seo_description}
                  </p>
                )}

                <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-2">
                    <User className="h-4 w-4" aria-hidden="true" />
                    {post.author}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Clock className="h-4 w-4" aria-hidden="true" />
                    {post.read_time} min read
                  </span>
                  {publishedDate && (
                    <span className="inline-flex items-center gap-2">
                      <Calendar className="h-4 w-4" aria-hidden="true" />
                      {publishedDate}
                    </span>
                  )}
                </div>
              </header>

              <ArticleMarkdown content={contentWithoutMainTitle} />

              {post.tags.length > 0 && (
                <footer className="mt-12 border-t border-border pt-6">
                  <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="rounded-full px-2.5 py-1 text-[11px]">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </footer>
              )}
            </article>

            <aside className="hidden lg:block">
              <div className="sticky top-24 border-l border-border pl-6">
                {toc.length > 0 && (
                  <>
                    <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                      On this page
                    </p>
                    <nav className="mt-4 space-y-1">
                      {toc.map((item) => (
                        <a
                          key={item.id}
                          href={`#${item.id}`}
                          className={`block py-1 text-sm leading-5 transition-colors ${
                            item.level === 3 ? "pl-4" : ""
                          } ${
                            activeId === item.id
                              ? "text-foreground"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {item.text}
                        </a>
                      ))}
                    </nav>
                  </>
                )}

                <div className="mt-8 border-t border-border pt-6">
                  <p className="text-sm leading-6 text-muted-foreground">
                    Browse Claude guides, skills, MCP servers and builder resources from the directory.
                  </p>
                  <Link
                    href="/learn"
                    className="mt-3 inline-flex text-sm text-foreground underline underline-offset-4 hover:text-primary"
                  >
                    Explore learning resources
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BlogDetailClient;
