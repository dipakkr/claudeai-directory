import { cache } from "react";
import { fetchApi } from "@/lib/api-server";
import type { Skill } from "@/types";

export const loadSkills = cache(async () => {
  const result = await fetchApi<{ data: Skill[] }>("/skills?limit=100", {
    throwOnError: true,
    timeoutMs: 5000,
  });
  if (!result) throw new Error("Skills catalog is unavailable");
  return result.data;
});

// The catalog API returns complete skill records. Reuse its five-minute data
// cache for listed details instead of opening a new network request per slug.
// AbortSignal opts fetch out of memoization, so cache also shares this result
// between generateMetadata and the page, including errors and genuine 404s.
export const loadSkill = cache(async (id: string) => {
  const skills = await loadSkills();
  const listed = skills.find(skill => skill.id === id);
  if (listed) return listed;
  // New skills and entries outside the first catalog page remain addressable.
  return fetchApi<Skill>(`/skills/${encodeURIComponent(id)}`, { throwOnError: true, timeoutMs: 5000 });
});
