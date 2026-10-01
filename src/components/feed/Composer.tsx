"use client";

import { useRef, useState } from "react";
import { Link2, Type, UserRound, X } from "lucide-react";
import { toast } from "sonner";

import { DiscussionAvatar } from "@/components/discussion/Discussion";
import { useSignIn } from "@/components/auth/SignInDialog";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { track } from "@/lib/analytics";
import { useCreateThread } from "@/hooks/use-community";
import type { Thread } from "@/types";

const MAX_BODY = 3000;
const URL_IN_TEXT = /https?:\/\/[^\s<>()]+/i;

/** "Start a post" box at the top of the feed. Title and link are optional extras. */
export function Composer({ onPosted }: { onPosted: (post: Thread) => void }) {
  const { user } = useAuth();
  const { requireAuth } = useSignIn();
  const createThread = useCreateThread();
  const [body, setBody] = useState("");
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [showTitle, setShowTitle] = useState(false);
  const [showLink, setShowLink] = useState(false);
  const [focused, setFocused] = useState(false);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const open = focused || Boolean(body || title || link);

  // Signed-out visitors see the box; typing into it asks them to sign in first.
  const focus = () => {
    if (user) return setFocused(true);
    void requireAuth("write a post", () => {
      setFocused(true);
      requestAnimationFrame(() => textarea.current?.focus());
    }, { afterOnboarding: true });
  };

  const submit = async () => {
    const text = body.trim();
    if (!text) return;
    // No link given: use the first one in the text so it still gets a preview.
    const linkUrl = link.trim() || text.match(URL_IN_TEXT)?.[0];
    try {
      const post = await createThread.mutateAsync({
        body: text,
        ...(title.trim() ? { title: title.trim() } : {}),
        ...(linkUrl ? { link_url: linkUrl } : {}),
      });
      track("community_posted", { kind: "post" });
      toast.success("Posted");
      setBody("");
      setTitle("");
      setLink("");
      setShowTitle(false);
      setShowLink(false);
      setFocused(false);
      onPosted(post);
    } catch (error) {
      // 422/429 carry a readable reason (bad link, posting too fast).
      const detail = error instanceof ApiError ? (error.data as { detail?: unknown })?.detail : undefined;
      toast.error(typeof detail === "string" ? detail : "Could not publish your post");
    }
  };

  return (
    <div id="compose" className="scroll-mt-24 rounded-[6px] border border-border bg-card p-4 sm:p-5">
      <div className="flex gap-3">
        {user ? (
          <DiscussionAvatar src={user.avatar} name={user.name || user.username || "You"} />
        ) : (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--cad-control)] text-muted-foreground">
            <UserRound className="h-4 w-4" />
          </span>
        )}
        <div className="min-w-0 flex-1">
          {showTitle && (
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={150}
              placeholder="Title (optional)"
              aria-label="Post title"
              className="mb-2 w-full bg-transparent text-[16px] font-semibold text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          )}
          <textarea
            ref={textarea}
            value={body}
            onFocus={focus}
            onChange={(event) => setBody(event.target.value)}
            maxLength={MAX_BODY}
            rows={open ? 4 : 1}
            readOnly={!user}
            placeholder="What are you building with Claude?"
            aria-label="Write a post"
            className="w-full resize-none bg-transparent py-2 text-[15px] leading-6 text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          {showLink && (
            <div className="mt-2 flex items-center gap-2 rounded-[4px] border border-border bg-background px-3">
              <Link2 className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                value={link}
                onChange={(event) => setLink(event.target.value)}
                maxLength={1000}
                placeholder="https://"
                aria-label="Link"
                className="h-9 min-w-0 flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
              <button type="button" onClick={() => (setLink(""), setShowLink(false))} aria-label="Remove link" className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {open && (
        <div className="mt-3 flex items-center gap-1 border-t border-border pt-3">
          <button
            type="button"
            onClick={() => setShowTitle((v) => !v)}
            aria-pressed={showTitle}
            className="inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-medium text-muted-foreground hover:bg-[var(--cad-control)] hover:text-foreground"
          >
            <Type className="h-3.5 w-3.5" />
            Title
          </button>
          <button
            type="button"
            onClick={() => setShowLink((v) => !v)}
            aria-pressed={showLink}
            className="inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-medium text-muted-foreground hover:bg-[var(--cad-control)] hover:text-foreground"
          >
            <Link2 className="h-3.5 w-3.5" />
            Link
          </button>
          <span className="ml-auto mr-3 text-xs tabular-nums text-muted-foreground">{body.length > MAX_BODY - 300 ? `${MAX_BODY - body.length}` : ""}</span>
          <button
            type="button"
            onClick={() => void submit()}
            disabled={!body.trim() || createThread.isPending}
            className="h-8 rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity disabled:opacity-50"
          >
            {createThread.isPending ? "Posting..." : "Post"}
          </button>
        </div>
      )}
    </div>
  );
}
