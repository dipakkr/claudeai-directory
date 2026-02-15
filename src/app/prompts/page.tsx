"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, ThumbsUp, Copy, ArrowUpRight } from "lucide-react";
import { usePrompts } from "@/hooks/use-prompts";
import { toast } from "sonner";
import { CollectionPageSchema } from "@/components/seo/JsonLd";

const categories = ["All", "Coding", "Writing", "Analysis", "Business", "Creative", "Education"];

const Prompts = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const { data: prompts, isLoading } = usePrompts({
    search: search || undefined,
    category: category === "All" ? undefined : category,
  });

  const copyPrompt = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Prompt copied to clipboard");
  };

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
            <p className="text-sm text-muted-foreground">
              Copy-ready prompts for every use case
            </p>
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search prompts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 bg-card border-border pl-10 text-sm"
            />
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

          {isLoading ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-40 rounded-lg" />
              ))}
            </div>
          ) : (
            <>
              <p className="mb-4 text-xs text-muted-foreground">
                {prompts?.length ?? 0} prompts found
              </p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {(prompts ?? []).map((prompt) => (
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
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                      {prompt.description}
                    </p>
                    <div className="bg-muted/50 rounded-md p-2 mb-3">
                      <p className="text-xs font-mono text-muted-foreground line-clamp-3">
                        {prompt.prompt}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                          {prompt.category}
                        </Badge>
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
              {(prompts ?? []).length === 0 && (
                <div className="py-16 text-center">
                  <p className="text-sm text-muted-foreground">No prompts found.</p>
                </div>
              )}
            </>
          )}

          {/* SEO: What are AI Prompts */}
          <section className="mt-20 border-t border-border pt-12 max-w-3xl">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              What are Prompts?
            </h2>
            <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
              <p>
                <strong className="text-foreground">AI Prompts</strong> are ready-to-use, copy-paste
                instructions that help you get better results from Claude. Each prompt is crafted for a
                specific task&mdash;whether it&apos;s writing code, analyzing data, drafting emails, or
                brainstorming ideas&mdash;so you can skip the trial-and-error and get straight to useful output.
              </p>

              <h3 className="text-sm font-medium text-foreground pt-2">
                Why use curated prompts?
              </h3>
              <ul className="list-disc list-inside space-y-1 pl-1">
                <li><strong className="text-foreground">Better results:</strong> Well-structured prompts lead to more accurate, relevant, and useful responses from Claude.</li>
                <li><strong className="text-foreground">Save time:</strong> No need to figure out the best way to phrase your request&mdash;just copy, paste, and customize.</li>
                <li><strong className="text-foreground">Learn prompting techniques:</strong> Study how effective prompts are written to improve your own prompt engineering skills.</li>
                <li><strong className="text-foreground">Community tested:</strong> Prompts are upvoted by the community, so the best ones rise to the top.</li>
              </ul>

              <h3 className="text-sm font-medium text-foreground pt-2">
                How to use a prompt
              </h3>
              <p>
                Browse the library above, find a prompt that matches your task, and click <strong className="text-foreground">Copy</strong> to
                grab it. Paste it into Claude and replace any placeholder values with your own context.
                You can also{" "}
                <Link href="/submit" className="text-primary hover:underline">submit your own prompts</Link>{" "}
                to share with the community.
              </p>

              <h3 className="text-sm font-medium text-foreground pt-2">
                Tips for effective prompting
              </h3>
              <ul className="list-disc list-inside space-y-1 pl-1">
                <li>Be specific about the format and structure you want in the output.</li>
                <li>Provide context and examples when possible for more tailored results.</li>
                <li>Break complex tasks into smaller, focused prompts for better accuracy.</li>
                <li>Use role-based instructions (e.g., &quot;You are a senior developer...&quot;) to guide Claude&apos;s perspective.</li>
              </ul>
            </div>
          </section>

          {/* Interlinks */}
          <section className="mt-12 border-t border-border pt-10 max-w-3xl">
            <h3 className="text-lg font-medium text-foreground mb-3">
              Explore more from Claude Directory
            </h3>
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
};

export default Prompts;
