import type { Metadata } from "next";
import { loadSkills } from "@/lib/server/skills";
import { loadOrders } from "@/lib/server/rankings";
import { listingRobots } from "@/lib/seo";
import SkillsClient from "./SkillsClient";

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
  // Rankings are optional; an unavailable ranking endpoint must not hold the
  // whole catalog behind a 15-second loader. buildOrders supplies the fallback.
  const [initialData, ranked] = await Promise.all([loadSkills(), loadOrders("skill", 1500)]);

  return (
    <SkillsClient
      initialData={initialData}
      initialParams={{ category: params.category, search: params.search }}
      ranked={ranked}
    />
  );
}
