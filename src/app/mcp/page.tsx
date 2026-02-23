import { fetchApi } from "@/lib/api-server";
import type { MCPServer } from "@/types";
import MCPClient from "./MCPClient";

interface MCPServersListResponse {
  data: MCPServer[];
  isCache: boolean;
}

export default async function MCPPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string }>;
}) {
  const params = await searchParams;
  const qs = new URLSearchParams();
  if (params.search) qs.set("search", params.search);
  if (params.category && params.category !== "All") qs.set("category", params.category.toLowerCase());
  qs.set("limit", "200");

  const response = await fetchApi<MCPServersListResponse>(`/mcp-servers?${qs.toString()}`);
  const initialData = response?.data ?? [];

  return (
    <MCPClient
      initialData={initialData}
      initialParams={{ category: params.category, search: params.search }}
    />
  );
}
