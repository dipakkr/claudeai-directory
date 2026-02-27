"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Copy, ThumbsUp, CheckCircle, ArrowLeft, ArrowRight, Pencil, RotateCcw } from "lucide-react";
import { usePrompt, usePrompts } from "@/hooks/use-prompts";
import { toast } from "sonner";
import PageBreadcrumb from "@/components/layout/PageBreadcrumb";
import type { Prompt } from "@/types";

export default function PromptDetailClient({ prompt: initialPrompt, id }: { prompt: Prompt | null; id: string }) {
  const { data: fetchedPrompt } = usePrompt(initialPrompt ? "" : id);
  const prompt = initialPrompt ?? fetchedPrompt ?? null;
  const [copied, setCopied] = useState(false);
  const [customizeOpen, setCustomizeOpen] = useState(false);

  const { markdown, text: actualPromptText } = useMemo(() => {
    if (!prompt?.prompt) return { markdown: "", text: "" };

    let markdown = "";
    let text = prompt.prompt;

    if (text.includes("## Prompt")) {
      const parts = text.split("## Prompt");
      markdown = parts[0].trim();

      let remainder = parts[1].trim();
      if (remainder.startsWith("```")) {
        const firstNewLine = remainder.indexOf('\n');
        // Handle code block language specifier like ```markdown
        if (firstNewLine !== -1 && firstNewLine < 20) {
          remainder = remainder.slice(firstNewLine + 1);
        } else {
          remainder = remainder.slice(3);
        }
        if (remainder.endsWith("```")) {
          remainder = remainder.slice(0, -3).trim();
        }
      }
      text = remainder.trim();
    }

    return { markdown, text };
  }, [prompt?.prompt]);

  const [customizedText, setCustomizedText] = useState("");
  const [customizeCopied, setCustomizeCopied] = useState(false);

  // Fetch related prompts from same category
  const { data: relatedPrompts } = usePrompts(
    { category: prompt?.category, limit: 6 },
    { initialData: undefined }
  );
  const related = relatedPrompts?.filter((p) => p.id !== prompt?.id).slice(0, 5) ?? [];

  const copyPrompt = () => {
    if (!prompt) return;
    navigator.clipboard.writeText(actualPromptText);
    setCopied(true);
    toast.success("Prompt copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const openCustomize = () => {
    if (!prompt) return;
    setCustomizedText(actualPromptText);
    setCustomizeOpen(true);
  };

  const copyCustomized = () => {
    navigator.clipboard.writeText(customizedText);
    setCustomizeCopied(true);
    toast.success("Customized prompt copied!");
    setTimeout(() => setCustomizeCopied(false), 2000);
  };

  const resetCustomized = () => {
    if (!prompt) return;
    setCustomizedText(actualPromptText);
    toast("Reset to original");
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

              {/* Use cases — compact chips */}
              {prompt.use_cases.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 mb-5">
                  <span className="text-xs text-muted-foreground mr-1">Best for:</span>
                  {prompt.use_cases.map((uc, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/40 px-2.5 py-0.5 text-xs text-muted-foreground"
                    >
                      {uc}
                    </span>
                  ))}
                </div>
              )}

              {/* Prompt parsed markdown removed */}

              {/* Prompt box */}
              <div className="rounded-xl border border-border bg-card mb-6">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Prompt</span>
                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={openCustomize}
                      className="h-7 text-xs gap-1.5"
                    >
                      <Pencil className="h-3 w-3" />
                      Customize
                    </Button>
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
                </div>
                <pre className="p-4 text-sm font-mono text-foreground/90 whitespace-pre-wrap break-words leading-relaxed">
                  {actualPromptText}
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
                          </div>
                          <ArrowRight className="h-3 w-3 text-muted-foreground/40 group-hover:text-primary shrink-0 mt-0.5 transition-colors" />
                        </Link>
                      ))}
                    </div>
                    <Link
                      href={`/prompts?category=${encodeURIComponent(prompt.category)}`}
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
                <div className="rounded-xl border border-border bg-card p-4 space-y-2">
                  <p className="text-xs font-medium text-foreground mb-1">Use this prompt</p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
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
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full h-8 text-xs gap-1.5"
                    onClick={openCustomize}
                  >
                    <Pencil className="h-3 w-3" />
                    Customize &amp; Copy
                  </Button>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />

      {/* Customize editor dialog */}
      <Dialog open={customizeOpen} onOpenChange={setCustomizeOpen}>
        <DialogContent className="max-w-3xl w-full h-[80vh] flex flex-col p-0 gap-0">
          <DialogHeader className="px-6 py-4 border-b border-border shrink-0">
            <DialogTitle className="text-base font-semibold">Customize Prompt</DialogTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Edit the prompt to fit your needs, then copy it.
            </p>
          </DialogHeader>

          <div className="flex-1 min-h-0 px-6 py-4">
            <textarea
              className="w-full h-full resize-none rounded-lg border border-border bg-muted/30 p-4 text-sm font-mono text-foreground/90 leading-relaxed focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
              value={customizedText}
              onChange={(e) => setCustomizedText(e.target.value)}
              spellCheck={false}
            />
          </div>

          <div className="px-6 py-4 border-t border-border flex items-center justify-between shrink-0">
            <button
              onClick={resetCustomized}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset to original
            </button>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setCustomizeOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" className="h-8 text-xs gap-1.5" onClick={copyCustomized}>
                {customizeCopied ? <CheckCircle className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                {customizeCopied ? "Copied!" : "Copy Prompt"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
