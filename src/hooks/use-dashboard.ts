import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api";

export interface DashboardSummary {
  launches: { total: number; live: number; pending: number; upvotes: number };
  submissions: { total: number; published: number; pending: number; rejected: number };
  discussions: {
    threads: number;
    replies: number;
    recent: { id: string; title: string; replies: number; created_at: string }[];
  };
  saved: number;
  tweets_added: number;
  unread_notifications: number;
}

export interface SavedItem {
  id: string;
  type: string;
  type_label: string;
  title: string;
  summary: string;
  href: string;
  saved_at: string;
}

export interface MySubmission {
  _id?: string;
  id?: string;
  name: string;
  title?: string | null;
  resource_type: "skill" | "agent" | "mcp" | string;
  status: "pending" | "needs_review" | "approved" | "rejected" | string;
  resource_slug?: string;
  reject_reason?: string | null;
  source_repo?: string;
  created_at: string;
}

export function useDashboardSummary(enabled: boolean) {
  return useQuery({
    queryKey: ["dashboard", "summary"],
    queryFn: () => api.get<DashboardSummary>("/dashboard/summary"),
    enabled,
  });
}

export function useSavedItems(enabled: boolean) {
  return useQuery({
    queryKey: ["dashboard", "saved"],
    queryFn: () => api.get<{ items: SavedItem[] }>("/dashboard/saved"),
    enabled,
  });
}

export function useMySubmissions(enabled: boolean) {
  return useQuery({
    queryKey: ["submissions", "mine"],
    queryFn: () => api.get<MySubmission[]>("/submissions/mine"),
    enabled,
  });
}
