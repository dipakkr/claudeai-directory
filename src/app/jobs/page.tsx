import { fetchApi } from "@/lib/api-server";
import type { Job } from "@/types";
import JobsClient from "./JobsClient";

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; search?: string }>;
}) {
  const params = await searchParams;
  const qs = new URLSearchParams();
  if (params.search) qs.set("search", params.search);
  if (params.type && params.type !== "All") qs.set("type", params.type.toLowerCase());

  const qsStr = qs.toString();
  const initialData = await fetchApi<Job[]>(`/jobs${qsStr ? `?${qsStr}` : ""}`) ?? [];

  return (
    <JobsClient
      initialData={initialData}
      initialParams={{ type: params.type, search: params.search }}
    />
  );
}
