import type { Metadata } from "next";
import { fetchApi } from "@/lib/api-server";
import type { MCPServer } from "@/types";
import MCPServerDetail from "./McpDetailClient";
import { SoftwareApplicationSchema, BreadcrumbSchema } from "@/components/seo/JsonLd";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://claudeai.directory";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const server = await fetchApi<MCPServer>(`/mcp-servers/${slug}`);

  if (!server) {
    return { title: "MCP Server Not Found" };
  }

  const title = `${server.name} MCP Server`;
  const description =
    server.one_liner || server.description?.slice(0, 160) || `${server.name} MCP server for Claude AI`;

  return {
    title,
    description,
    alternates: { canonical: `/mcp/${slug}` },
    openGraph: {
      title,
      description,
      url: `/mcp/${slug}`,
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default async function MCPDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const server = await fetchApi<MCPServer>(`/mcp-servers/${slug}`);

  return (
    <>
      {server && (
        <>
          <SoftwareApplicationSchema
            name={server.name}
            description={server.one_liner || server.description}
            url={`${SITE_URL}/mcp/${slug}`}
            author={typeof server.author === "object" ? server.author?.name : server.author}
            category="DeveloperApplication"
          />
          <BreadcrumbSchema
            items={[
              { name: "Home", url: SITE_URL },
              { name: "MCP Servers", url: `${SITE_URL}/mcp` },
              { name: server.name, url: `${SITE_URL}/mcp/${slug}` },
            ]}
          />
        </>
      )}
      <MCPServerDetail />
    </>
  );
}
