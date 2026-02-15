"use client";

import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calculator, ArrowUpRight } from "lucide-react";
import { useAPIPricing } from "@/hooks/use-api-pricing";

const Compare = () => {
  const { data: pricing, isLoading } = useAPIPricing();

  const grouped = (pricing ?? []).reduce<Record<string, typeof pricing>>((acc, p) => {
    if (!acc[p.provider]) acc[p.provider] = [];
    acc[p.provider]!.push(p);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container py-10">
          <div className="mb-8 flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground mb-2">API Pricing</h1>
              <p className="text-sm text-muted-foreground">
                Compare Claude with other AI providers
              </p>
            </div>
            <Link
              href="/llm-api-pricing/cost-calculator"
              className="inline-flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-4 py-2 text-sm text-primary hover:bg-primary/10 transition-colors"
            >
              <Calculator className="h-4 w-4" />
              Cost Calculator
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(grouped).map(([provider, models]) => (
                <div key={provider}>
                  <h2 className="text-base font-medium text-foreground mb-3">{provider}</h2>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {models?.map((model) => (
                      <div
                        key={model.id}
                        className="rounded-lg border border-border bg-card p-4 hover:bg-accent/50 transition-colors"
                      >
                        <h3 className="text-sm font-medium text-foreground mb-2">{model.model}</h3>
                        <div className="space-y-1.5 text-xs text-muted-foreground mb-3">
                          <div className="flex justify-between">
                            <span>Input</span>
                            <span className="text-foreground">${model.input_price.toFixed(2)} / 1M tokens</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Output</span>
                            <span className="text-foreground">${model.output_price.toFixed(2)} / 1M tokens</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Context</span>
                            <span className="text-foreground">{(model.context_window / 1000).toFixed(0)}K tokens</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {model.best_for.slice(0, 2).map((b) => (
                            <Badge key={b} variant="secondary" className="text-[10px] px-1.5 py-0">
                              {b}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Compare;
