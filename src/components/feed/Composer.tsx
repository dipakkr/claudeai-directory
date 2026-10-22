"use client";

import { useRef, useState } from "react";
import { ArrowUp, Link2, Plus, Type, UserRound, X } from "lucide-react";
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
  const open = focused;
  const hasDraft = Boolean(body || title || link);
  const titleInput = useRef<HTMLInputElement>(null);
  const linkInput = useRef<HTMLInputElement>(null);

  const removeTitle = () => { setTitle(""); setShowTitle(false); textarea.current?.focus(); };
  const removeLink = () => { setLink(""); setShowLink(false); textarea.current?.focus(); };

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
        ...(showTitle && title.trim() ? { title: title.trim() } : {}),
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
    <section id="compose" aria-label="Create a community post" className="scroll-mt-24 overflow-hidden rounded-xl border border-border bg-card transition-colors focus-within:border-muted-foreground/40">
      <div className="flex items-center gap-3 px-4 py-4 sm:px-5">
        {user ? (
          <DiscussionAvatar src={user.avatar} name={user.name || user.username || "You"} />
        ) : (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--cad-control)] text-muted-foreground">
            <UserRound className="h-4 w-4" />
          </span>
        )}
        {open ? (
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground">Create a post</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Share an update, a question, or something you built.</p>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => { focus(); requestAnimationFrame(() => textarea.current?.focus()); }}
            className="min-w-0 flex-1 rounded-md py-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="block truncate text-sm text-muted-foreground">{hasDraft ? body || title || link : "What are you building with Claude?"}</span>
            {hasDraft && <span className="mt-1 block text-xs text-primary">Continue your draft</span>}
          </button>
        )}
        {open && (
          <button type="button" aria-label="Close editor" title="Close and keep draft" disabled={createThread.isPending} onClick={() => setFocused(false)} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-[var(--cad-control)] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {open && (
        <>
          <fieldset disabled={createThread.isPending} className="min-w-0 px-4 pb-4 sm:px-5">
            {showTitle && (
              <div className="mb-2 flex items-center gap-2 border-b border-border pb-2">
                <input
                  ref={titleInput}
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  maxLength={150}
                  placeholder="Give your post a title"
                  aria-label="Post title"
                  className="min-w-0 flex-1 bg-transparent py-1 text-base font-semibold text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
                <button type="button" onClick={removeTitle} aria-label="Remove title" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-[var(--cad-control)] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            <textarea
              ref={textarea}
              value={body}
              onChange={(event) => setBody(event.target.value)}
              maxLength={MAX_BODY}
              rows={3}
              readOnly={!user}
              placeholder="What would you like to share?"
              aria-label="Write a post"
              className="block w-full resize-y bg-transparent py-1 text-[15px] leading-6 text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            {showLink && (
              <div className="mt-3 flex items-center gap-2 rounded-lg border border-border bg-background pl-3 pr-1">
                <Link2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                <input
                  ref={linkInput}
                  value={link}
                  onChange={(event) => setLink(event.target.value)}
                  maxLength={1000}
                  placeholder="Paste a link..."
                  aria-label="Link"
                  type="url"
                  className="h-10 min-w-0 flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
                <button type="button" onClick={removeLink} aria-label="Remove link" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-[var(--cad-control)] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </fieldset>
          <div className="flex flex-wrap items-center gap-2 border-t border-border bg-[var(--cad-control)]/30 px-4 py-3 sm:px-5">
            <button
              type="button"
              disabled={createThread.isPending}
              onClick={() => { if (showTitle) removeTitle(); else { setShowTitle(true); requestAnimationFrame(() => titleInput.current?.focus()); } }}
              aria-pressed={showTitle}
              aria-label={showTitle ? "Remove title field" : "Add title"}
              className={`inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${showTitle ? "border-primary/30 bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-background hover:text-foreground"}`}
            >
              <Type className="h-3.5 w-3.5" />
              Title
              {showTitle ? <X className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
            </button>
            <button
              type="button"
              disabled={createThread.isPending}
              onClick={() => { if (showLink) removeLink(); else { setShowLink(true); requestAnimationFrame(() => linkInput.current?.focus()); } }}
              aria-pressed={showLink}
              aria-label={showLink ? "Remove link field" : "Add link"}
              className={`inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${showLink ? "border-primary/30 bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-background hover:text-foreground"}`}
            >
              <Link2 className="h-3.5 w-3.5" />
              Link
              {showLink ? <X className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
            </button>
            <span aria-live="polite" className="ml-auto text-xs tabular-nums text-muted-foreground">{body.length > MAX_BODY - 300 ? `${MAX_BODY - body.length} left` : ""}</span>
            <button
              type="button"
              onClick={() => void submit()}
              disabled={!body.trim() || createThread.isPending}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-40"
            >
              {createThread.isPending ? "Posting..." : "Post"}
              <ArrowUp className="h-3.5 w-3.5" />
            </button>
          </div>
        </>
      )}
    </section>
  );
}
