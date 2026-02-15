"use client";

import { use } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Copy, ThumbsUp, CheckCircle } from "lucide-react";
import PageBreadcrumb from "@/components/layout/PageBreadcrumb";
import { usePrompt, useUpvotePrompt } from "@/hooks/use-prompts";
import { toast } from "sonner";

export default function PromptDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { data: prompt, isLoading } = usePrompt(slug);
  const upvote = useUpvotePrompt();

  const copyPrompt = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Prompt copied to clipboard");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container py-10 max-w-3xl">
          <PageBreadcrumb items={[
            { label: "Prompts", href: "/prompts" },
            { label: prompt?.title || "..." },
          ]} />

          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          ) : prompt ? (
            <div>
              {/* Header */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className="text-xs">{prompt.category}</Badge>
                  {prompt.complexity && (
                    <Badge variant="outline" className="text-xs">{prompt.complexity}</Badge>
                  )}
                  {prompt.verified && (
                    <CheckCircle className="h-3.5 w-3.5 text-primary" />
                  )}
                </div>
                <h1 className="text-2xl font-semibold text-foreground mb-2">{prompt.title}</h1>
                <p className="text-sm text-muted-foreground">{prompt.description}</p>
              </div>

              {/* Prompt content */}
              <div className="rounded-xl border border-border bg-card overflow-hidden mb-6">
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-muted/30">
                  <span className="text-xs font-medium text-muted-foreground">Prompt</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs gap-1.5"
                    onClick={() => copyPrompt(prompt.prompt)}
                  >
                    <Copy className="h-3 w-3" />
                    Copy
                  </Button>
                </div>
                <div className="p-4">
                  <pre className="text-sm font-mono text-foreground/90 whitespace-pre-wrap leading-relaxed">
                    {prompt.prompt}
                  </pre>
                </div>
              </div>

              {/* Example input/output */}
              {prompt.example_input && (
                <div className="rounded-xl border border-border bg-card overflow-hidden mb-4">
                  <div className="px-4 py-2.5 border-b border-border bg-muted/30">
                    <span className="text-xs font-medium text-muted-foreground">Example Input</span>
                  </div>
                  <div className="p-4">
                    <pre className="text-sm text-muted-foreground whitespace-pre-wrap">{prompt.example_input}</pre>
                  </div>
                </div>
              )}

              {prompt.example_output && (
                <div className="rounded-xl border border-border bg-card overflow-hidden mb-6">
                  <div className="px-4 py-2.5 border-b border-border bg-muted/30">
                    <span className="text-xs font-medium text-muted-foreground">Example Output</span>
                  </div>
                  <div className="p-4">
                    <pre className="text-sm text-muted-foreground whitespace-pre-wrap">{prompt.example_output}</pre>
                  </div>
                </div>
              )}

              {/* Use cases */}
              {prompt.use_cases.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xs font-medium text-foreground mb-2 uppercase tracking-wider">Use Cases</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {prompt.use_cases.map((uc) => (
                      <Badge key={uc} variant="outline" className="text-xs">{uc}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {prompt.tags.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xs font-medium text-foreground mb-2 uppercase tracking-wider">Tags</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {prompt.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer actions */}
              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs gap-1.5"
                  onClick={() => upvote.mutate(slug, { onError: () => toast.error("Sign in to upvote") })}
                >
                  <ThumbsUp className="h-3 w-3" />
                  Upvote ({prompt.upvotes})
                </Button>
                <Button
                  size="sm"
                  className="text-xs gap-1.5"
                  onClick={() => copyPrompt(prompt.prompt)}
                >
                  <Copy className="h-3 w-3" />
                  Copy Prompt
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Prompt not found.</p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
