"use client";

import { LessonAccessBar } from "@/components/learn/LessonAccessBar";

interface GuideAccessBarProps {
  guideName: string;
  price: number;
  lockedCount: number;
}

export function GuideAccessBar({
  guideName,
  price,
  lockedCount,
}: GuideAccessBarProps) {
  return (
    <LessonAccessBar
      lockedCount={lockedCount}
      subtitle={`Get full access to ${guideName}`}
      ctaLabel={`Get Full Access: $${price}`}
      ctaHref="/pricing"
    />
  );
}
