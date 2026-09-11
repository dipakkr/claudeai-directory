import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Markdown written by members (threads, replies). Raw HTML is not rendered
 * (react-markdown default) and links are marked as user-generated.
 */
export default function UserMarkdown({ children, compact = false }: { children: string; compact?: boolean }) {
  return (
    <div
      className={`prose max-w-none break-words text-foreground dark:prose-invert prose-headings:font-sans prose-headings:font-semibold prose-headings:text-foreground prose-p:leading-relaxed prose-a:text-primary prose-strong:text-foreground prose-code:rounded prose-code:bg-secondary prose-code:px-1 prose-code:py-0.5 prose-code:font-mono prose-code:text-[0.85em] prose-code:before:content-none prose-code:after:content-none prose-pre:border prose-pre:border-border prose-pre:bg-[var(--cad-code)] prose-pre:text-foreground ${
        compact ? "prose-sm prose-p:my-1.5 prose-headings:mb-1.5 prose-headings:mt-3" : "prose-sm prose-headings:mt-5"
      }`}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children: linkChildren }) => (
            <a href={href} target="_blank" rel="nofollow ugc noopener noreferrer">
              {linkChildren}
            </a>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
