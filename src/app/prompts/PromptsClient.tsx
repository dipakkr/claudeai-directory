"use client";

import { useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { CheckCircle, Copy, Loader2 } from "lucide-react";
import { useInfinitePrompts } from "@/hooks/use-prompts";
import { toast } from "sonner";
import { CollectionPageSchema } from "@/components/seo/JsonLd";
import type { Prompt } from "@/types";

const categories = ["All", "Coding", "Writing", "Analysis", "Business", "Creative", "Education"];

export default function PromptsClient({
  initialData,
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
    <div className="cad-shell flex flex-col">
      <CollectionPageSchema
        name="AI Prompts"
        description="Curated, copy-ready prompts for Claude AI across coding, writing, analysis, and more."
        url="https://www.claudeai.directory/prompts"
      />
      <Header />
      <main className="flex-1">
        <div className="mx-auto flex max-w-[1180px] flex-col gap-3 px-8 pb-[34px] pt-[60px]">
          <h1 className="text-[clamp(32px,4vw,42px)] font-medium leading-[1.08]">Prompts</h1>
          <p className="max-w-[62ch] text-base leading-[1.6] text-muted-foreground">Copy-ready prompts for every use case</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`cad-chip whitespace-nowrap px-3.5 text-[13px] ${category === c
                  ? "cad-chip-active"
                  : "bg-card hover:border-primary hover:text-primary"
                  }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="mx-auto max-w-[1180px] px-8 pb-[88px]">
          <>
            <p className="mb-4 text-xs text-muted-foreground">{prompts.length} prompts found</p>
            <div className="grid gap-3.5 [grid-template-columns:repeat(auto-fit,minmax(340px,1fr))]">
              {prompts.map((prompt) => (
                <Link
                  key={prompt.id}
                  href={`/prompts/${prompt.id}`}
                  className="group flex items-center gap-3.5 rounded-[9px] border border-border bg-card p-4 hover:border-[var(--cad-line-hover)]"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[var(--cad-chip)] text-sm font-medium text-[var(--cad-accent-hover)]">
                    {prompt.title[0]?.toUpperCase()}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex min-w-0 items-center gap-[7px]">
                      <div className="truncate text-[15px] font-semibold">{prompt.title}</div>
                      {prompt.verified && (
                        <div className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-[var(--cad-chip)] text-[9px] text-[var(--cad-faint)]">
                          <CheckCircle className="h-3 w-3" />
                        </div>
                      )}
                      <div className="shrink-0 whitespace-nowrap rounded-md bg-[var(--cad-accent-soft)] px-[7px] py-0.5 text-[10.5px] uppercase tracking-[0.06em] text-[var(--cad-accent-hover)]">
                        {prompt.category}
                      </div>
                    </div>
                    <div className="line-clamp-2 text-pretty text-[13px] leading-[1.45] text-muted-foreground">
                      {prompt.description}
                    </div>
                    <span className="text-xs text-[var(--cad-faint)]">
                      {prompt.upvotes.toLocaleString()} upvotes · {prompt.complexity}
                    </span>
                  </div>
                  <button
                    onClick={(e) => { e.preventDefault(); copyPrompt(prompt.prompt); }}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] border border-border bg-[var(--cad-raised)] text-muted-foreground group-hover:border-primary group-hover:text-primary"
                    title="Copy prompt"
                    aria-label={`Copy ${prompt.title}`}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
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
