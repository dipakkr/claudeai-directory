"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { ExternalLink, Link2, Reply as ReplyIcon, UserRound } from "lucide-react";
import { toast } from "sonner";

import { Skeleton } from "@/components/ui/skeleton";
import UserMarkdown from "@/components/shared/UserMarkdown";
import { useAuth } from "@/lib/auth";
import { SignInButton } from "@/components/auth/SignInDialog";
import { track } from "@/lib/analytics";

/**
 * One discussion UI for every page with comments: section label with count,
 * a composer, top-level comments separated by dividers, and replies indented
 * under a thin rule. Pages keep their own data hooks and pass comments in.
 */

export interface DiscussionComment {
  id: string;
  parentId?: string | null;
  author: string;
  authorUsername?: string;
  authorAvatar?: string | null;
  headline?: string | null;
  body: string;
  link?: string | null;
  createdAt: string;
}

export interface DiscussionPostInput {
  body: string;
  parentId?: string;
  link?: string;
}

interface DiscussionProps {
  id?: string;
  title?: ReactNode;
  count?: number;
  comments: DiscussionComment[];
  isLoading?: boolean;
  /** Called with the new comment; reject to show an error. */
  onPost: (input: DiscussionPostInput) => Promise<unknown>;
  /** Absolute URL that points at one comment, used by Share. */
  permalink: (commentId: string) => string;
  /** Show Reply on each comment. Needs an API that stores parent ids. */
  allowReplies?: boolean;
  /** Adds an optional "link to your project" field to the main composer. */
  withLinkField?: boolean;
  minLength?: number;
  placeholder?: string;
  emptyText?: string;
  /** Extra actions (for example an upvote button) shown before Reply. */
  renderActions?: (comment: DiscussionComment) => ReactNode;
  /** Shown between the header and the composer, e.g. the maker's question. */
  intro?: ReactNode;
}

export function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  return `${Math.floor(diff / 2592000)}mo ago`;
}

// Stable per-name fallback colors so initials avatars are easy to tell apart.
const FALLBACK_COLORS = [
  "bg-[#6b8f5e]",
  "bg-[#c4704f]",
  "bg-[#5b7fa6]",
  "bg-[#8a6aa8]",
  "bg-[#b0894a]",
  "bg-[#4f8f8a]",
];

function colorFor(name: string) {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) | 0;
  return FALLBACK_COLORS[Math.abs(hash) % FALLBACK_COLORS.length];
}

export function DiscussionAvatar({ src, name, size = "md" }: { src?: string | null; name: string; size?: "sm" | "md" }) {
  const [failed, setFailed] = useState(false);
  const box = size === "sm" ? "h-6 w-6 text-[10px]" : "h-9 w-9 text-[13px]";
  if (src && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- remote, user-provided avatar
      <img
        src={src}
        alt=""
        className={`${box} shrink-0 rounded-full object-cover`}
        onError={() => setFailed(true)}
        // Catches images that already failed before this ref attached (cached 404).
        ref={el => {
          if (el && el.complete && el.naturalWidth === 0) setFailed(true);
        }}
      />
    );
  }
  return (
    <span className={`${box} ${colorFor(name)} flex shrink-0 items-center justify-center rounded-full font-medium text-white`}>
      {name.trim()[0]?.toUpperCase() ?? "?"}
    </span>
  );
}

export function DiscussionHeader({ title, count }: { title: ReactNode; count?: number }) {
  return (
    <div className="flex items-center gap-3 border-b border-border pb-4">
      <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
      <h2 className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-primary">{title}</h2>
      {typeof count === "number" && (
        <span className="rounded-full border border-border px-2 py-0.5 font-mono text-[10px] tabular-nums text-muted-foreground">
          {count}
        </span>
      )}
    </div>
  );
}

