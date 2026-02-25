"use client";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { BookOpen } from "lucide-react";
import { useGuides } from "@/hooks/use-guides";
import { GuideCard } from "@/components/guides/GuideCard";
import type { Guide } from "@/types";

export default function GuidesClient({
  initialData,
}: {
  initialData: Guide[];
}) {
  const { data: guides } = useGuides({}, { initialData });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container py-10 max-w-7xl">
          <div className="mb-10">
            <div className="flex justify-between items-end mb-4">
              <div>
                <div className="flex items-center gap-2.5 mb-2.5">
                  <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-orange-500/10 text-orange-500 border border-orange-500/20 shadow-sm">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <h1 className="text-3xl font-bold tracking-tight text-foreground">Guides</h1>
                </div>
                <p className="text-base text-muted-foreground max-w-2xl leading-relaxed">
                  Structured courses to master Claude AI, from basics to building production agents.
                </p>
              </div>
            </div>
          </div>

          {guides && guides.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
