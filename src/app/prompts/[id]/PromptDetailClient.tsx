"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, ThumbsUp, CheckCircle, ArrowLeft } from "lucide-react";
import { usePrompt } from "@/hooks/use-prompts";
import { toast } from "sonner";
import PageBreadcrumb from "@/components/layout/PageBreadcrumb";
import type { Prompt } from "@/types";

export default function PromptDetailClient({ prompt: initialPrompt, id }: { prompt: Prompt | null; id: string }) {
  const { data: fetchedPrompt } = usePrompt(initialPrompt ? "" : id);
  const prompt = initialPrompt ?? fetchedPrompt ?? null;
  const [copied, setCopied] = useState(false);

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
        <div className="container py-8 max-w-3xl">
          <PageBreadcrumb items={[
            { label: "Prompts", href: "/prompts" },
            { label: prompt.title },
          ]} />

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
              <h2 className="text-sm font-medium text-foreground mb-2 uppercase tracking-wider">Example Input</h2>
              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{prompt.example_input}</p>
              </div>
            </div>
          )}

          {prompt.example_output && (
            <div className="mb-6">
              <h2 className="text-sm font-medium text-foreground mb-2 uppercase tracking-wider">Example Output</h2>
              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{prompt.example_output}</p>
              </div>
            </div>
          )}

          {prompt.use_cases.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-medium text-foreground mb-2 uppercase tracking-wider">Use Cases</h2>
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
              <h2 className="text-sm font-medium text-foreground mb-2 uppercase tracking-wider">Tags</h2>
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
      </main>
      <Footer />
    </div>
  );
}
