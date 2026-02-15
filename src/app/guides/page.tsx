"use client";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen } from "lucide-react";
import { useGuides } from "@/hooks/use-guides";
import { GuideCard } from "@/components/guides/GuideCard";

export default function GuidesPage() {
  const { data: guides, isLoading } = useGuides({});

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container py-10">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <h1 className="text-2xl font-semibold text-foreground">Guides</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Structured courses to master Claude AI — from basics to building production agents.
            </p>
          </div>

          {/* Grid */}
          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-lg" />
              ))}
            </div>
          ) : guides && guides.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {guides.map((guide) => (
                <GuideCard key={guide.id} guide={guide} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <BookOpen className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No guides found.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
