// Rebuilds src/data/apiPricingDynamic.json for /llm-api-pricing.
//
//   node scripts/update-llm-pricing.mjs
//
// Non-Claude prices come from the public OpenRouter model catalog. Claude rows
// come from src/data/claudeModels.ts (Anthropic's official price list), so the
// Claude numbers never depend on a third party.

import { writeFileSync } from "node:fs";
import { claudeModels } from "../src/data/claudeModels.ts";

const OUT = new URL("../src/data/apiPricingDynamic.json", import.meta.url);
// Older models clutter the comparison and are mostly retired.
const MAX_AGE_DAYS = 730;

const PROVIDERS = {
  openai: "OpenAI",
  google: "Google",
  "x-ai": "xAI",
  deepseek: "DeepSeek",
  "meta-llama": "Meta",
  meta: "Meta",
  mistralai: "Mistral",
  qwen: "Qwen",
  moonshotai: "Moonshot AI",
  "z-ai": "Z.ai",
  minimax: "MiniMax",
  amazon: "Amazon",
  cohere: "Cohere",
  nvidia: "NVIDIA",
  perplexity: "Perplexity",
  microsoft: "Microsoft",
  xiaomi: "Xiaomi",
  "bytedance-seed": "ByteDance",
  tencent: "Tencent",
  baidu: "Baidu",
  inclusionai: "inclusionAI",
  "ai21": "AI21",
  ibm: "IBM",
};

const perMillion = value => Math.round(Number(value) * 1_000_000 * 10_000) / 10_000;

function features(model) {
  const params = new Set(model.supported_parameters ?? []);
  const inputs = new Set(model.architecture?.input_modalities ?? []);
  const list = [];
  if (params.has("tools")) list.push("Tool use");
  if (model.reasoning || params.has("reasoning")) list.push("Reasoning");
  if (inputs.has("image")) list.push("Vision");
  if (inputs.has("audio")) list.push("Audio input");
  if (inputs.has("file")) list.push("File input");
  if (params.has("structured_outputs")) list.push("Structured outputs");
  return list;
}

const res = await fetch("https://openrouter.ai/api/v1/models");
if (!res.ok) throw new Error(`OpenRouter catalog request failed: ${res.status}`);
const catalog = (await res.json()).data;
const byId = new Map(catalog.map(m => [m.id, m]));
const cutoff = Date.now() / 1000 - MAX_AGE_DAYS * 86_400;

const others = catalog
  .filter(m => {
    const [slug] = m.id.split("/");
    if (m.id.includes(":") || slug === "anthropic" || !PROVIDERS[slug]) return false;
    if ((m.architecture?.output_modalities ?? []).join() !== "text") return false;
    if (m.created < cutoff) return false;
    return Number(m.pricing?.prompt) > 0 && Number(m.pricing?.completion) > 0;
  })
  .map(m => {
    const [slug] = m.id.split("/");
    return {
      id: m.id,
      provider: PROVIDERS[slug],
      model: m.name.replace(/^[^:]+:\s*/, ""),
      inputPrice: perMillion(m.pricing.prompt),
      outputPrice: perMillion(m.pricing.completion),
      cacheReadPrice: m.pricing.input_cache_read ? perMillion(m.pricing.input_cache_read) : null,
      contextWindow: m.context_length,
      maxOutput: m.top_provider?.max_completion_tokens ?? null,
      released: new Date(m.created * 1000).toISOString().slice(0, 10),
      openWeights: Boolean(m.hugging_face_id),
      features: features(m),
      bestFor: [],
    };
  });

const claude = claudeModels.map(c => {
  const listed = byId.get(c.openRouterId);
  return {
    id: c.apiId,
    provider: "Anthropic",
    model: c.name,
    inputPrice: c.input,
    outputPrice: c.output,
    cacheReadPrice: c.cacheRead,
    contextWindow: c.contextWindow,
    maxOutput: c.maxOutput,
    released: listed ? new Date(listed.created * 1000).toISOString().slice(0, 10) : null,
    openWeights: false,
    features: listed ? features(listed) : ["Tool use", "Vision", "Reasoning"],
    bestFor: [],
  };
});

const models = [...claude, ...others].sort((a, b) => (b.released ?? "").localeCompare(a.released ?? ""));
writeFileSync(
  OUT,
  JSON.stringify({ updatedAt: new Date().toISOString().slice(0, 10), source: "OpenRouter + Anthropic docs", models }, null, 2) + "\n",
);
console.log(`Wrote ${models.length} models (${claude.length} Claude)`);
