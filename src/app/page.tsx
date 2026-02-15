"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import CategorySection from "@/components/home/CategorySection";
import FeaturedResources from "@/components/home/FeaturedResources";
import FeedSection from "@/components/home/FeedSection";
import MCPSection from "@/components/home/MCPSection";
import CommunitySection from "@/components/home/CommunitySection";
import CTASection from "@/components/home/CTASection";
import { OrganizationSchema, WebSiteSchema } from "@/components/seo/JsonLd";

function HomeContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  return (
    <>
      <HeroSection initialQuery={initialQuery} />
      {!initialQuery && (
        <>
          <CategorySection />
          <FeaturedResources />
          <MCPSection />
          <FeedSection />
          <CommunitySection />
          <CTASection />
        </>
      )}
    </>
  );
}

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <OrganizationSchema />
      <WebSiteSchema />
      <Header />
      <main>
        <Suspense>
          <HomeContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
