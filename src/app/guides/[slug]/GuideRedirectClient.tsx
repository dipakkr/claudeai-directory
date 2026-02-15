"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useGuide } from "@/hooks/use-guides";
import { Skeleton } from "@/components/ui/skeleton";

export default function GuideDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { data: guide, isLoading, isError } = useGuide(slug);

  useEffect(() => {
    if (guide && guide.chapters.length > 0) {
      const firstChapter = guide.chapters[0];
      if (firstChapter.lessons.length > 0) {
        router.replace(`/guides/${slug}/${firstChapter.lessons[0].id}`);
      }
    }
  }, [guide, slug, router]);

  if (isError) {
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
