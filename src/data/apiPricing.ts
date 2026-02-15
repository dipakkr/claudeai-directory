export interface APIPricing {
  provider: string;
  model: string;
  inputPrice: number; // per 1M tokens
  outputPrice: number; // per 1M tokens
  contextWindow: number; // in tokens
  features: string[];
  bestFor: string[];
}

export const apiPricing: APIPricing[] = [
  {
    provider: "Anthropic",
    model: "Claude 3.5 Sonnet",
    inputPrice: 3.00,
    outputPrice: 15.00,
    contextWindow: 200000,
    features: [
      "200K context window",
      "Fast responses",
      "Strong reasoning",
      "Code generation",
      "Vision capabilities"
    ],
    bestFor: [
      "Complex reasoning tasks",
      "Code generation",
      "Long documents",
      "Multi-step analysis"
    ]
  },
  {
    provider: "Anthropic",
    model: "Claude 3 Opus",
    inputPrice: 15.00,
    outputPrice: 75.00,
    contextWindow: 200000,
    features: [
      "200K context window",
      "Most capable model",
      "Advanced reasoning",
      "Best for complex tasks"
    ],
    bestFor: [
      "Complex analysis",
      "Research",
      "Advanced coding",
      "Strategic planning"
    ]
  },
  {
    provider: "Anthropic",
    model: "Claude 3 Haiku",
    inputPrice: 0.25,
    outputPrice: 1.25,
    contextWindow: 200000,
    features: [
      "200K context window",
      "Fastest responses",
      "Cost-effective",
      "Good for simple tasks"
    ],
    bestFor: [
      "Simple queries",
      "High-volume tasks",
      "Quick responses",
      "Cost-sensitive applications"
    ]
  },
  {
    provider: "OpenAI",
    model: "GPT-4 Turbo",
    inputPrice: 10.00,
    outputPrice: 30.00,
    contextWindow: 128000,
    features: [
      "128K context window",
      "Strong performance",
      "Wide adoption",
      "Good tool use"
    ],
    bestFor: [
      "General purpose tasks",
      "Chat applications",
      "Content generation",
      "API integrations"
    ]
  },
  {
    provider: "OpenAI",
    model: "GPT-4",
    inputPrice: 30.00,
    outputPrice: 60.00,
    contextWindow: 8192,
    features: [
      "8K context window",
      "High quality",
      "Reliable",
      "Proven track record"
    ],
    bestFor: [
      "Quality-critical tasks",
      "Short documents",
      "Precision work"
    ]
  },
  {
    provider: "OpenAI",
    model: "GPT-3.5 Turbo",
    inputPrice: 0.50,
    outputPrice: 1.50,
    contextWindow: 16385,
    features: [
      "16K context window",
      "Very fast",
      "Cost-effective",
      "Good for simple tasks"
    ],
    bestFor: [
      "Simple tasks",
      "High volume",
      "Cost optimization",
      "Quick responses"
    ]
  },
  {
    provider: "Google",
    model: "Gemini 1.5 Pro",
    inputPrice: 1.25,
    outputPrice: 5.00,
    contextWindow: 2000000,
    features: [
      "2M context window",
      "Massive context",
      "Multimodal",
      "Good for long documents"
    ],
    bestFor: [
      "Very long documents",
      "Multimodal tasks",
      "Large context needs",
      "Document analysis"
    ]
  },
  {
    provider: "Google",
    model: "Gemini 1.5 Flash",
    inputPrice: 0.075,
    outputPrice: 0.30,
    contextWindow: 1000000,
    features: [
      "1M context window",
      "Very fast",
      "Very cheap",
      "Good performance"
    ],
    bestFor: [
      "High volume",
      "Cost optimization",
      "Quick tasks",
      "Budget applications"
    ]
  },
  {
    provider: "xAI",
    model: "Grok-1.5",
    inputPrice: 0.50,
    outputPrice: 2.00,
    contextWindow: 131072,
    features: [
      "128K context window",
      "Real-time data",
      "X integration",
      "Fast responses"
    ],
    bestFor: [
      "Real-time information",
      "Social media integration",
      "Current events",
      "X/Twitter data"
    ]
  },
  {
    provider: "Perplexity",
    model: "Perplexity API",
    inputPrice: 0.20,
    outputPrice: 0.20,
    contextWindow: 12000,
    features: [
      "Web search built-in",
      "Citations",
      "Real-time data",
      "Research-focused"
    ],
    bestFor: [
      "Research tasks",
      "Web search",
      "Fact-checking",
      "Current information"
    ]
  }
];

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
  outputTokens: number
): Array<{ provider: string; model: string; cost: number }> => {
  return apiPricing.map(pricing => ({
    provider: pricing.provider,
    model: pricing.model,
    cost: calculateCost(inputTokens, outputTokens, pricing)
  })).sort((a, b) => a.cost - b.cost);
};