function Composer({
  parentId,
  onPost,
  withLinkField,
  minLength = 1,
  placeholder,
  compact,
  onDone,
}: {
  parentId?: string;
  onPost: DiscussionProps["onPost"];
  withLinkField?: boolean;
  minLength?: number;
  placeholder?: string;
  compact?: boolean;
  onDone?: () => void;
}) {
  const { isAuthenticated, user } = useAuth();
  const [body, setBody] = useState("");
  const [link, setLink] = useState("");
  const [focused, setFocused] = useState(false);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-3">
        {!compact && (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-card text-muted-foreground">
            <UserRound className="h-4 w-4" />
          </span>
        )}
        <SignInButton
          reason="comment"
          className="flex h-11 min-w-0 flex-1 cursor-text items-center rounded-xl border border-border bg-card px-4 text-left text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
        >
          Sign in to comment...
        </SignInButton>
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = body.trim();
    if (text.length < minLength) {
      setError(`Please write at least ${minLength} characters.`);
      return;
    }
    const url = link.trim();
    if (url && !/^https?:\/\/\S+\.\S+/.test(url)) {
      setError("The link must be a full URL starting with https://");
      return;
    }
    setError(null);
    setPosting(true);
    try {
      await onPost({ body: text, ...(parentId ? { parentId } : {}), ...(url ? { link: url } : {}) });
      track("community_posted", { kind: parentId ? "nested_reply" : "reply", page: window.location.pathname });
      setBody("");
      setLink("");
      setFocused(false);
      toast.success(parentId ? "Reply posted" : "Comment posted");
      onDone?.();
    } catch {
      toast.error("Could not post. Try again.");
    } finally {
      setPosting(false);
    }
  };

  const expanded = compact || focused || body.length > 0;

  return (
    <form onSubmit={submit} className="flex items-start gap-3">
      {!compact && <DiscussionAvatar src={user?.avatar} name={user?.name || user?.username || "You"} />}
      <div className="min-w-0 flex-1">
        <div className="rounded-xl border border-border bg-card transition-colors focus-within:border-primary/50">
          <textarea
            aria-label={parentId ? "Write a reply" : "Write a comment"}
            placeholder={placeholder ?? (parentId ? "Write a reply..." : "Add a comment...")}
            value={body}
            onChange={e => setBody(e.target.value)}
            onFocus={() => setFocused(true)}
            autoFocus={compact}
            rows={expanded ? 3 : 1}
            className="block w-full resize-none rounded-xl bg-transparent px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
          {expanded && withLinkField && !parentId && (
            <input
              type="url"
              value={link}
              onChange={e => setLink(e.target.value)}
              placeholder="Link to your project or example (optional)"
              aria-label="Link to your project or example"
              className="block w-full border-t border-border bg-transparent px-4 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
          )}
          {expanded && (
            <div className="flex items-center justify-between gap-3 border-t border-border px-3 py-2">
              <span className="text-xs text-muted-foreground">Markdown supported</span>
              <div className="flex items-center gap-2">
                {compact && onDone && (
                  <button type="button" onClick={onDone} className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground">
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={posting || !body.trim()}
                  className="inline-flex h-8 items-center rounded-full bg-foreground px-4 text-xs font-medium text-background transition-colors hover:bg-foreground/85 disabled:opacity-40"
                >
                  {posting ? "Posting..." : parentId ? "Reply" : "Comment"}
                </button>
              </div>
            </div>
          )}
        </div>
        {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
      </div>
    </form>
  );
}

function CommentRow({
  comment,
  nested,
  replyingTo,
  props,
}: {
  comment: DiscussionComment;
  nested?: boolean;
  replyingTo?: string;
  props: DiscussionProps;
}) {
  const [replying, setReplying] = useState(false);
  // Replies to a nested comment attach to it; the list flattens them under
  // the top-level thread and shows "@author".
  const share = async () => {
    try {
      await navigator.clipboard.writeText(props.permalink(comment.id));
      toast.success("Link to comment copied");
    } catch {
      toast.error("Could not copy the link");
    }
  };

  const name = comment.authorUsername ? (
    <Link href={`/u/${comment.authorUsername}`} className="font-semibold text-foreground hover:underline">
      {comment.author}
    </Link>
  ) : (
    <span className="font-semibold text-foreground">{comment.author}</span>
  );

  return (
    <div id={comment.id} className="scroll-mt-24">
      <div className="flex items-start gap-3">
        <DiscussionAvatar src={comment.authorAvatar} name={comment.author} size={nested ? "sm" : "md"} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className={`flex min-w-0 flex-wrap items-baseline gap-x-2 ${nested ? "text-[13px]" : "text-sm"} ${nested ? "" : "pt-0.5"}`}>
              {name}
              {comment.headline && <span className="truncate text-xs text-muted-foreground">{comment.headline}</span>}
              <time dateTime={comment.createdAt} className="text-xs text-muted-foreground/80">
                {timeAgo(comment.createdAt)}
              </time>
            </div>
            <div className="flex shrink-0 items-center gap-3 text-xs text-muted-foreground">
              {props.renderActions?.(comment)}
              {props.allowReplies && (
                <button
                  type="button"
                  onClick={() => setReplying(v => !v)}
                  className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
                  aria-expanded={replying}
                >
                  <ReplyIcon className="h-3.5 w-3.5" />
                  Reply
                </button>
              )}
              <button type="button" onClick={share} className="inline-flex items-center gap-1 transition-colors hover:text-foreground">
                <Link2 className="h-3.5 w-3.5" />
                Share
              </button>
            </div>
          </div>
          <div className={nested ? "mt-1" : "mt-1.5"}>
            {replyingTo && <span className="mr-1 text-sm font-medium text-primary">@{replyingTo}</span>}
            <UserMarkdown compact>{comment.body}</UserMarkdown>
          </div>
          {comment.link && (
            <a
              href={comment.link}
              target="_blank"
              rel="nofollow ugc noopener noreferrer"
              className="mt-1.5 inline-flex max-w-full items-center gap-1 text-xs text-primary hover:underline"
            >
              <ExternalLink className="h-3 w-3 shrink-0" />
              <span className="truncate">{comment.link}</span>
            </a>
          )}
          {replying && (
            <div className="mt-3">
              <Composer parentId={comment.id} onPost={props.onPost} compact onDone={() => setReplying(false)} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Two visible levels: anything deeper is flattened under its top-level
// ancestor, with "@author" pointing at the direct parent.
function buildTree(comments: DiscussionComment[]) {
  const byId = new Map(comments.map(c => [c.id, c]));
  const childrenOf = new Map<string, DiscussionComment[]>();
  const top: DiscussionComment[] = [];
  for (const c of comments) {
    if (!c.parentId || !byId.has(c.parentId)) {
      top.push(c);
      continue;
    }
    let ancestor = byId.get(c.parentId)!;
    while (ancestor.parentId && byId.has(ancestor.parentId)) ancestor = byId.get(ancestor.parentId)!;
    childrenOf.set(ancestor.id, [...(childrenOf.get(ancestor.id) ?? []), c]);
  }
  return { top: top.map(c => ({ comment: c, children: childrenOf.get(c.id) ?? [] })), byId };
}

export default function Discussion(props: DiscussionProps) {
  const { id = "discussion", title = "Discussion", comments, isLoading } = props;
  const { top, byId } = buildTree(comments);
  const count = props.count ?? comments.length;

  return (
    <section id={id} className="scroll-mt-24">
      <DiscussionHeader title={title} count={count} />

      {props.intro && <div className="mt-6">{props.intro}</div>}

      <div className="mt-6">
        <Composer
          onPost={props.onPost}
          withLinkField={props.withLinkField}
          minLength={props.minLength}
          placeholder={props.placeholder}
        />
      </div>

      {isLoading ? (
        <div className="mt-8 space-y-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-9 w-9 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-40" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : top.length > 0 ? (
        <div className="mt-6 divide-y divide-border">
          {top.map(({ comment, children }) => (
            <div key={comment.id} className="py-6">
              <CommentRow comment={comment} props={props} />
              {children.length > 0 && (
                <div className="ml-[18px] mt-4 space-y-5 border-l border-border pl-5 sm:pl-7">
                  {children.map(child => {
                    const parent = child.parentId && child.parentId !== comment.id ? byId.get(child.parentId) : undefined;
                    return <CommentRow key={child.id} comment={child} nested replyingTo={parent?.author} props={props} />;
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        props.emptyText && <p className="mt-6 text-sm text-muted-foreground">{props.emptyText}</p>
      )}
    </section>
  );
}
