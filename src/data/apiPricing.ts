import dynamicPricing from './apiPricingDynamic.json';

export interface APIPricing {
  id?: string;
  provider: string;
  model: string;
  inputPrice: number; // per 1M tokens
  outputPrice: number; // per 1M tokens
  contextWindow: number; // in tokens
  features: string[];
  bestFor: string[];
}

export const apiPricing: APIPricing[] = dynamicPricing;

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
