"use client";

import { useEffect, useState } from "react";

export interface LessonHeading {
  id: string;
  text: string;
  level: number;
}

// Matches rehype-slug closely enough for the heading text we author.
export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function LessonTOC({ headings }: { headings: LessonHeading[] }) {
  const [activeId, setActiveId] = useState<string>("");
  const headingKey = headings.map((h) => h.id).join("|");

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

    for (const id of headingKey.split("|")) {
      const el = id ? document.getElementById(id) : null;
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [headingKey]);

  if (headings.length < 2) return null;

  return (
    <aside className="hidden lg:block w-52 shrink-0">
      <div className="sticky top-20">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 mb-3">
          On this page
        </p>
        <nav className="border-l border-border space-y-0.5">
          {headings.map((h) => (
            <a
              key={h.id}
              href={`#${h.id}`}
              className={`block text-[11px] leading-snug py-1 transition-colors border-l -ml-px ${
                h.level <= 2 ? "pl-3" : "pl-5"
              } ${
                activeId === h.id
                  ? "border-primary text-primary font-medium"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              }`}
            >
              {h.text}
            </a>
          ))}
        </nav>
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="mt-4 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
        >
          ↑ Back to top
        </button>
      </div>
    </aside>
  );
}
