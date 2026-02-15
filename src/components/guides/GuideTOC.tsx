"use client";

import { useEffect, useState } from "react";
import { List } from "lucide-react";

interface Heading {
  id: string;
  text: string;
  level: number;
}

function extractHeadings(markdown: string): Heading[] {
  const regex = /^(#{1,3})\s+(.+)$/gm;
  const headings: Heading[] = [];
  let match;
  while ((match = regex.exec(markdown)) !== null) {
    const level = match[1].length;
    const text = match[2].replace(/[*_`]/g, "");
    const id = text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    headings.push({ id, text, level });
  }
  return headings;
}

export function GuideTOC({ content }: { content: string }) {
  const headings = extractHeadings(content);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -80% 0px" }
    );

    headings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length < 2) return null;

  return (
    <aside className="hidden lg:block w-56 shrink-0">
      <div className="sticky top-20">
        <h4 className="text-xs font-medium text-foreground mb-3 flex items-center gap-1.5 uppercase tracking-wider">
          <List className="h-3.5 w-3.5" />
          On this page
        </h4>
        <nav className="space-y-1">
          {headings.map((h) => (
            <a
              key={h.id}
              href={`#${h.id}`}
              className={`block text-xs transition-colors ${
                h.level > 1 ? "pl-3" : ""
              } ${
                activeId === h.id
                  ? "text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {h.text}
            </a>
          ))}
        </nav>
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="mt-4 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Back to top
        </button>
      </div>
    </aside>
  );
}
