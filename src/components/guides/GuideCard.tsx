import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Clock, BookOpen, ArrowRight } from "lucide-react";
import type { Guide } from "@/types";

export function GuideCard({ guide }: { guide: Guide }) {
  return (
    <Link
      href={`/guides/${guide.id}`}
      className="group flex flex-col h-full rounded-2xl border border-border/40 bg-card/30 overflow-hidden hover:bg-card/80 hover:border-border/80 transition-all duration-300 hover:shadow-sm backdrop-blur-sm relative"
    >
      {/* Thumbnail */}
      <div className="aspect-[16/9] w-full relative overflow-hidden bg-gradient-to-br from-zinc-900 via-[#111] to-black flex items-center justify-center p-6 border-b border-border/50">
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: "radial-gradient(circle at center, #f97316 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />

        <p className="relative z-10 text-base font-semibold text-white/90 leading-snug line-clamp-3 text-center px-4 group-hover:text-white transition-colors drop-shadow-sm">
          {guide.title}
        </p>

        {/* Decorative fade */}
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[80%] h-20 bg-orange-500/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

        {guide.is_free ? (
          <Badge className="absolute top-3 right-3 bg-green-500/10 text-green-500 hover:bg-green-500/20 border-0 text-[10px] font-semibold tracking-wide uppercase shadow-sm">
            Free
          </Badge>
        ) : (
          <Badge className="absolute top-3 right-3 bg-orange-500 text-white hover:bg-orange-600 border-0 text-[10px] font-bold tracking-wide uppercase shadow-md">
            ${guide.price}
          </Badge>
        )}
      </div>

      {/* Body */}
      <div className="p-3 flex flex-col flex-1">
        {/* Tags */}
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="secondary" className="text-[10px] px-2 py-0.5 capitalize bg-muted/60 text-muted-foreground hover:bg-muted font-medium border border-border/50">
            {guide.difficulty}
          </Badge>
          <Badge variant="outline" className="text-[10px] px-2 py-0.5 capitalize bg-transparent text-muted-foreground border-border/50">
            {guide.category}
          </Badge>
        </div>

        {/* Description */}
        <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed flex-1 mb-5 opacity-90 mt-1">
          {guide.description}
        </p>

        {/* Stats & CTA */}
        <div className="mt-auto flex flex-col gap-4">
          <div className="flex items-center gap-3.5 text-[11px] font-medium text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5 opacity-70" />
              {guide.total_lessons} lessons
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 opacity-70" />
              {guide.estimated_time}m
            </span>
          </div>

          <div className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-orange-500/5 text-orange-500/70 text-[13px] font-semibold border border-orange-500/10 group-hover:bg-orange-500 group-hover:text-white group-hover:border-orange-500 group-hover:shadow-md transition-all duration-300">
            Start Learning <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </div>
      </div>
    </Link>
  );
}
