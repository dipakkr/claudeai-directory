"use client";

import { useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { Search } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ResourceReplies from "@/components/shared/ResourceReplies";
import { CodeBlock, ConfigCard, CopyButton } from "@/components/directory/detail";
import { DetailSection, ResourceDetail, ToolChips, scrollToInstall } from "@/components/directory/ResourceDetail";
import { InstallActions, InstallPanel } from "@/components/directory/InstallPanel";
import { ResourceGuide } from "@/components/directory/ResourceGuide";
import { resourceGuides } from "@/data/resource-guides";
import type { InstallResolution } from "@/lib/install";
import { useMCPServer, useMCPServers } from "@/hooks/use-mcp-servers";
import { faviconFor, mcpToItem } from "@/lib/directory";
import type { MCPServer } from "@/types";

/** Project-scoped config for teams, generated from the same validated fields as the command. */
function projectConfig(resolution: InstallResolution): string {
  if (resolution.method !== "mcp_http") return "";
  return JSON.stringify({ mcpServers: { [resolution.name]: { type: resolution.transport, url: resolution.url } } }, null, 2);
}

export default function MCPServerDetail({
  server: initialServer,
  slug,
  resolution,
  pluginHref = null,
}: {
  server: MCPServer | null;
  slug: string;
  resolution: InstallResolution;
  /** Our page for the same vendor's Claude Code plugin, when there is one. */
  pluginHref?: string | null;
}) {
  const { data: fetchedServer } = useMCPServer(initialServer ? "" : slug);
  const server = initialServer ?? fetchedServer ?? null;
  const { data: relatedServers } = useMCPServers({ category: server?.category || undefined, limit: 7 });
  const [toolSearch, setToolSearch] = useState("");

  if (!server) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex flex-1 items-center justify-center px-4">
          <div className="text-center">
            <h1 className="mb-4 text-3xl text-foreground">MCP server not found</h1>
            <Link href="/mcp" className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground">
              Back to MCP servers
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const guide = resourceGuides[`mcp/${slug}`];
  const authorName = guide?.publisher || (typeof server.author === "object" ? server.author?.name : server.author);
  const authorUrl = typeof server.author === "object" ? server.author?.url : undefined;
  const tools = (server.capabilities?.tools ?? []).map((t) => (typeof t === "string" ? t : (t as { name: string }).name));
  const filteredTools = toolSearch ? tools.filter((t) => t.toLowerCase().includes(toolSearch.toLowerCase())) : tools;
  const worksWith = server.capabilities?.works_with ?? [];
  const jsonConfig = projectConfig(resolution);
  const images = server.branding?.images ?? [];
  const related = (relatedServers ?? []).filter((s) => s.slug !== server.slug && s.id !== server.id).slice(0, 6);

  const facts = [
    { label: "Developer", value: authorName || "Community", href: authorUrl },
    {
      label: "Transport",
      value: server.connection?.transport
        ? ({ "streamable-http": "Streamable HTTP", http: "HTTP", sse: "SSE", stdio: "Local (stdio)" } as Record<string, string>)[server.connection.transport] ??
          server.connection.transport
        : undefined,
    },
    { label: "Auth", value: server.connection ? (server.connection.is_authless ? "None required" : "Sign-in required") : "" },
    { label: "Permissions", value: server.capabilities?.permissions },
    { label: "Version", value: server.version },
  ].filter((f) => f.value);

  const links = [
    { label: "Documentation", href: server.links?.documentation ?? server.documentation_url },
    { label: "Repository", href: server.links?.repository ?? server.github_url },
    { label: "Support", href: server.links?.support },
    { label: "Privacy policy", href: server.links?.privacy_policy },
    { label: "Anthropic directory", href: server.links?.directory_url },
  ].filter((l): l is { label: string; href: string } => Boolean(l.href));

  const categoryChips = [server.category, ...(server.tags ?? []), ...worksWith.map((w) => w.replace("-", " "))]
    .filter((c): c is string => Boolean(c))
    .map((c) => c.replace(/[-_]+/g, " ").trim())
    .map((c) => c.charAt(0).toUpperCase() + c.slice(1))
    .filter((c, i, all) => all.findIndex((x) => x.toLowerCase() === c.toLowerCase()) === i)
    .slice(0, 8);
  const summary = guide?.summary || server.one_liner;
  const relatedItems = related.map(mcpToItem);
  const serverUrl = resolution.method === "mcp_http" ? resolution.url : server.connection?.url;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <ResourceDetail
          backHref="/mcp"
          backLabel="MCP servers"
          iconSrc={faviconFor(server.branding?.icon_url)}
          name={server.name}
          verified={server.official}
          tagline={summary}
          action={
            <InstallActions resolution={resolution} kind="mcp" resourceId={slug} name={server.name} href={`/mcp/${slug}`} onInstall={scrollToInstall} />
          }
          facts={[
            { label: "Made by", value: authorName || "Community", href: authorUrl },
            { label: "Categories", chips: categoryChips },
            {
              label: "Sign-in",
              value: server.connection ? (server.connection.is_authless ? "Not required" : "Required") : null,
            },
            ...facts.filter((f) => f.label === "Transport" || f.label === "Permissions" || f.label === "Version"),
            { label: "Server URL", value: serverUrl, mono: true },
          ]}
          links={[
            ...links,
            ...(resolution.sourceUrl && !links.some((l) => l.href === resolution.sourceUrl) ? [{ label: "Source", href: resolution.sourceUrl }] : []),
          ]}
          related={relatedItems}
          relatedTitle="Related MCP servers"
        >
          <div>
            {!guide && server.description && server.description !== server.one_liner ? (
              <div className="prose prose-sm max-w-none text-[14px] leading-[1.65] text-foreground dark:prose-invert prose-p:text-foreground prose-a:text-[var(--cad-link)] prose-strong:text-foreground prose-li:text-foreground">
                <ReactMarkdown>
                  {server.description.replace(/\s*•\s*/g, "\n- ").replace(/\*\*Note:\*\*/g, "\n\n**Note:**")}
                </ReactMarkdown>
              </div>
            ) : null}
            {guide ? <ResourceGuide guide={guide} /> : null}
          </div>

          {pluginHref && (
            <p className="text-[13.5px] text-[var(--cad-desc)]">
              Want skills and commands too?{" "}
              <Link href={pluginHref} className="text-[var(--cad-link)] underline underline-offset-[3px]">
                {server.name} is also available as a Claude Code plugin
              </Link>
              .
            </p>
          )}

          <DetailSection id="install" title="Install">
            <InstallPanel resolution={resolution} kind="mcp" resourceId={slug} bare />
            {jsonConfig && (
              <div className="mt-3">
                <ConfigCard
                  badge="JSON"
                  title=".mcp.json for a shared project"
                  note="Commit this file so everyone on the project gets the same server."
                  actions={<CopyButton text={jsonConfig} event="mcp_command_copied" eventProps={{ resource_type: "mcp", resource_id: slug }} />}
                >
                  <CodeBlock>{jsonConfig}</CodeBlock>
                </ConfigCard>
              </div>
            )}
          </DetailSection>

          {tools.length > 0 && (
            <DetailSection title="Tools">
              {tools.length > 12 && (
                <label className="relative mb-4 block max-w-[320px]">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={toolSearch}
                    onChange={(e) => setToolSearch(e.target.value)}
                    placeholder={`Filter ${tools.length} tools…`}
                    className="h-9 w-full rounded-lg border border-border bg-transparent pl-9 pr-3 text-[14px] text-foreground outline-none placeholder:text-muted-foreground focus:border-[var(--cad-line-hover)]"
                  />
                </label>
              )}
              <ToolChips tools={filteredTools} />
              {filteredTools.length === 0 && <p className="text-sm text-muted-foreground">No tools match &ldquo;{toolSearch}&rdquo;</p>}
            </DetailSection>
          )}

          {!guide && server.html_content && (
            <DetailSection title="About">
              <div
                className="prose prose-sm max-w-none text-muted-foreground dark:prose-invert [&_br]:mb-1 [&_p]:mb-3"
                dangerouslySetInnerHTML={{ __html: server.html_content }}
              />
            </DetailSection>
          )}

          {!guide && (server.features?.length ?? 0) > 0 && !server.html_content && (
            <DetailSection title="Features">
              <ul className="space-y-2">
                {server.features.map((feature, i) => (
                  <li key={i} className="flex gap-3 text-[15px] text-foreground/90">
                    <span className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground" />
                    {feature}
                  </li>
                ))}
              </ul>
            </DetailSection>
          )}

          {images.length > 0 && (
            <DetailSection title="Examples">
              <div className="grid gap-4 sm:grid-cols-2">
                {images.map((img, i) => (
                  <figure key={i}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.imageUrl} alt={img.prompt} className="w-full rounded-xl border border-border" />
                    <figcaption className="mt-2 text-[13px] text-muted-foreground">&ldquo;{img.prompt}&rdquo;</figcaption>
                  </figure>
                ))}
              </div>
            </DetailSection>
          )}

          <DetailSection title="Discussion">
            <ResourceReplies resourceType="mcp" resourceId={slug} />
          </DetailSection>
        </ResourceDetail>
      </main>
      <Footer />
    </div>
  );
}
