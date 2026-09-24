import type { Metadata } from "next";

const title = "LLM API Pricing: Compare Claude, GPT, Gemini and More";
const description =
  "Compare API prices for Claude Opus 5.5, Sonnet 5, GPT, Gemini, Grok and 240+ other models. Input, output and cache prices, context windows and release dates, updated regularly.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/llm-api-pricing" },
  openGraph: { title, description, url: "/llm-api-pricing" },
  twitter: { card: "summary", title, description },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
