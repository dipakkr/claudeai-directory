import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Clock, BookOpen, ArrowRight } from "lucide-react";
import type { Guide } from "@/types";

export function GuideCard({ guide }: { guide: Guide }) {
  return (
    <Link
      href={`/guides/${guide.id}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card/40 transition-colors hover:border-[var(--cad-line-hover)]"
    >
      {/* Thumbnail */}
      <div className="relative flex aspect-[16/9] w-full items-center justify-center overflow-hidden border-b border-border bg-secondary p-6">
        <div
          className="absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage: "radial-gradient(circle at center, hsl(var(--primary)) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />
        <p className="font-display relative z-10 line-clamp-3 px-4 text-center text-lg leading-snug text-foreground">
          {guide.title}
        </p>

        <div className="absolute right-3 top-3">
          {guide.is_free ? <Badge>Free</Badge> : <Badge variant="outline">${guide.price}</Badge>}
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-3 flex items-center gap-2">
          <Badge variant="secondary" className="capitalize">
            {guide.difficulty}
          </Badge>
          <Badge variant="outline" className="capitalize">
            {guide.category}
          </Badge>
        </div>

        <p className="mb-5 mt-1 line-clamp-3 flex-1 text-[13px] leading-relaxed text-muted-foreground">{guide.description}</p>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-3.5">
          <div className="flex items-center gap-3.5 font-mono text-[11.5px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5 opacity-70" />
              {guide.total_lessons} lessons
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 opacity-70" />
              {guide.estimated_time}m
            </span>
          </div>
          <span className="flex items-center gap-1 text-[13px] text-foreground transition-colors group-hover:text-primary">
            Start learning <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
