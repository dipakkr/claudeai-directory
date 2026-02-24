"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, ThumbsUp, CheckCircle, ArrowLeft, ArrowRight } from "lucide-react";
import { usePrompt, usePrompts } from "@/hooks/use-prompts";
import { toast } from "sonner";
import PageBreadcrumb from "@/components/layout/PageBreadcrumb";
import type { Prompt } from "@/types";

export default function PromptDetailClient({ prompt: initialPrompt, id }: { prompt: Prompt | null; id: string }) {
  const { data: fetchedPrompt } = usePrompt(initialPrompt ? "" : id);
  const prompt = initialPrompt ?? fetchedPrompt ?? null;
  const [copied, setCopied] = useState(false);

  // Fetch related prompts from same category
  const { data: relatedPrompts } = usePrompts(
    { category: prompt?.category, limit: 6 },
    { initialData: undefined }
  );
  const related = relatedPrompts?.filter((p) => p.id !== prompt?.id).slice(0, 5) ?? [];

  const copyPrompt = () => {
    if (!prompt) return;
    navigator.clipboard.writeText(prompt.prompt);
    setCopied(true);
    toast.success("Prompt copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  if (!prompt) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-medium text-foreground mb-2">Prompt not found</h1>
            <Link href="/prompts">
              <Button variant="outline" size="sm">Back to Prompts</Button>
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
        <div className="container py-8">
          <PageBreadcrumb items={[
            { label: "Prompts", href: "/prompts" },
            { label: prompt.title },
          ]} />

          <div className="flex gap-10 items-start">
            {/* Main content */}
            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="mb-6">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h1 className="text-2xl font-semibold text-foreground">{prompt.title}</h1>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground shrink-0">
                    <ThumbsUp className="h-4 w-4" />
                    {prompt.upvotes}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{prompt.description}</p>
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <Badge variant="secondary">{prompt.category}</Badge>
                  <Badge variant="outline">{prompt.complexity}</Badge>
                  {prompt.verified && (
                    <span className="flex items-center gap-1 text-xs text-primary">
                      <CheckCircle className="h-3.5 w-3.5" />
                      Verified
                    </span>
                  )}
                </div>
              </div>

              {/* Prompt box */}
              <div className="rounded-xl border border-border bg-card mb-6">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Prompt</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={copyPrompt}
                    className="h-7 text-xs gap-1.5"
                  >
                    {copied ? <CheckCircle className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? "Copied" : "Copy"}
                  </Button>
                </div>
                <pre className="p-4 text-sm font-mono text-foreground/90 whitespace-pre-wrap break-words leading-relaxed">
                  {prompt.prompt}
                </pre>
              </div>

              {prompt.example_input && (
                <div className="mb-6">
                  <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Example Input</h2>
                  <div className="rounded-lg border border-border bg-muted/30 p-4">
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{prompt.example_input}</p>
                  </div>
                </div>
              )}

              {prompt.example_output && (
                <div className="mb-6">
                  <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Example Output</h2>
                  <div className="rounded-lg border border-border bg-muted/30 p-4">
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{prompt.example_output}</p>
                  </div>
                </div>
              )}

              {prompt.use_cases.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Use Cases</h2>
                  <ul className="space-y-1.5">
                    {prompt.use_cases.map((uc, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                        {uc}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {prompt.tags.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Tags</h2>
                  <div className="flex flex-wrap gap-1.5">
                    {prompt.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-border">
                <Link href="/prompts" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back to Prompts
                </Link>
              </div>
            </div>

            {/* Right sidebar */}
            <aside className="hidden lg:block w-72 shrink-0">
              <div className="sticky top-20 space-y-6">
                {/* Related prompts */}
                {related.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 mb-3">
                      Related Prompts
                    </p>
                    <div className="space-y-1">
                      {related.map((p) => (
                        <Link
                          key={p.id}
                          href={`/prompts/${p.id}`}
                          className="group flex items-start justify-between gap-2 rounded-lg px-3 py-2.5 hover:bg-accent transition-colors"
                        >
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2">
                              {p.title}
                            </p>
                            <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
                              <ThumbsUp className="h-2.5 w-2.5" />
                              {p.upvotes}
                            </p>
                          </div>
                          <ArrowRight className="h-3 w-3 text-muted-foreground/40 group-hover:text-primary shrink-0 mt-0.5 transition-colors" />
                        </Link>
                      ))}
                    </div>
                    <Link
                      href={`/prompts?category=${prompt.category}`}
                      className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary transition-colors mt-2 px-3"
                    >
                      View all {prompt.category} prompts
                      <ArrowRight className="h-2.5 w-2.5" />
                    </Link>
                  </div>
                )}

                {/* Tags */}
                {prompt.tags.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 mb-3">
                      Tags
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {prompt.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-[10px] cursor-pointer hover:border-primary hover:text-primary transition-colors">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick copy CTA */}
                <div className="rounded-xl border border-border bg-card p-4">
                  <p className="text-xs font-medium text-foreground mb-1">Use this prompt</p>
                  <p className="text-[11px] text-muted-foreground mb-3 leading-relaxed">
                    Copy and paste directly into Claude to get started.
                  </p>
                  <Button
                    size="sm"
                    className="w-full h-8 text-xs gap-1.5"
                    onClick={copyPrompt}
                  >
                    {copied ? <CheckCircle className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? "Copied!" : "Copy Prompt"}
                  </Button>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
