"use client";

import Link from "next/link";
import { Lock, ArrowRight } from "lucide-react";
import type { Course } from "@/data/courses";

export default function LockedLessonView({ course }: { course: Course }) {
  if (!course.isFreemium) return null;

  return (
    <div className="rounded-xl border border-border bg-card/45 p-8 text-center">
      <div className="mb-4 flex justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-border bg-background">
          <Lock className="h-8 w-8 text-muted-foreground" />
        </div>
      </div>

      <h3 className="text-xl font-medium text-foreground">
        This lesson is part of the full course
      </h3>

      <p className="mt-3 max-w-[480px] mx-auto text-sm text-muted-foreground">
        You've completed the free preview. Subscribe to unlock all lessons, templates, and checkpoints.
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
        <a
          href={course.checkoutUrl}
          className="inline-flex h-11 items-center gap-2 rounded-full bg-foreground px-6 text-sm font-medium text-background transition-colors hover:bg-foreground/85"
        >
          Subscribe for ${course.price}
          <ArrowRight className="h-4 w-4" />
        </a>
        <Link
          href={`/courses/${course.slug}`}
          className="inline-flex h-11 items-center gap-2 rounded-full border border-border px-6 text-sm text-foreground transition-colors hover:bg-card"
        >
          View full course details
        </Link>
      </div>

      <div className="mt-8 rounded-lg border border-border bg-background/45 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          What you get
        </p>
        <ul className="mt-3 space-y-2">
          {course.includes?.slice(0, 3).map((item) => (
            <li key={item} className="text-xs text-muted-foreground flex items-start gap-2">
              <span className="text-primary">✓</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
