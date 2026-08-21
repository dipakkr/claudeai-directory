import ConnectorsClient from "./ConnectorsClient";
import { fetchApi } from "@/lib/api-server";
import type { MCPServer } from "@/types";

interface MCPServersListResponse {
  data: MCPServer[];
  isCache: boolean;
}

export default async function ConnectorsPage() {
  const response = await fetchApi<MCPServersListResponse>("/mcp-servers?limit=60");
  return <ConnectorsClient initialServers={response?.data ?? []} />;
}
