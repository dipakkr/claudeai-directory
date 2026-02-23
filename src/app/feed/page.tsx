import { fetchApi } from "@/lib/api-server";
import type { FeedItem } from "@/types";
import FeedClient from "./FeedClient";

export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const endpoint = `/feed?limit=50${type ? `&type=${encodeURIComponent(type)}` : ""}`;
  const initialItems = await fetchApi<FeedItem[]>(endpoint) ?? [];

  return <FeedClient initialItems={initialItems} initialType={type} />;
}
