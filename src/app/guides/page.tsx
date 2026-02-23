import { fetchApi } from "@/lib/api-server";
import type { Guide } from "@/types";
import GuidesClient from "./GuidesClient";

export default async function GuidesPage() {
  const initialData = await fetchApi<Guide[]>("/guides") ?? [];
  return <GuidesClient initialData={initialData} />;
}
