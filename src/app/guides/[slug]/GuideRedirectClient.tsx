"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import type { GuideDetail } from "@/types";

export default function GuideDetailPage({ guide, slug }: { guide: GuideDetail | null; slug: string }) {
  const router = useRouter();

  useEffect(() => {
    if (guide && guide.chapters.length > 0) {
      const firstChapter = guide.chapters[0];
      if (firstChapter.lessons.length > 0) {
        router.replace(`/guides/${slug}/${firstChapter.lessons[0].id}`);
      }
    }
  }, [guide, slug, router]);

  if (!guide) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-sm text-muted-foreground">Guide not found.</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-3">
        <Skeleton className="h-6 w-48" />
        <p className="text-xs text-muted-foreground">Loading guide...</p>
      </div>
    </div>
  );
}
