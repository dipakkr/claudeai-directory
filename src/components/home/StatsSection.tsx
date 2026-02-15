"use client";

import { useStats } from "@/hooks/use-stats";
import { Skeleton } from "@/components/ui/skeleton";

const StatsSection = () => {
  const { data: stats, isLoading } = useStats();

  if (isLoading) {
    return (
      <section className="py-8">
        <div className="container">
          <div className="flex justify-center gap-12">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-32" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!stats?.length) return null;

  return (
    <section className="py-8">
      <div className="container">
        <div className="flex flex-wrap justify-center gap-8 md:gap-16">
          {stats.map((stat) => (
            <div key={stat.id} className="text-center">
              <div className="text-2xl font-semibold text-foreground">{stat.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
