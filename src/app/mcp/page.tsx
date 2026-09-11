import type { Metadata } from "next";
import { fetchApi } from "@/lib/api-server";
import { loadOrders } from "@/lib/server/rankings";
import { listingRobots } from "@/lib/seo";
import type { MCPServer } from "@/types";
import MCPClient from "./MCPClient";

interface MCPServersListResponse {
  data: MCPServer[];
  isCache: boolean;
}

type ListingParams = Promise<{ category?: string; search?: string }>;

export async function generateMetadata({ searchParams }: { searchParams: ListingParams }): Promise<Metadata> {
  const params = await searchParams;
  return { robots: listingRobots(params) };
}

export default async function MCPPage({
  searchParams,
}: {
  searchParams: ListingParams;
}) {
  const params = await searchParams;
  // Fetch the whole index; search and category filter client-side so the
  // ranked list, chips and counts stay consistent.
  const [response, ranked] = await Promise.all([
    fetchApi<MCPServersListResponse>("/mcp-servers?limit=200"),
    loadOrders("mcp"),
  ]);
  const initialData = response?.data ?? [];

  return (
    <MCPClient
      initialData={initialData}
      initialParams={{ category: params.category, search: params.search }}
      ranked={ranked}
    />
  );
}
