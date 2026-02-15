import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Clock, BookOpen, ArrowUpRight } from "lucide-react";
import type { Guide } from "@/types";

export function GuideCard({ guide }: { guide: Guide }) {
  return (
    <Link
      href={`/guides/${guide.id}`}
      className="group rounded-lg border border-border bg-card overflow-hidden hover:border-primary/20 transition-all"
    >
      <div className="aspect-[2.5/1] bg-muted/50 flex items-center justify-center relative">
        <span className="text-4xl text-muted-foreground/20 font-semibold">
          {guide.title[0]?.toUpperCase()}
        </span>
        {guide.is_free ? (
          <Badge className="absolute top-3 right-3 bg-green-500/10 text-green-500 border-0 text-[10px]">
            Free
          </Badge>
        ) : (
          <Badge className="absolute top-3 right-3 bg-primary/10 text-primary border-0 text-[10px]">
            ${guide.price}
          </Badge>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
            {guide.difficulty}
          </Badge>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
            {guide.category}
          </Badge>
        </div>
        <h3 className="text-sm font-medium text-foreground mb-1 group-hover:text-primary transition-colors">
          {guide.title}
        </h3>
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
          {guide.description}
        </p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              {guide.total_lessons} lessons
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {guide.estimated_time} min
            </span>
          </div>
          <ArrowUpRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </Link>
  );
}
