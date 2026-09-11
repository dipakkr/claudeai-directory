import type { Metadata } from "next";
import { fetchApi } from "@/lib/api-server";
import { loadOrders } from "@/lib/server/rankings";
import { listingRobots } from "@/lib/seo";
import type { Skill } from "@/types";
import SkillsClient from "./SkillsClient";

interface SkillsListResponse {
  data: Skill[];
  isCache: boolean;
}

type ListingParams = Promise<{ category?: string; search?: string }>;

export async function generateMetadata({ searchParams }: { searchParams: ListingParams }): Promise<Metadata> {
  const params = await searchParams;
  return { robots: listingRobots(params) };
}

export default async function SkillsPage({
  searchParams,
}: {
  searchParams: ListingParams;
}) {
  const params = await searchParams;
  // Whole index; filtering happens client-side in the ranked list.
  const [response, ranked] = await Promise.all([fetchApi<SkillsListResponse>("/skills?limit=100"), loadOrders("skill")]);
  const initialData = response?.data ?? [];

  return (
    <SkillsClient
      initialData={initialData}
      initialParams={{ category: params.category, search: params.search }}
      ranked={ranked}
    />
  );
}
