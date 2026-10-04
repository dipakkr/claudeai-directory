import ConnectorsClient from "./ConnectorsClient";
import { fetchApi } from "@/lib/api-server";
import type { MCPServer } from "@/types";
import { connectorGuides, liveGuides } from "@/data/connector-guides";
import { guideH1 } from "@/lib/connector-guides";

interface MCPServersListResponse {
  data: MCPServer[];
  isCache: boolean;
}

export default async function ConnectorsPage() {
  const response = await fetchApi<MCPServersListResponse>("/mcp-servers?limit=60");
  const guides = (process.env.NODE_ENV === "production" ? liveGuides() : connectorGuides).map((g) => ({
    slug: g.slug,
    app: g.app,
    title: guideH1(g),
    description: g.description,
  }));
  return <ConnectorsClient initialServers={response?.data ?? []} guides={guides} />;
}
