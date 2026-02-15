"use client";

import { use } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, CheckCircle, ExternalLink, Github, Wrench, Server, FileText } from "lucide-react";
import PageBreadcrumb from "@/components/layout/PageBreadcrumb";
import { useSkill } from "@/hooks/use-skills";

export default function SkillDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: skill, isLoading } = useSkill(id);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container py-10">
          <PageBreadcrumb items={[
            { label: "Skills", href: "/skills" },
            { label: skill?.title || "..." },
          ]} />

          {isLoading ? (
            <div className="flex gap-8">
              <div className="flex-1 space-y-4">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-6 w-64" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-32 w-full" />
              </div>
              <div className="hidden lg:block w-72 shrink-0">
                <Skeleton className="h-48 rounded-xl" />
              </div>
            </div>
          ) : skill ? (
            <div className="flex gap-8">
              {/* Main content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-4 mb-6">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-lg font-medium shrink-0">
                    {skill.name[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h1 className="text-lg font-semibold text-foreground flex items-center gap-2">
                      {skill.title || skill.name}
                      {skill.verified && <CheckCircle className="h-4 w-4 text-primary" />}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">{skill.description}</p>
                  </div>
                </div>

                {skill.tags.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-xs font-medium text-foreground mb-2 uppercase tracking-wider">Tags</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {skill.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {skill.triggers.length > 0 && (
                  <div>
                    <h3 className="text-xs font-medium text-foreground mb-2 uppercase tracking-wider">Triggers</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {skill.triggers.map((t) => (
                        <code key={t} className="px-2 py-1 rounded bg-muted text-xs font-mono text-foreground">{t}</code>
                      ))}
                    </div>
                  </div>
                )}

                {skill.content && (
                  <div className="mt-8">
                    <h3 className="text-xs font-medium text-foreground mb-3 uppercase tracking-wider">Skill Documentation</h3>
                    <div className="rounded-xl border border-border bg-card p-6 sm:p-8">
                      <article className="guide-prose">
                        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSlug]}>
                          {skill.content}
                        </ReactMarkdown>
                      </article>
                    </div>
                  </div>
                )}
              </div>

              {/* Right sidebar */}
              <div className="hidden lg:block w-72 shrink-0">
                <div className="sticky top-20 space-y-4">
                  {/* Install card */}
                  <div className="rounded-xl border border-border bg-card p-5">
                    <h3 className="text-sm font-semibold text-foreground mb-3">Install this skill</h3>
                    <div className="space-y-2">
                      {skill.source && (
                        <a href={skill.source} target="_blank" rel="noopener noreferrer" className="block">
                          <Button className="w-full text-sm">
                            <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                            Install
                          </Button>
                        </a>
                      )}
                      {skill.github_url && (
                        <a href={skill.github_url} target="_blank" rel="noopener noreferrer" className="block">
                          <Button variant="outline" className="w-full text-sm">
                            <Github className="mr-1.5 h-3.5 w-3.5" />
                            View Source
                          </Button>
                        </a>
                      )}
                    </div>
                    <div className="mt-4 pt-4 border-t border-border space-y-2 text-xs text-muted-foreground">
                      <div className="flex items-center justify-between">
                        <span>Downloads</span>
                        <span className="text-foreground">{skill.downloads.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Category</span>
                        <span className="text-foreground">{skill.category}</span>
                      </div>
                    </div>
                  </div>

                  {/* Explore more */}
                  <div className="rounded-xl border border-border bg-card p-5">
                    <h3 className="text-sm font-semibold text-foreground mb-3">Explore more</h3>
                    <div className="space-y-2">
                      <Link href="/skills" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
                        <Wrench className="h-3 w-3" /> Browse Skills
                      </Link>
                      <Link href="/mcp" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
                        <Server className="h-3 w-3" /> MCP Servers
                      </Link>
                      <Link href="/prompts" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
                        <FileText className="h-3 w-3" /> Prompts
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Skill not found.</p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
