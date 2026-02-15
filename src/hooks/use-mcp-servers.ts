import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api";
import type { MCPServer } from "@/types";

interface MCPServersParams {
  category?: string;
  search?: string;
  official?: boolean;
  trending?: boolean;
  works_with?: string;
  authless?: boolean;
  skip?: number;
  limit?: number;
}

export function useMCPServers(params?: MCPServersParams) {
  return useQuery({
    queryKey: ["mcp-servers", params],
    queryFn: () => api.get<MCPServer[]>("/mcp-servers", params as Record<string, string | number | boolean | undefined>),
  });
}

export function useMCPServer(slug: string) {
  return useQuery({
    queryKey: ["mcp-servers", slug],
    queryFn: () => api.get<MCPServer>(`/mcp-servers/${slug}`),
    enabled: !!slug,
  });
}
