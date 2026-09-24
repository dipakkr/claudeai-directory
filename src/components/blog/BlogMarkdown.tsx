import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ReactNode } from "react";
import { headingIds } from "@/lib/blog";

// Server-rendered article body. Raw HTML in markdown is not rendered.
// Heading ids come from headingIds() in document order, so they always match
// the table of contents built from the same content.
export default function BlogMarkdown({ content, community = false }: { content: string; community?: boolean }) {
  const ids = headingIds(content).map((h) => h.id);
  let next = 0;
  const heading = (Tag: "h2" | "h3") =>
    function Heading({ children }: { children?: ReactNode }) {
      const id = ids[next++];
      return (
        <Tag id={id} className="scroll-mt-24">
          {children}
        </Tag>
      );
    };

  return (
    <div className="blog-prose">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // The page owns the only H1.
          h1: heading("h2"),
          h2: heading("h2"),
          h3: heading("h3"),
          a: ({ href, children }) => {
            const external = Boolean(href && /^https?:\/\//.test(href));
            // Community posts link out as user-generated content.
            const rel = external ? (community ? "nofollow ugc noopener noreferrer" : "noopener noreferrer") : undefined;
            return (
              <a href={href} target={external ? "_blank" : undefined} rel={rel}>
                {children}
              </a>
            );
          },
          img: ({ src, alt }) =>
            typeof src === "string" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={src} alt={alt ?? ""} loading="lazy" className="my-7 w-full rounded-lg border border-border" />
            ) : null,
          code: ({ className, children }) => <code className={className || undefined}>{children}</code>,
          table: ({ children }) => (
            <div className="not-prose my-7 overflow-x-auto rounded-lg border border-border">
              <table>{children}</table>
            </div>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
