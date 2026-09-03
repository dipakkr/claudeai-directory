"use client";

import Link from "next/link";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Check, Copy, Github, Wrench, Server, FileText } from "lucide-react";
import PageBreadcrumb from "@/components/layout/PageBreadcrumb";
import ResourceReplies from "@/components/shared/ResourceReplies";
import { useSkill } from "@/hooks/use-skills";
import type { Skill } from "@/types";

export default function SkillDetail({ skill: initialSkill, id }: { skill: Skill | null; id: string }) {
  const { data: fetchedSkill } = useSkill(initialSkill ? "" : id);
  const skill = initialSkill ?? fetchedSkill ?? null;
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container py-10">
          <PageBreadcrumb items={[
            { label: "Skills", href: "/skills" },
            { label: skill?.title || skill?.name || "..." },
          ]} />

          {skill ? (
            <div className="flex gap-8">
              {/* Main content */}
              <div className="flex-1 min-w-0">
                <div className="mb-8">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-xl font-medium shrink-0">
                      {skill.name[0]?.toUpperCase()}
                    </div>
                    <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2">
                      {skill.title || skill.name}
                    </h1>
                  </div>
                  <p className="text-base text-muted-foreground leading-relaxed">
                    {skill.description}
                  </p>
                </div>

                {skill.tags.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-xs font-bold text-foreground/80 mb-3 uppercase tracking-wider">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {skill.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs bg-background hover:bg-muted font-normal rounded-full px-3 py-1">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {skill.triggers.length > 0 && (
                  <div className="mb-10">
                    <h3 className="text-xs font-bold text-foreground/80 mb-3 uppercase tracking-wider">Triggers</h3>
                    <div className="flex flex-wrap gap-2">
                      {skill.triggers.map((t) => (
                        <code key={t} className="px-2.5 py-1.5 rounded-md bg-muted/50 border border-border/50 text-xs font-mono text-foreground/90">
                          {t}
                        </code>
                      ))}
                    </div>
                  </div>
                )}

                {skill.content && (
                  <div className="mb-8">
                    <h3 className="text-xs font-bold text-foreground/80 mb-4 uppercase tracking-wider">Skill Documentation</h3>
                    <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
                      <article className="guide-prose">
                        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSlug]}>
                          {skill.content}
                        </ReactMarkdown>
                      </article>
                    </div>
                  </div>
                )}

                <ResourceReplies resourceType="skill" resourceId={skill.id} />
              </div>

              {/* Right sidebar */}
              <div className="hidden lg:block w-72 shrink-0">
                <div className="sticky top-20 space-y-4">
                  {/* Install card */}
                  <div className="rounded-xl border border-border bg-card p-5">
                    <h3 className="text-sm font-semibold text-foreground mb-1.5">Install this skill</h3>
                    <p className="text-xs text-muted-foreground mb-3">
                      Copies the skill into Claude Code&apos;s skills folder:
                    </p>
                    <InstallCommand name={skill.name} location={skill.location} />
                    <div className="space-y-2 mt-3">
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

function InstallCommand({ name, location }: { name: string; location?: string }) {
  const [copied, setCopied] = useState(false);

  // Derive the repo subpath from location ("skills/<name>/SKILL.md");
  // older rows carry container paths like /mnt/skills/... - ignore those
  // and default to the official anthropics/skills layout.
  const subpath =
    location && !location.startsWith("/")
      ? location.replace(/\/SKILL\.md$/, "")
      : `skills/${name}`;
  const command = `npx degit anthropics/skills/${subpath} ~/.claude/skills/${name}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      className="group flex w-full items-start gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2.5 text-left transition-colors hover:border-foreground/25"
      title="Copy install command"
    >
      <code className="flex-1 break-all font-mono text-[11px] leading-relaxed text-foreground/90">
        {command}
      </code>
      {copied ? (
        <Check className="h-3.5 w-3.5 shrink-0 mt-0.5 text-emerald-600" />
      ) : (
        <Copy className="h-3.5 w-3.5 shrink-0 mt-0.5 text-muted-foreground group-hover:text-foreground" />
      )}
    </button>
  );
}
