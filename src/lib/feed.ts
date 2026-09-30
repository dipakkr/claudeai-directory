import { plainText } from "@/lib/seo";
import type { Thread } from "@/types";

/** A post's title, or its first words when it has none (quick feed posts). */
export function postTitle(t: Pick<Thread, "title" | "display_title"> & { body?: string }) {
  if (t.title) return t.title;
  if (t.display_title) return t.display_title;
  const words = plainText(t.body || "").split(/\s+/).filter(Boolean);
  if (!words.length) return "Post";
  return words.slice(0, 12).join(" ") + (words.length > 12 ? "..." : "");
}

/** Posts per feed page (server first page and client "Load more"). */
export const FEED_PAGE_SIZE = 20;

const wordCount = (text: string) => plainText(text).split(/\s+/).filter(Boolean).length;

/**
 * Short posts with no discussion are thin pages: keep them out of search (and
 * the sitemap) until they have substance, about 50 words, or a comment.
 */
export function isIndexable(t: Pick<Thread, "body" | "replies">) {
  return wordCount(t.body || "") >= 50 || (t.replies ?? 0) > 0;
}
