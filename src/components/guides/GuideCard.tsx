import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Clock, BookOpen, ArrowRight } from "lucide-react";
import type { Guide } from "@/types";

export function GuideCard({ guide }: { guide: Guide }) {
  return (
    <Link
      href={`/guides/${guide.id}`}
      className="group rounded-xl border border-border bg-card overflow-hidden hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all flex flex-col"
    >
      {/* Thumbnail */}
      <div className="aspect-[3/1] relative overflow-hidden bg-gradient-to-br from-primary/20 via-primary/5 to-background flex items-center justify-center p-4">
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "radial-gradient(circle, currentColor 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />
        <p className="relative text-sm font-semibold text-foreground/90 leading-snug line-clamp-2 text-center">
          {guide.title}
        </p>
        {guide.is_free ? (
          <Badge className="absolute top-3 right-3 bg-green-500/10 text-green-500 border-0 text-[10px]">
            Free
          </Badge>
        ) : (
          <Badge className="absolute top-3 right-3 bg-primary/10 text-primary border-0 text-[10px] font-semibold">
            ${guide.price}
          </Badge>
        )}
      </div>

      {/* Body */}
      <div className="p-3 flex flex-col flex-1">
        {/* Tags */}
        <div className="flex items-center gap-1.5 mb-2">
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 capitalize">
            {guide.difficulty}
          </Badge>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 capitalize">
            {guide.category}
          </Badge>
        </div>

        {/* Description */}
        <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed flex-1 mb-3">
          {guide.description}
        </p>

        {/* Stats */}
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground mb-3">
          <span className="flex items-center gap-1">
            <BookOpen className="h-3 w-3" />
            {guide.total_lessons} lessons
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {guide.estimated_time} min
          </span>
        </div>

        {/* CTA */}
        <div className="flex items-center justify-between rounded-md bg-primary/8 group-hover:bg-primary/15 transition-colors px-2.5 py-2">
          <span className="text-[11px] font-medium text-primary">
            {guide.is_free ? "Start Learning" : `Enroll for $${guide.price}`}
          </span>
          <ArrowRight className="h-3 w-3 text-primary group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </Link>
  );
}
