"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import HeroSection from "@/components/home/HeroSection";
import CategorySection from "@/components/home/CategorySection";
import FeaturedResources from "@/components/home/FeaturedResources";
import FeedSection from "@/components/home/FeedSection";
import MCPSection from "@/components/home/MCPSection";
import CTASection from "@/components/home/CTASection";
import type { Stat, Skill, MCPServer, FeedItem } from "@/types";

interface HomeContentProps {
  initialStats: Stat[];
  initialFeaturedSkills: Skill[];
  initialMcpServers: MCPServer[];
  initialFeedItems: FeedItem[];
}

function HomeInner({
  initialStats,
  initialFeaturedSkills,
  initialMcpServers,
  initialFeedItems,
}: HomeContentProps) {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  return (
    <>
      <HeroSection initialQuery={initialQuery} initialStats={initialStats} />
      {!initialQuery && (
        <>
          <CategorySection />
          <FeaturedResources initialSkills={initialFeaturedSkills} />
          <MCPSection initialServers={initialMcpServers} />
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
