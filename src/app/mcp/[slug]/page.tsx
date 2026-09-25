import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { resourceGuides } from "@/data/resource-guides";
import { fetchApi } from "@/lib/api-server";
import type { MCPServer } from "@/types";
import MCPServerDetail from "./McpDetailClient";
import { resolveMcpInstall } from "@/lib/install";
import { resourceTitle } from "@/lib/seo";
import { SoftwareApplicationSchema, BreadcrumbSchema } from "@/components/seo/JsonLd";

const SITE_URL = "https://www.claudeai.directory";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const server = await fetchApi<MCPServer>(`/mcp-servers/${slug}`, { throwOnError: true });

  if (!server) {
    return { title: "MCP Server Not Found" };
  }

  const guide = resourceGuides[`mcp/${slug}`];
  const title = guide?.title || resourceTitle(server.name, server.one_liner || server.description);
  const description =
    guide?.metaDescription || server.one_liner || server.description?.slice(0, 160) || `${server.name} MCP server for Claude AI`;
  const ogImageUrl = `${SITE_URL}/mcp/${slug}/opengraph-image`;

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: `${SITE_URL}/mcp/${slug}` },
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
  const server = await fetchApi<MCPServer>(`/mcp-servers/${slug}`, { throwOnError: true });
  if (!server) notFound();
  // Same slug in Plugins = the same vendor's Claude Code plugin; link across.
  const plugin = await fetchApi<{ id: string }>(`/plugins/${server.slug || slug}`);
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
            description={resourceGuides[`mcp/${slug}`]?.summary || server.one_liner || server.description}
            url={`${SITE_URL}/mcp/${slug}`}
            author={resourceGuides[`mcp/${slug}`]?.publisher || (typeof server.author === "object" ? server.author?.name : server.author)}
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
      <MCPServerDetail server={server} slug={slug} resolution={resolution} pluginHref={plugin ? `/plugins/${plugin.id}` : null} />
    </>
  );
}
