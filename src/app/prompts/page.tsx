import { fetchApi } from "@/lib/api-server";
import type { Prompt } from "@/types";
import PromptsClient from "./PromptsClient";

export default async function PromptsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string }>;
}) {
  const params = await searchParams;
  // Whole index; filtering happens client-side in the ranked list.
  const initialData = (await fetchApi<Prompt[]>("/prompts?limit=100")) ?? [];

  return (
    <PromptsClient
      initialData={initialData}
      initialParams={{ category: params.category, search: params.search }}
    />
  );
}
