import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "LLM API Pricing — Compare Claude, GPT, Gemini & More",
  description:
    "Compare API pricing for Claude, GPT-4, Gemini, and other LLMs. Input/output costs, context windows, and features side by side.",
  alternates: { canonical: "/llm-api-pricing" },
  openGraph: {
    title: "LLM API Pricing — Compare Claude, GPT, Gemini & More",
    description:
      "Compare API pricing for Claude, GPT-4, Gemini, and other LLMs. Input/output costs, context windows, and features.",
    url: "/llm-api-pricing",
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
