"use client";

import { useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { ExternalLink, Search, Wrench } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ResourceReplies from "@/components/shared/ResourceReplies";
import {
  CodeBlock,
  ConfigCard,
  CopyButton,
  DetailHeader,
  DetailPage,
  IconTile,
  SectionLabel,
  StatPill,
  TagList,
} from "@/components/directory/detail";
import { InstallActions, InstallPanel } from "@/components/directory/InstallPanel";
import { ResourceGuide } from "@/components/directory/ResourceGuide";
import { resourceGuides } from "@/data/resource-guides";
import type { InstallResolution } from "@/lib/install";
import { useMCPServer, useMCPServers } from "@/hooks/use-mcp-servers";
import { faviconFor } from "@/lib/directory";
import type { MCPServer } from "@/types";

/** Project-scoped config for teams, generated from the same validated fields as the command. */
function projectConfig(resolution: InstallResolution): string {
  if (resolution.method !== "mcp_http") return "";
  return JSON.stringify({ mcpServers: { [resolution.name]: { type: resolution.transport, url: resolution.url } } }, null, 2);
}

const toolTone = (name: string) => {
  if (/^(delete|remove|destroy|purge|drop)/.test(name)) return { label: "delete", cls: "text-destructive" };
  if (/^(create|add|insert|post|send|upload|generate|set|put|write|import|push|submit|publish)/.test(name))
    return { label: "write", cls: "text-success" };
  if (/^(update|edit|modify|patch|rename|move|merge|sync|toggle|enable|disable|assign|unassign)/.test(name))
    return { label: "update", cls: "text-amber-700 dark:text-amber-400" };
  if (/^(get|list|search|find|fetch|query|check|count|read|show|view|describe|lookup)/.test(name))
    return { label: "read", cls: "text-sky-700 dark:text-sky-400" };
  return { label: "action", cls: "text-muted-foreground" };
};

export default function MCPServerDetail({
  server: initialServer,
  slug,
  resolution,
}: {
  server: MCPServer | null;
  slug: string;
  resolution: InstallResolution;
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
    { label: "Category", value: server.category },
    { label: "Transport", value: server.connection?.transport },
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

  const chips = [
    server.official && !guide ? "Publisher listed as official" : "",
    server.connection?.is_authless ? "no auth" : "",
    server.capabilities?.has_mcp_app ? "mcp app" : "",
    ...worksWith.map((w) => w.replace("-", " ")),
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <DetailPage backHref="/mcp" backLabel="MCP servers">
          <DetailHeader
            icon={<IconTile src={faviconFor(server.branding?.icon_url)} name={server.name} />}
            title={server.name}
            stats={
              tools.length > 0 ? (
                <StatPill icon={<Wrench className="h-3.5 w-3.5" />} title={`${tools.length} tools`}>
                  {tools.length}
                </StatPill>
              ) : undefined
            }
          />

          <p className="mt-2 font-mono text-[12px] uppercase tracking-wide text-muted-foreground">
            MCP server{authorName ? ` · by ${authorName}` : ""}
          </p>
          {(guide?.summary || server.one_liner) && <p className="mt-5 text-[17px] leading-relaxed text-foreground/90">{guide?.summary || server.one_liner}</p>}
          {!guide && server.description && server.description !== server.one_liner && (
            <div className="prose prose-sm mt-3 max-w-none text-muted-foreground dark:prose-invert prose-p:text-muted-foreground prose-a:text-primary prose-strong:text-foreground prose-li:text-muted-foreground">
              <ReactMarkdown>
                {server.description.replace(/\s*•\s*/g, "\n- ").replace(/\*\*Note:\*\*/g, "\n\n**Note:**")}
              </ReactMarkdown>
            </div>
          )}

          <InstallActions resolution={resolution} kind="mcp" resourceId={slug} name={server.name} href={`/mcp/${slug}`} />

          {chips.length > 0 && (
            <div className="mt-8">
              <TagList tags={chips} />
            </div>
          )}

          {guide ? <ResourceGuide guide={guide} /> : null}

          <InstallPanel resolution={resolution} kind="mcp" resourceId={slug} />
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

          {tools.length > 0 && (
            <>
              <SectionLabel>{`${tools.length} tools`}</SectionLabel>
              <div className="overflow-hidden rounded-xl border border-border">
                {tools.length > 8 && (
                  <label className="relative block border-b border-border">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      value={toolSearch}
                      onChange={(e) => setToolSearch(e.target.value)}
                      placeholder="Filter tools…"
                      className="h-11 w-full bg-transparent pl-10 pr-4 text-sm text-foreground outline-none placeholder:text-muted-foreground"
                    />
                  </label>
                )}
                <ul className="max-h-[420px] overflow-y-auto">
                  {filteredTools.map((name) => {
                    const tone = toolTone(name);
                    return (
                      <li key={name} className="flex items-center gap-4 border-b border-border/60 px-4 py-2.5 last:border-b-0">
                        <span className={`w-14 shrink-0 font-mono text-[10.5px] uppercase ${tone.cls}`}>{tone.label}</span>
                        <code className="truncate font-mono text-[13px] text-foreground/90">{name}</code>
                      </li>
                    );
                  })}
                  {filteredTools.length === 0 && (
                    <li className="px-4 py-6 text-center text-sm text-muted-foreground">No tools match &ldquo;{toolSearch}&rdquo;</li>
                  )}
                </ul>
              </div>
            </>
          )}

          {!guide && server.html_content && (
            <>
              <SectionLabel>About</SectionLabel>
              <div
                className="prose prose-sm max-w-none text-muted-foreground dark:prose-invert [&_br]:mb-1 [&_p]:mb-3"
                dangerouslySetInnerHTML={{ __html: server.html_content }}
              />
            </>
          )}

          {images.length > 0 && (
            <>
              <SectionLabel>Examples</SectionLabel>
              <div className="grid gap-4 sm:grid-cols-2">
                {images.map((img, i) => (
                  <figure key={i}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.imageUrl} alt={img.prompt} className="w-full rounded-xl border border-border" />
                    <figcaption className="mt-2 text-xs italic text-muted-foreground">&ldquo;{img.prompt}&rdquo;</figcaption>
                  </figure>
                ))}
              </div>
            </>
          )}

          {!guide && (server.features?.length ?? 0) > 0 && !server.html_content && (
            <>
              <SectionLabel>Features</SectionLabel>
              <ul className="space-y-2">
                {server.features.map((feature, i) => (
                  <li key={i} className="flex gap-3 text-sm text-muted-foreground">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
            </>
          )}

          <SectionLabel>Details</SectionLabel>
          <dl className="grid grid-cols-1 overflow-hidden rounded-xl border border-border sm:grid-cols-2">
            {facts.map((fact) => (
              <div key={fact.label} className="flex items-center justify-between gap-4 border-b border-border/60 px-4 py-3 sm:[&:nth-last-child(-n+2)]:border-b-0">
                <dt className="text-sm text-muted-foreground">{fact.label}</dt>
                <dd className="truncate text-right text-sm text-foreground first-letter:uppercase">
                  {fact.href ? (
                    <a href={fact.href} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                      {fact.value}
                    </a>
                  ) : (
                    fact.value
                  )}
                </dd>
              </div>
            ))}
          </dl>

          {links.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {links.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-8 items-center gap-1.5 rounded-full border border-border px-3 text-[13px] text-muted-foreground transition-colors hover:border-[var(--cad-line-hover)] hover:text-foreground"
                >
                  {link.label}
                  <ExternalLink className="h-3 w-3" />
                </a>
              ))}
            </div>
          )}

          {(server.tags?.length ?? 0) > 0 && (
            <>
              <SectionLabel>Tags</SectionLabel>
              <TagList tags={server.tags} />
            </>
          )}

          {related.length > 0 && (
            <>
              <SectionLabel>{`More in ${server.category}`}</SectionLabel>
              <ul className="border-t border-border">
                {related.map((rel) => (
                  <li key={rel.id}>
                    <Link href={`/mcp/${rel.slug || rel.id}`} className="group flex items-center gap-3 border-b border-border/70 py-3">
                      <IconTile src={faviconFor(rel.branding?.icon_url)} name={rel.name} size={36} />
                      <span className="min-w-0">
                        <span className="block truncate text-[15px] text-foreground group-hover:text-primary">{rel.name}</span>
                        <span className="block truncate text-[13px] text-muted-foreground">{rel.one_liner || rel.description}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}

          <div className="mt-14">
            <ResourceReplies resourceType="mcp" resourceId={slug} />
          </div>
        </DetailPage>
      </main>
      <Footer />
    </div>
  );
}
