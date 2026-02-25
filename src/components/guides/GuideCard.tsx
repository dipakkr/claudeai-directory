import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Clock, BookOpen, ArrowRight } from "lucide-react";
import type { Guide } from "@/types";

export function GuideCard({ guide }: { guide: Guide }) {
  return (
    <Link
      href={`/guides/${guide.id}`}
      className="group flex flex-col h-full rounded-2xl border border-border bg-card/50 overflow-hidden hover:bg-card hover:border-orange-500/30 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(249,115,22,0.06)] backdrop-blur-sm relative"
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

        {/* Course icon/graphic */}
        <div className="relative z-10 w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-500 flex items-center justify-center mb-6 shadow-lg transform group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-500">
          <BookOpen className="h-6 w-6" />
        </div>

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

        {/* Title & Description */}
        <h3 className="text-base font-semibold text-foreground tracking-tight mb-2 group-hover:text-orange-500 transition-colors line-clamp-2">
          {guide.title}
        </h3>

        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed flex-1 mb-5 opacity-90">
          {guide.description}
        </p>

        {/* Stats */}
        <div className="flex items-center justify-between mt-auto">
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

          {/* Inline CTA */}
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-500/10 group-hover:bg-orange-500 transition-colors duration-300">
            <ArrowRight className="h-3.5 w-3.5 text-orange-500 group-hover:text-white transition-colors" />
          </div>
        </div>
      </div>
    </Link>
  );
}
