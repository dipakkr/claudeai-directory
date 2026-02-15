"use client";

import Link from "next/link";
import { ArrowUpRight, Star, CheckCircle } from "lucide-react";
import { useSkills } from "@/hooks/use-skills";
import { Skeleton } from "@/components/ui/skeleton";

const FeaturedResources = () => {
  const { data: skills, isLoading } = useSkills({ featured: true, limit: 8 });

  return (
    <section className="py-10">
      <div className="container">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-medium text-foreground">Featured Skills</h2>
          <Link
            href="/skills"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            View all <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {(skills ?? []).slice(0, 8).map((skill) => (
              <Link
                key={skill.id}
                href={`/skills/${skill.id}`}
                className="group rounded-lg border border-border bg-card p-4 hover:bg-accent/50 hover:border-primary/20 transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center text-primary text-sm font-medium">
                      {skill.name[0]?.toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-foreground flex items-center gap-1">
                        {skill.name}
                        {skill.verified && <CheckCircle className="h-3 w-3 text-primary" />}
                      </h3>
                      <p className="text-xs text-muted-foreground">{skill.category}</p>
                    </div>
                  </div>
                  <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                  {skill.description}
                </p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-yellow-500" />
                    {skill.rating.toFixed(1)}
                  </span>
                  <span>{skill.downloads.toLocaleString()} downloads</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedResources;
