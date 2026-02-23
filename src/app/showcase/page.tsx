import { fetchApi } from "@/lib/api-server";
import type { ShowcaseProject } from "@/types";
import ShowcaseClient from "./ShowcaseClient";

export default async function ShowcasePage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const params = await searchParams;
  const qs = new URLSearchParams();
  if (params.search) qs.set("search", params.search);

  const qsStr = qs.toString();
  const initialData = await fetchApi<ShowcaseProject[]>(`/showcase${qsStr ? `?${qsStr}` : ""}`) ?? [];

  return <ShowcaseClient initialData={initialData} />;
}
