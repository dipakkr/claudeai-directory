import { fetchApi } from "@/lib/api-server";
import type { ShowcaseProject } from "@/types";
import ShowcaseClient from "./ShowcaseClient";
import { TOPICS, topicSlug } from "@/lib/launch-options";

export default async function ShowcasePage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; topic?: string }>;
}) {
  const params = await searchParams;
  const qs = new URLSearchParams();
  if (params.search) qs.set("search", params.search);

  const qsStr = qs.toString();
  const initialData = await fetchApi<ShowcaseProject[]>(`/showcase${qsStr ? `?${qsStr}` : ""}`) ?? [];

  const initialTopic = TOPICS.find((t) => topicSlug(t) === params.topic) ?? "";
  return <ShowcaseClient initialData={initialData} initialTopic={initialTopic} />;
}
