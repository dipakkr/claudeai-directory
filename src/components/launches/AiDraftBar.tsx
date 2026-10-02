"use client";

import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { ApiError } from "@/lib/api";
import { track } from "@/lib/analytics";
import { useAiDraftConfig, useLaunchAiDraft, type LaunchAiDraft } from "@/hooks/use-showcase";

/**
 * "Write with AI": reads the app's website and drafts the listing. The draft lands in the
 * form for the maker to review; nothing is saved until they save. Hidden when the server
 * has no model configured.
 */
export function AiDraftBar({ url, onDraft, surface }: { url: string; onDraft: (draft: LaunchAiDraft) => void; surface: "edit" | "submit" }) {
  const { data: config } = useAiDraftConfig();
  const draft = useLaunchAiDraft();
  if (!config?.enabled || !url) return null;

  const host = url.replace(/^https?:\/\//i, "").replace(/\/$/, "");
  const run = () => {
    track("launch_ai_draft_clicked", { surface });
    draft.mutate(url, {
      onSuccess: onDraft,
      onError: (error) => {
        const detail = error instanceof ApiError ? (error.data as { detail?: unknown })?.detail : undefined;
        toast.error(typeof detail === "string" ? detail : "Could not write a draft. Try again.");
      },
    });
  };

  return (
    <div className="flex flex-col gap-3 rounded-[10px] border border-primary/25 bg-primary/[0.05] px-4 py-3.5 sm:flex-row sm:items-center">
      <Sparkles className="hidden h-4 w-4 shrink-0 text-primary sm:block" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="font-sans text-[14px] font-medium text-foreground">Let AI write your listing</p>
        <p className="mt-0.5 text-[13px] leading-5 text-muted-foreground">
          {draft.isPending
            ? `Reading ${host} and writing a draft. This takes about 10 seconds.`
            : `Reads ${host} and drafts the pitch, description, story and tags. You review everything before saving.`}
        </p>
      </div>
      <button
        type="button"
        onClick={run}
        disabled={draft.isPending}
        className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {draft.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        {draft.isPending ? "Writing..." : "Write with AI"}
      </button>
    </div>
  );
}
