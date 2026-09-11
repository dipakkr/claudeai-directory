"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
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
import { Copy, ThumbsUp, CheckCircle, ArrowRight, Pencil, RotateCcw } from "lucide-react";
import { usePrompt, usePrompts } from "@/hooks/use-prompts";
import { toast } from "sonner";
import { DetailHeader, DetailPage, IconTile, SectionLabel, StatPill, TagList } from "@/components/directory/detail";
import ResourceReplies from "@/components/shared/ResourceReplies";
import type { Prompt } from "@/types";

export default function PromptDetailClient({ prompt: initialPrompt, id }: { prompt: Prompt | null; id: string }) {
  const { data: fetchedPrompt } = usePrompt(initialPrompt ? "" : id);
  const prompt = initialPrompt ?? fetchedPrompt ?? null;
  const [copied, setCopied] = useState(false);
  const [customizeOpen, setCustomizeOpen] = useState(false);

  const { text: actualPromptText } = useMemo(() => {
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
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <DetailPage backHref="/prompts" backLabel="Prompts">
          <DetailHeader
            icon={<IconTile name={prompt.title} />}
            title={prompt.title}
            stats={
              prompt.upvotes > 0 ? (
                <StatPill icon={<ThumbsUp className="h-3.5 w-3.5" />} title={`${prompt.upvotes} upvotes`}>
                  {prompt.upvotes}
                </StatPill>
              ) : undefined
            }
          />
          <p className="mt-2 font-mono text-[12px] uppercase tracking-wide text-muted-foreground">
            Prompt · {prompt.complexity}
          </p>

          <p className="mt-5 text-[17px] leading-relaxed text-foreground/90">{prompt.description}</p>

          <div className="mt-7 flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={copyPrompt}
              className="inline-flex h-10 items-center gap-2 rounded-full bg-foreground px-5 text-sm font-medium text-background transition-colors hover:bg-foreground/85"
            >
              {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied" : "Copy prompt"}
            </button>
            <button
              type="button"
              onClick={openCustomize}
              className="inline-flex h-10 items-center gap-2 rounded-full border border-border px-4 text-sm text-foreground transition-colors hover:border-[var(--cad-line-hover)]"
            >
              <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
              Customize
            </button>
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            <Badge variant="secondary">{prompt.category}</Badge>
            {prompt.verified && (
              <Badge>
                <CheckCircle className="h-3 w-3" />
                Verified
              </Badge>
            )}
            {prompt.use_cases.map((uc) => (
              <Badge key={uc} variant="outline">
                {uc}
              </Badge>
            ))}
          </div>

          <SectionLabel>Prompt</SectionLabel>
          <div className="rounded-xl border border-border bg-card/40">
            <pre className="whitespace-pre-wrap break-words p-5 font-mono text-[13px] leading-relaxed text-foreground/90">
              {actualPromptText}
            </pre>
          </div>

          {prompt.example_input && (
            <>
              <SectionLabel>Example input</SectionLabel>
              <div className="rounded-xl border border-border p-4">
                <p className="whitespace-pre-wrap text-sm text-muted-foreground">{prompt.example_input}</p>
              </div>
            </>
          )}

          {prompt.example_output && (
            <>
              <SectionLabel>Example output</SectionLabel>
              <div className="rounded-xl border border-border p-4">
                <p className="whitespace-pre-wrap text-sm text-muted-foreground">{prompt.example_output}</p>
              </div>
            </>
          )}

          {prompt.tags.length > 0 && (
            <>
              <SectionLabel>Tags</SectionLabel>
              <TagList tags={prompt.tags} />
            </>
          )}

          {related.length > 0 && (
            <>
              <SectionLabel>{`More in ${prompt.category}`}</SectionLabel>
              <ul className="border-t border-border">
                {related.map((p) => (
                  <li key={p.id}>
                    <Link href={`/prompts/${p.id}`} className="group flex items-center justify-between gap-3 border-b border-border/70 py-3">
                      <span className="min-w-0">
                        <span className="block truncate text-[15px] text-foreground group-hover:text-primary">{p.title}</span>
                        <span className="block truncate text-[13px] text-muted-foreground">{p.description}</span>
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}

          <div className="mt-14">
            <ResourceReplies resourceType="prompt" resourceId={id} />
          </div>
        </DetailPage>
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
                {customizeCopied ? <CheckCircle className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                {customizeCopied ? "Copied!" : "Copy Prompt"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
