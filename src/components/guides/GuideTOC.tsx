"use client";

import { useMemo } from "react";
import { LessonTOC, slugifyHeading, type LessonHeading } from "@/components/learn/LessonTOC";

function extractHeadings(markdown: string): LessonHeading[] {
  const regex = /^(#{1,3})\s+(.+)$/gm;
  const headings: LessonHeading[] = [];
  let match;
  while ((match = regex.exec(markdown)) !== null) {
    const level = match[1].length;
    const text = match[2].replace(/[*_`]/g, "");
    headings.push({ id: slugifyHeading(text), text, level });
  }
  return headings;
}

export function GuideTOC({ content }: { content: string }) {
  const headings = useMemo(() => extractHeadings(content), [content]);
  return <LessonTOC headings={headings} />;
}
