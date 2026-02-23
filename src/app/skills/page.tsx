import { fetchApi } from "@/lib/api-server";
import type { Skill } from "@/types";
import SkillsClient from "./SkillsClient";

interface SkillsListResponse {
  data: Skill[];
  isCache: boolean;
}

export default async function SkillsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string }>;
}) {
  const params = await searchParams;
  const qs = new URLSearchParams();
  if (params.search) qs.set("search", params.search);
  if (params.category && params.category !== "All") qs.set("category", params.category);

  const qsStr = qs.toString();
  const response = await fetchApi<SkillsListResponse>(`/skills${qsStr ? `?${qsStr}` : ""}`);
  const initialData = response?.data ?? [];

  return (
    <SkillsClient
      initialData={initialData}
      initialParams={{ category: params.category, search: params.search }}
    />
  );
}
