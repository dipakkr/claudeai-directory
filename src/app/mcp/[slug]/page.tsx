import type { Metadata } from "next";
import { fetchApi } from "@/lib/api-server";
import type { MCPServer } from "@/types";
import MCPServerDetail from "./McpDetailClient";
import { resolveMcpInstall } from "@/lib/install";
import { resourceTitle } from "@/lib/seo";
import { SoftwareApplicationSchema, BreadcrumbSchema } from "@/components/seo/JsonLd";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.claudeai.directory";

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

  const title = resourceTitle(server.name, server.one_liner || server.description);
  const description =
    server.one_liner || server.description?.slice(0, 160) || `${server.name} MCP server for Claude AI`;
  const ogImageUrl = `${SITE_URL}/mcp/${slug}/opengraph-image`;

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: `/mcp/${slug}` },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/mcp/${slug}`,
      type: "website",
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: server.name }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
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
  const resolution = resolveMcpInstall({
    install: server?.install,
    slug: server?.slug || slug,
    connectionUrl: server?.connection?.url,
    transport: server?.connection?.transport,
    isAuthless: server?.connection?.is_authless,
    setupUrl: server?.links?.documentation || server?.documentation_url,
    sourceUrl: server?.links?.repository || server?.github_url,
  });

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
      <MCPServerDetail server={server} slug={slug} resolution={resolution} />
    </>
  );
}
