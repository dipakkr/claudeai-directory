import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { PublicProfile } from "@/types";

interface MembersParams {
  search?: string;
  page?: number;
  per_page?: number;
}

export interface MembersResponse {
  members: PublicProfile[];
  total: number;
}

export function useMembers(
  params?: MembersParams,
  options?: { initialData?: MembersResponse }
) {
  return useQuery({
    queryKey: ["members", params],
    queryFn: () =>
      api.get<MembersResponse>(
        "/users",
        params as Record<string, string | number | boolean | undefined>
      ),
    initialData: options?.initialData,
    initialDataUpdatedAt: options?.initialData ? Date.now() : undefined,
  });
}
