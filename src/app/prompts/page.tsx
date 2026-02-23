import { fetchApi } from "@/lib/api-server";
import type { Prompt } from "@/types";
import PromptsClient from "./PromptsClient";

export default async function PromptsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string }>;
}) {
  const params = await searchParams;
  const qs = new URLSearchParams();
  if (params.search) qs.set("search", params.search);
  if (params.category && params.category !== "All") qs.set("category", params.category);

  const qsStr = qs.toString();
  const initialData = await fetchApi<Prompt[]>(`/prompts${qsStr ? `?${qsStr}` : ""}`) ?? [];

  return (
    <PromptsClient
      initialData={initialData}
      initialParams={{ category: params.category, search: params.search }}
    />
  );
}
