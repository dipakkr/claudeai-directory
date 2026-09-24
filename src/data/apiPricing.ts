import dynamicPricing from './apiPricingDynamic.json';

// Regenerate with `node scripts/update-llm-pricing.mjs`.
export interface APIPricing {
  id?: string;
  provider: string;
  model: string;
  inputPrice: number; // per 1M tokens
  outputPrice: number; // per 1M tokens
  cacheReadPrice?: number | null; // per 1M tokens
  contextWindow: number; // in tokens
  maxOutput?: number | null;
  released?: string | null; // YYYY-MM-DD
  openWeights?: boolean;
  features: string[];
  bestFor: string[];
}

export const pricingUpdatedAt: string = dynamicPricing.updatedAt;
export const apiPricing: APIPricing[] = dynamicPricing.models;

// Industry-standard blend used by public benchmarks: 3 input tokens per output token.
export const blendedPrice = (p: APIPricing) => (p.inputPrice * 3 + p.outputPrice) / 4;

export const calculateCost = (
  inputTokens: number,
  outputTokens: number,
  pricing: APIPricing
): number => {
  const inputCost = (inputTokens / 1_000_000) * pricing.inputPrice;
  const outputCost = (outputTokens / 1_000_000) * pricing.outputPrice;
  return inputCost + outputCost;
};

export const compareProviders = (
  inputTokens: number,
  outputTokens: number,
  searchQuery: string = ''
): Array<{ provider: string; model: string; cost: number; features: string[] }> => {
  return apiPricing
    .filter(p => !searchQuery || p.model.toLowerCase().includes(searchQuery.toLowerCase()) || p.provider.toLowerCase().includes(searchQuery.toLowerCase()))
    .map(pricing => ({
      provider: pricing.provider,
      model: pricing.model,
      cost: calculateCost(inputTokens, outputTokens, pricing),
      features: pricing.features,
    })).sort((a, b) => a.cost - b.cost);
};
