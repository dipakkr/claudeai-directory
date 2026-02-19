"use client";

import { use } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Copy,
  ThumbsUp,
  CheckCircle,
  FileText,
  Wrench,
  Server,
  ArrowUpRight,
  Lightbulb,
  BarChart3,
  Calendar,
} from "lucide-react";
import PageBreadcrumb from "@/components/layout/PageBreadcrumb";
import { usePrompt, usePrompts, useUpvotePrompt } from "@/hooks/use-prompts";
import { toast } from "sonner";

export default function PromptDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { data: prompt, isLoading } = usePrompt(slug);
  const upvote = useUpvotePrompt();
  const { data: relatedPrompts } = usePrompts({
    category: prompt?.category || undefined,
    limit: 7,
  });

  const copyPrompt = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Prompt copied to clipboard");
  };

  const related = (relatedPrompts ?? []).filter((p) => p.id !== prompt?.id).slice(0, 6);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1">
          <div className="container py-8">
            <Skeleton className="h-4 w-32 mb-6" />
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-6">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
              <div>
                <Skeleton className="h-48 w-full" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!prompt) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-medium text-foreground mb-2">
              Prompt not found
            </h1>
            <Link href="/prompts">
              <Button variant="outline" size="sm">
                Back to Prompts
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const complexityColor =
    prompt.complexity === "beginner"
      ? "text-emerald-400 bg-emerald-400/10"
      : prompt.complexity === "intermediate"
        ? "text-yellow-400 bg-yellow-400/10"
        : prompt.complexity === "advanced"
          ? "text-red-400 bg-red-400/10"
          : "text-muted-foreground bg-muted/50";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container py-8">
          <PageBreadcrumb items={[
            { label: "Prompts", href: "/prompts" },
            { label: prompt.title || "..." },
          ]} />
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header */}
              <div>
                <div className="flex items-start gap-4 mb-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-lg font-medium shrink-0">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h1 className="text-2xl md:text-3xl font-medium text-foreground mb-1">
                      {prompt.title}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      {prompt.description}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Prompt Content */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-medium text-foreground">Prompt</h2>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {prompt.category}
                    </Badge>
                    {prompt.complexity && (
                      <Badge className={`text-xs border-0 ${complexityColor}`}>
                        {prompt.complexity}
                      </Badge>
                    )}
                    {prompt.verified && (
                      <Badge variant="outline" className="text-xs">
                        <CheckCircle className="mr-1 h-3 w-3 text-primary" />
                        Verified
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-muted/30">
                    <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                      <FileText className="h-3 w-3" />
                      Prompt Template
                    </span>
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
                  <div className="p-4 sm:p-6">
                    <pre className="text-sm font-mono text-foreground/90 whitespace-pre-wrap leading-relaxed">
                      {prompt.prompt}
                    </pre>
                  </div>
                </div>
              </div>

              {/* Variables */}
              {prompt.variables && prompt.variables.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h2 className="text-lg font-medium text-foreground mb-4">
                      Variables{" "}
                      <span className="text-sm text-muted-foreground font-normal">
                        ({prompt.variables.length})
                      </span>
                    </h2>
                    <div className="rounded-lg border border-border overflow-hidden">
                      {prompt.variables.map((v, i) => {
                        const name = (v as Record<string, string>).name || (v as Record<string, string>).key || `Variable ${i + 1}`;
                        const desc = (v as Record<string, string>).description || (v as Record<string, string>).desc || "";
                        return (
                          <div
                            key={i}
                            className={`flex items-start gap-3 px-4 py-3 ${i > 0 ? "border-t border-border" : ""} hover:bg-muted/30 transition-colors`}
                          >
                            <code className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded font-mono shrink-0">
                              {String(name)}
                            </code>
                            {desc && (
                              <span className="text-xs text-muted-foreground">
                                {String(desc)}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* Example Input/Output */}
              {(prompt.example_input || prompt.example_output) && (
                <>
                  <Separator />
                  <div>
                    <h2 className="text-lg font-medium text-foreground mb-4">Examples</h2>

                    {prompt.example_input && (
                      <div className="rounded-xl border border-border bg-card overflow-hidden mb-4">
                        <div className="px-4 py-2.5 border-b border-border bg-muted/30">
                          <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                            <Lightbulb className="h-3 w-3" />
                            Example Input
                          </span>
                        </div>
                        <div className="p-4 sm:p-6">
                          <pre className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                            {prompt.example_input}
                          </pre>
                        </div>
                      </div>
                    )}

                    {prompt.example_output && (
                      <div className="rounded-xl border border-border bg-card overflow-hidden">
                        <div className="px-4 py-2.5 border-b border-border bg-emerald-400/10">
                          <span className="text-xs font-medium text-emerald-400 flex items-center gap-1.5">
                            <BarChart3 className="h-3 w-3" />
                            Example Output
                          </span>
                        </div>
                        <div className="p-4 sm:p-6">
                          <pre className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                            {prompt.example_output}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Related Prompts */}
              {related.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h2 className="text-lg font-medium text-foreground mb-4">
                      Related in {prompt.category}
                    </h2>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {related.map((rel) => (
                        <Link
                          key={rel.id}
                          href={`/prompts/${rel.id}`}
                          className="group flex items-start gap-3 rounded-lg border border-border bg-card p-3 hover:bg-accent/50 hover:border-primary/20 transition-all"
                        >
                          <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center text-primary shrink-0">
                            <FileText className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">
                              {rel.title}
                            </h3>
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {rel.description}
                            </p>
                          </div>
                          <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5" />
                        </Link>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Actions card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Use this Prompt</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    className="w-full text-sm"
                    onClick={() => copyPrompt(prompt.prompt)}
                  >
                    <Copy className="mr-1.5 h-3.5 w-3.5" />
                    Copy Prompt
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full text-sm"
                    onClick={() => upvote.mutate(slug, { onError: () => toast.error("Sign in to upvote") })}
                  >
                    <ThumbsUp className="mr-1.5 h-3.5 w-3.5" />
                    Upvote ({prompt.upvotes})
                  </Button>
                  <div className="flex items-center justify-between pt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <ThumbsUp className="h-3 w-3" />
                      {prompt.upvotes} upvotes
                    </span>
                    {prompt.created_at && (
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3 w-3" />
                        {new Date(prompt.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Use Cases & Tags — combined */}
              {(prompt.use_cases.length > 0 || prompt.tags.length > 0) && (
                <Card>
                  <CardContent className="pt-5 space-y-4">
                    {prompt.use_cases.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-foreground mb-2 uppercase tracking-wider">Use Cases</p>
                        <div className="space-y-1.5">
                          {prompt.use_cases.map((uc) => (
                            <div key={uc} className="flex items-start gap-2">
                              <Lightbulb className="h-3 w-3 text-primary mt-0.5 shrink-0" />
                              <span className="text-xs text-muted-foreground">{uc}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {prompt.tags.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-foreground mb-2 uppercase tracking-wider">Tags</p>
                        <div className="flex flex-wrap gap-1.5">
                          {prompt.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-[10px]">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Explore more */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Explore more</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Link href="/prompts" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
                    <FileText className="h-3 w-3" /> All Prompts
                  </Link>
                  <Link href="/skills" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
                    <Wrench className="h-3 w-3" /> Claude Skills
                  </Link>
                  <Link href="/mcp" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
                    <Server className="h-3 w-3" /> MCP Connectors
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
