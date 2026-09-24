/**
 * Give structure to posts that were pasted as plain text.
 *
 * Posts copied from docs or emails often lose their bullets and headings and
 * arrive as one short line per paragraph. When a post contains no Markdown of
 * its own, this turns:
 *   - a run of 3+ short lines into a bulleted list
 *   - a short standalone line ("The workflow", "Why this is useful?") that is
 *     followed by a longer paragraph into a subheading
 *   - a standalone quoted line into a blockquote
 * Posts that already use Markdown are returned untouched. Display only: the
 * stored text is never changed.
 */

const MARKDOWN_HINT = /(^|\n)\s*(#{1,6}\s|[-*+]\s|\d+[.)]\s|>\s|```)|\*\*|__|\[[^\]]+\]\(/;

function isShortLine(text: string, max: number) {
  return !text.includes("\n") && text.length > 0 && text.length <= max;
}

function endsLikeSentence(text: string) {
  return /[.!,;:"”)]$/.test(text);
}

export function formatPlainPost(body: string): string {
  if (!body || MARKDOWN_HINT.test(body)) return body;

  const blocks = body.replace(/\r\n/g, "\n").split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
  const out: string[] = [];

  let i = 0;
  while (i < blocks.length) {
    // Collect a run of short, non-sentence lines.
    let j = i;
    while (j < blocks.length && isShortLine(blocks[j], 90) && !endsLikeSentence(blocks[j]) && !/^https?:\/\//.test(blocks[j])) {
      j += 1;
    }
    const run = j - i;

    if (run >= 3) {
      out.push(blocks.slice(i, j).map((line) => `- ${line}`).join("\n"));
      i = j;
      continue;
    }

    const block = blocks[i];
    const next = blocks[i + 1];
    const looksLikeHeading =
      isShortLine(block, 60) &&
      (!endsLikeSentence(block) || block.endsWith("?")) &&
      !/^https?:\/\//.test(block) &&
      next !== undefined &&
      next.length > block.length;
    const looksLikeQuote = !block.includes("\n") && /^["“].+["”][.!?]?$/.test(block);
    out.push(looksLikeHeading ? `### ${block}` : looksLikeQuote ? `> ${block}` : block);
    i += 1;
  }

  return out.join("\n\n");
}
