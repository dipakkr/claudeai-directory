"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import HeroSection from "@/components/home/HeroSection";
import CategorySection from "@/components/home/CategorySection";
import FeaturedResources from "@/components/home/FeaturedResources";
import FeedSection from "@/components/home/FeedSection";
import MCPSection from "@/components/home/MCPSection";
import PromptsSection from "@/components/home/PromptsSection";
import CTASection from "@/components/home/CTASection";
import type { Stat, Skill, MCPServer, FeedItem, Prompt } from "@/types";

interface HomeContentProps {
  initialStats: Stat[];
  initialFeaturedSkills: Skill[];
  initialMcpServers: MCPServer[];
  initialFeedItems: FeedItem[];
  initialPrompts: Prompt[];
}

function HomeInner({
  initialStats,
  initialFeaturedSkills,
  initialMcpServers,
  initialFeedItems,
  initialPrompts,
}: HomeContentProps) {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  return (
    <>
      <HeroSection initialQuery={initialQuery} initialStats={initialStats} />
      {!initialQuery && (
        <>
          <div className="lg:hidden">
            <CategorySection />
          </div>
          <FeaturedResources initialSkills={initialFeaturedSkills} />
          <MCPSection initialServers={initialMcpServers} />
          <PromptsSection initialPrompts={initialPrompts} />
          <FeedSection initialItems={initialFeedItems} />
          <CTASection />
        </>
      )}
    </>
  );
}

/* Lightweight skeleton that matches the hero + grid layout so the page
   doesn't flash empty while client JS hydrates */
function HomeSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Hero skeleton */}
      <section className="pt-10 pb-8 md:pt-24 md:pb-20">
        <div className="container max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 lg:pr-8">
              <div className="h-6 w-48 rounded bg-muted mb-6" />
              <div className="h-10 w-80 rounded bg-muted mb-3" />
              <div className="h-10 w-64 rounded bg-muted mb-5" />
              <div className="h-4 w-96 max-w-full rounded bg-muted mb-2" />
              <div className="h-4 w-72 max-w-full rounded bg-muted mb-10" />
              <div className="h-12 w-full max-w-xl rounded-md bg-muted" />
            </div>
            <div className="hidden lg:grid grid-cols-2 gap-3 lg:col-span-6 lg:pl-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="rounded-xl border border-border p-4 h-24" />
              ))}
              <div className="rounded-xl border border-border p-4 h-24 col-span-2" />
            </div>
          </div>
        </div>
      </section>

      {/* Content sections skeleton */}
      <section className="py-12">
        <div className="container max-w-7xl mx-auto">
          <div className="h-6 w-48 rounded bg-muted mb-6" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-xl border border-border p-5 h-40" />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default function HomeContent(props: HomeContentProps) {
  return (
    <Suspense fallback={<HomeSkeleton />}>
      <HomeInner {...props} />
    </Suspense>
  );
}

