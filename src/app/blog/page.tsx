import { fetchApi } from "@/lib/api-server";
import type { BlogPost } from "@/types";
import BlogClient from "./BlogClient";

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string }>;
}) {
  const params = await searchParams;
  const qs = new URLSearchParams();
  if (params.search) qs.set("search", params.search);
  if (params.category && params.category !== "All") qs.set("category", params.category);

  const qsStr = qs.toString();
  const initialData = await fetchApi<BlogPost[]>(`/blog${qsStr ? `?${qsStr}` : ""}`) ?? [];

  return (
    <BlogClient
      initialData={initialData}
      initialParams={{ category: params.category, search: params.search }}
    />
  );
}
