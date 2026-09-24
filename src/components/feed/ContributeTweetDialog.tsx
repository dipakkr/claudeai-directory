"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useSubmitTweet } from "@/hooks/use-feed";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";

const TWEET_URL = /^https?:\/\/(www\.|mobile\.)?(x|twitter)\.com\/\w{1,15}\/status(es)?\/\d+/i;

export function ContributeTweetDialog() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const submit = useSubmitTweet();
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");

  const promptSignIn = () =>
    toast.error("Sign in to contribute a tweet", {
      action: { label: "Sign in", onClick: () => router.push("/login") },
    });

  const handleOpenChange = (next: boolean) => {
    // While the session is still loading, open anyway and check again on submit.
    if (next && !isLoading && !isAuthenticated) {
      promptSignIn();
      return;
    }
    setOpen(next);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!isAuthenticated) {
      promptSignIn();
      return;
    }
    const value = url.trim();
    if (!TWEET_URL.test(value)) {
      toast.error("Paste a tweet link from x.com, like x.com/user/status/123");
      return;
    }
    submit.mutate(value, {
      onSuccess: ({ created }) => {
        setUrl("");
        setOpen(false);
        toast.success(created ? "Added to the feed" : "That tweet is already in the feed");
        router.refresh();
      },
      onError: (error) => {
        const detail = error instanceof ApiError ? (error.data as { detail?: string })?.detail : undefined;
        toast.error(detail || "Could not add this tweet");
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full bg-foreground px-3.5 text-xs font-medium text-background transition-colors hover:bg-foreground/85"
        >
          <Plus className="h-3.5 w-3.5" />
          Contribute
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Contribute a tweet</DialogTitle>
          <DialogDescription>
            Share a useful tweet about Claude, Claude Code, MCP or Agents. It appears in the feed under Community.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="mt-2 space-y-3">
          <label htmlFor="tweet-url" className="text-sm font-medium text-foreground">
            Tweet link
          </label>
          <input
            id="tweet-url"
            type="url"
            inputMode="url"
            autoFocus
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://x.com/user/status/123"
            className="h-11 w-full rounded-lg border border-border bg-card px-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/60 focus:outline-none"
          />
          <button
            type="submit"
            disabled={submit.isPending || !url.trim()}
            className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-foreground px-4 text-sm font-medium text-background transition-colors hover:bg-foreground/85 disabled:opacity-60"
          >
            {submit.isPending ? "Adding..." : "Add to feed"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
