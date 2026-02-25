"use client";

import { useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, Copy, ArrowUpRight, Loader2 } from "lucide-react";
import { useInfinitePrompts } from "@/hooks/use-prompts";
import { toast } from "sonner";
import { CollectionPageSchema } from "@/components/seo/JsonLd";
import type { Prompt } from "@/types";

const categories = ["All", "Coding", "Writing", "Analysis", "Business", "Creative", "Education"];

export default function PromptsClient({
  initialData,
  initialParams,
}: {
  initialData: Prompt[];
  initialParams: { category?: string; search?: string };
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const search = searchParams.get("search") ?? "";
  const category = searchParams.get("category") ?? "All";

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfinitePrompts(
    {
      search: search || undefined,
      category: category === "All" ? undefined : category,
    },
    { initialData }
  );

  const seen = new Set<string>();
  const prompts = (data?.pages.flat() ?? []).filter((p) => {
    if (seen.has(p.id)) return false;
    seen.add(p.id);
    return true;
  });

  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const copyPrompt = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Prompt copied to clipboard");
  };

  const setCategory = useCallback((value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "All") params.set("category", value);
    else params.delete("category");
    router.push(`/prompts?${params.toString()}`);
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <CollectionPageSchema
        name="AI Prompts"
        description="Curated, copy-ready prompts for Claude AI across coding, writing, analysis, and more."
        url="https://claudeai.directory/prompts"
      />
      <Header />
      <main className="flex-1">
        <div className="container py-10">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-foreground mb-2">Prompts</h1>
            <p className="text-sm text-muted-foreground">Copy-ready prompts for every use case</p>
          </div>

          <div className="flex items-center gap-1.5 mb-6 overflow-x-auto">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-2.5 py-1 text-[11px] rounded-md border transition-colors whitespace-nowrap ${category === c
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border text-muted-foreground hover:text-foreground"
                  }`}
              >
                {c}
              </button>
            ))}
          </div>

          <>
            <p className="mb-4 text-xs text-muted-foreground">{prompts.length} prompts found</p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {prompts.map((prompt) => (
                <Link
                  key={prompt.id}
                  href={`/prompts/${prompt.id}`}
                  className="group rounded-lg border border-border bg-card p-4 hover:bg-accent/50 hover:border-primary/20 transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                      {prompt.title}
                    </h3>
                    <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{prompt.description}</p>
                  <div className="bg-muted/50 rounded-md p-2 mb-3">
                    <p className="text-xs font-mono text-muted-foreground line-clamp-3">{prompt.prompt}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{prompt.category}</Badge>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <ThumbsUp className="h-3 w-3" />
                        {prompt.upvotes}
                      </span>
                    </div>
                    <button
                      onClick={(e) => { e.preventDefault(); copyPrompt(prompt.prompt); }}
                      className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                    >
                      <Copy className="h-3 w-3" />
                      Copy
                    </button>
                  </div>
                </Link>
              ))}
            </div>
            {prompts.length === 0 && (
              <div className="py-16 text-center">
                <p className="text-sm text-muted-foreground">No prompts found.</p>
              </div>
            )}

            {/* Infinite scroll sentinel */}
            <div ref={sentinelRef} className="py-6 flex justify-center">
              {isFetchingNextPage && (
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              )}
            </div>
          </>

          <section className="mt-20 border-t border-border pt-12 max-w-3xl">
            <h2 className="text-lg font-semibold text-foreground mb-4">What are Prompts?</h2>
            <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
              <p>
                <strong className="text-foreground">AI Prompts</strong> are ready-to-use, copy-paste
                instructions that help you get better results from Claude. Each prompt is crafted for a
                specific task so you can skip the trial-and-error and get straight to useful output.
              </p>
              <h3 className="text-sm font-medium text-foreground pt-2">How to use a prompt</h3>
              <p>
                Browse the library above, find a prompt that matches your task, and click <strong className="text-foreground">Copy</strong> to
                grab it. Paste it into Claude and replace any placeholder values with your own context.
                You can also{" "}
                <Link href="/submit" className="text-primary hover:underline">submit your own prompts</Link>.
              </p>
            </div>
          </section>

          <section className="mt-12 border-t border-border pt-10 max-w-3xl">
            <h3 className="text-lg font-medium text-foreground mb-3">Explore more from ClaudeAI Directory</h3>
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm">
              <Link href="/skills" className="text-primary hover:underline">Claude Skills</Link>
              <Link href="/mcp" className="text-primary hover:underline">MCP Connectors</Link>
              <Link href="/showcase" className="text-primary hover:underline">Community Showcase</Link>
              <Link href="/jobs" className="text-primary hover:underline">AI Jobs</Link>
              <Link href="/learn" className="text-primary hover:underline">Learn &amp; Resources</Link>
              <Link href="/feed" className="text-primary hover:underline">Latest Feed</Link>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
