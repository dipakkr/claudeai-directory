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

export default function HomeContent(props: HomeContentProps) {
  return (
    <Suspense>
      <HomeInner {...props} />
    </Suspense>
  );
}
