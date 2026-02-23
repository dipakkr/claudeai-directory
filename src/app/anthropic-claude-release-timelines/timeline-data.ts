export type EventCategory =
  | "model_release"
  | "feature_update"
  | "product_launch"
  | "app"
  | "api"
  | "tooling"
  | "agent"
  | "research_paper"
  | "safety"
  | "policy"
  | "benchmark"
  | "company_milestone"
  | "funding"
  | "partnership";

export type EventTier = "major" | "notable" | "minor";

export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  date_precision: "exact" | "month" | "quarter";
  category: EventCategory;
  tags: string[];
  source_url: string;
  model_family: string;
  tier: EventTier;
  metadata: {
    context_window: number | null;
    modalities: string[];
    pricing_change: boolean;
    api_availability: boolean;
    notes: string;
  };
}

export const CATEGORY_LABELS: Record<EventCategory, string> = {
  model_release: "Model Release",
  feature_update: "Feature",
  product_launch: "Product",
  app: "App",
  api: "API",
  tooling: "Tooling",
  agent: "Agent",
  research_paper: "Research",
  safety: "Safety",
  policy: "Policy",
  benchmark: "Benchmark",
  company_milestone: "Milestone",
  funding: "Funding",
  partnership: "Partnership",
};


