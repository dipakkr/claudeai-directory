"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Calculator, Search } from "lucide-react";
import { apiPricing } from "@/data/apiPricing";

const Compare = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredModels = apiPricing
    .filter(
      p =>
        !searchQuery ||
        p.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.provider.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .slice(0, 50);

  const grouped = filteredModels.reduce<Record<string, typeof filteredModels>>((acc, p) => {
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
              <h1 className="text-2xl font-semibold text-foreground mb-2">API Pricing & Features</h1>
              <p className="text-sm text-muted-foreground">
                Compare {apiPricing.length} AI models from various providers dynamically
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

          <div className="mb-8 relative max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search models or providers..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="space-y-8">
            {Object.keys(grouped).length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">No models found</div>
            ) : (
              Object.entries(grouped).map(([provider, models]) => (
                <div key={provider}>
                  <h2 className="text-base font-medium text-foreground mb-3">{provider}</h2>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {models?.map((model) => (
                      <div
                        key={model.id + model.model}
                        className="rounded-lg border border-border bg-card p-4 hover:bg-accent/50 transition-colors"
                      >
                        <h3 className="text-sm font-medium text-foreground mb-2" title={model.model}>
                          {model.model.length > 30 ? model.model.substring(0, 30) + "..." : model.model}
                        </h3>
                        <div className="space-y-1.5 text-xs text-muted-foreground mb-3">
                          <div className="flex justify-between">
                            <span>Input</span>
                            <span className="text-foreground">${model.inputPrice.toFixed(2)} / 1M tokens</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Output</span>
                            <span className="text-foreground">${model.outputPrice.toFixed(2)} / 1M tokens</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Context</span>
                            <span className="text-foreground">{(model.contextWindow / 1000).toFixed(0)}K tokens</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {model.features && model.features.length > 0 ? (
                            model.features.slice(0, 3).map((f, i) => (
                              <Badge key={i} variant="secondary" className="text-[10px] px-1.5 py-0">
                                {f}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-xs text-muted-foreground">No specific features</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Compare;
