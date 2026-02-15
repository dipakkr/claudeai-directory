"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ExternalLink,
  BookOpen,
  Copy,
  Wrench,
  Unlock,
  Globe,
  Shield as ShieldIcon,
  FileText,
  LifeBuoy,
  Lock,
  Plug,
  Terminal,
  Search,
} from "lucide-react";
import { useMCPServer, useMCPServers } from "@/hooks/use-mcp-servers";
import { toast } from "sonner";
import PageBreadcrumb from "@/components/layout/PageBreadcrumb";

function getFaviconUrl(iconUrl?: string): string | null {
  if (!iconUrl) return null;
  try {
    const hostname = new URL(iconUrl).hostname;
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;
  } catch {
    return null;
  }
}

function ServerIcon({ iconUrl, name, size = 48 }: { iconUrl?: string; name: string; size?: number }) {
  const [failed, setFailed] = useState(false);
  const favicon = getFaviconUrl(iconUrl);

  if (favicon && !failed) {
    return (
      <img
        src={favicon}
        alt={name}
        width={size}
        height={size}
        className="rounded-lg object-contain shrink-0"
        style={{ width: size, height: size }}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <div
      className="rounded-lg bg-primary/10 flex items-center justify-center text-primary font-semibold shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {name[0]?.toUpperCase()}
    </div>
  );
}

export default function MCPServerDetail() {
  const params = useParams();
  const id = (params?.slug ?? params?.id) as string | undefined;
  const { data: server, isLoading } = useMCPServer(id ?? "");
  const { data: relatedServers } = useMCPServers({
    category: server?.category || undefined,
    limit: 7,
  });
  const [toolSearch, setToolSearch] = useState("");

  const copyCommand = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const related = (relatedServers ?? []).filter((s) => s.slug !== server?.slug && s.id !== id).slice(0, 6);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1">
          <div className="border-b border-border">
            <div className="container py-4">
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="container py-8">
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-6">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-32 w-full" />
              </div>
              <div>
                <Skeleton className="h-48 w-full" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!server) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-medium text-foreground mb-2">
              Connector not found
            </h1>
            <Link href="/mcp">
              <Button variant="outline" size="sm">
                Back to MCP Connectors
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const authorName =
    typeof server.author === "object" ? server.author?.name : server.author;
  const authorUrl =
    typeof server.author === "object" ? server.author?.url : undefined;
  const tools = server.capabilities?.tools ?? [];
  const worksWithList = server.capabilities?.works_with ?? [];
  const connUrl = server.connection?.url ?? "";
  const claudeCmd = server.connection?.claude_code_command ?? server.install_command ?? "";
  const docsUrl = server.links?.documentation ?? server.documentation_url ?? "";
  const supportUrl = server.links?.support ?? "";
  const privacyUrl = server.links?.privacy_policy ?? "";
  const repoUrl = server.links?.repository ?? server.github_url ?? "";
  const directoryUrl = server.links?.directory_url ?? "";
  const permissions = server.capabilities?.permissions ?? "";
  const isAuthless = server.connection?.is_authless ?? false;
  const hasMcpApp = server.capabilities?.has_mcp_app ?? false;
  const version = server.version ?? "";
  const images = server.branding?.images ?? [];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container py-8">
          <PageBreadcrumb items={[
            { label: "MCP Connectors", href: "/mcp" },
            { label: server?.name || "..." },
          ]} />
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header */}
              <div>
                <div className="flex items-start gap-4 mb-4">
                  <ServerIcon iconUrl={server.branding?.icon_url} name={server.name} size={48} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      {server.category && (
                        <Badge variant="secondary" className="text-xs">
                          {server.category}
                        </Badge>
                      )}
                      {isAuthless && (
                        <Badge className="text-xs bg-emerald-400/10 text-emerald-400 border-0">
                          <Unlock className="mr-1 h-3 w-3" />
                          No auth required
                        </Badge>
                      )}
                      {hasMcpApp && (
                        <Badge className="text-xs bg-primary/10 text-primary border-0">
                          <Plug className="mr-1 h-3 w-3" />
                          MCP App
                        </Badge>
                      )}
                      {server.official && (
                        <Badge variant="outline" className="text-xs">
                          Official
                        </Badge>
                      )}
                    </div>
                    <h1 className="text-2xl md:text-3xl font-medium text-foreground mb-1">
                      {server.name}
                    </h1>
                    {server.one_liner && (
                      <p className="text-sm text-muted-foreground">
                        {server.one_liner}
                      </p>
                    )}
                  </div>
                </div>

                <p className="text-base text-muted-foreground leading-relaxed">
                  {server.description}
                </p>

                {/* Works with */}
                {worksWithList.length > 0 && (
                  <div className="flex items-center gap-2 mt-4">
                    <span className="text-xs text-muted-foreground">
                      Works with:
                    </span>
                    {worksWithList.map((w) => (
                      <Badge
                        key={w}
                        variant="outline"
                        className="text-[10px] capitalize"
                      >
                        {w.replace("-", " ")}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              {/* Connection / Installation */}
              {(claudeCmd || connUrl) && (
                <>
                  <div>
                    <h2 className="text-lg font-medium text-foreground mb-4">
                      Connection
                    </h2>

                    {claudeCmd && (
                      <Card className="mb-3">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-sm flex items-center gap-2">
                              <Terminal className="h-4 w-4" />
                              Claude Code
                            </CardTitle>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyCommand(claudeCmd)}
                              className="h-7 text-xs"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <code className="text-sm bg-muted px-3 py-2 rounded-md block font-mono break-all">
                            {claudeCmd}
                          </code>
                        </CardContent>
                      </Card>
                    )}

                    {connUrl && (
                      <Card>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-sm flex items-center gap-2">
                              <Globe className="h-4 w-4" />
                              Connector URL
                            </CardTitle>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyCommand(connUrl)}
                              className="h-7 text-xs"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <code className="text-sm bg-muted px-3 py-2 rounded-md block font-mono break-all">
                            {connUrl}
                          </code>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                  <Separator />
                </>
              )}

              {/* Tools */}
              {tools.length > 0 && (
                <>
                  <div>
                    <h2 className="text-lg font-medium text-foreground mb-4">
                      Tools{" "}
                      <span className="text-sm text-muted-foreground font-normal">
                        ({tools.length})
                      </span>
                    </h2>
                    {tools.length > 5 && (
                      <div className="relative mb-3">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <input
                          type="text"
                          placeholder="Filter tools..."
                          value={toolSearch}
                          onChange={(e) => setToolSearch(e.target.value)}
                          className="w-full pl-9 pr-3 py-1.5 text-xs rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                      </div>
                    )}
                    <div className="rounded-lg border border-border overflow-hidden">
                      {tools.filter((tool) => {
                        if (!toolSearch) return true;
                        const name = typeof tool === "string" ? tool : (tool as { name: string }).name;
                        return name.toLowerCase().includes(toolSearch.toLowerCase());
                      }).map((tool, i) => {
                        const name = typeof tool === "string" ? tool : (tool as { name: string }).name;
                        const isRead = /^(get|list|search|find|fetch|query|check|count|read|show|view|describe|lookup)/.test(name);
                        const isDelete = /^(delete|remove|destroy|purge|drop)/.test(name);
                        const isWrite = /^(create|add|insert|post|send|upload|generate|set|put|write|import|push|submit|publish)/.test(name);
                        const isUpdate = /^(update|edit|modify|patch|rename|move|merge|sync|toggle|enable|disable|assign|unassign)/.test(name);
                        const actionColor = isDelete
                          ? "text-red-400 bg-red-400/10"
                          : isWrite
                          ? "text-emerald-400 bg-emerald-400/10"
                          : isUpdate
                          ? "text-yellow-400 bg-yellow-400/10"
                          : isRead
                          ? "text-blue-400 bg-blue-400/10"
                          : "text-muted-foreground bg-muted/50";
                        const actionLabel = isDelete ? "DELETE" : isWrite ? "CREATE" : isUpdate ? "UPDATE" : isRead ? "READ" : "ACTION";

                        return (
                          <div
                            key={name}
                            className={`flex items-center gap-3 px-4 py-2.5 ${i > 0 ? "border-t border-border" : ""} hover:bg-muted/30 transition-colors`}
                          >
                            <span className={`text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded ${actionColor} shrink-0 w-14 text-center`}>
                              {actionLabel}
                            </span>
                            <code className="text-xs text-foreground/90 font-mono">
                              {name}
                            </code>
                          </div>
                        );
                      })}
                      {toolSearch && tools.every((t) => {
                        const n = typeof t === "string" ? t : (t as { name: string }).name;
                        return !n.toLowerCase().includes(toolSearch.toLowerCase());
                      }) && (
                        <div className="px-4 py-6 text-center text-xs text-muted-foreground">
                          No tools matching &ldquo;{toolSearch}&rdquo;
                        </div>
                      )}
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              {/* Rich HTML content */}
              {server.html_content && (
                <>
                  <div>
                    <h2 className="text-lg font-medium text-foreground mb-4">
                      About
                    </h2>
                    <div
                      className="prose prose-sm prose-invert max-w-none text-muted-foreground [&_p]:mb-3 [&_br]:mb-1"
                      dangerouslySetInnerHTML={{
                        __html: server.html_content,
                      }}
                    />
                  </div>
                  <Separator />
                </>
              )}

              {/* Promo images */}
              {images.length > 0 && (
                <div>
                  <h2 className="text-lg font-medium text-foreground mb-4">
                    Examples
                  </h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {images.map((img, i) => (
                      <div key={i} className="space-y-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img.imageUrl}
                          alt={img.prompt}
                          className="rounded-lg border border-border w-full"
                        />
                        <p className="text-xs text-muted-foreground italic">
                          &ldquo;{img.prompt}&rdquo;
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Legacy features (for old seed data) */}
              {(server.features?.length ?? 0) > 0 && !server.html_content && (
                <>
                  <div>
                    <h2 className="text-lg font-medium text-foreground mb-4">
                      Features
                    </h2>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {server.features.map((feature, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                          <span className="text-sm text-muted-foreground">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              {/* Related MCP Servers */}
              {related.length > 0 && (
                <div>
                  <h2 className="text-lg font-medium text-foreground mb-4">
                    Related in {server.category}
                  </h2>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {related.map((rel) => (
                      <Link
                        key={rel.id}
                        href={`/mcp/${rel.slug || rel.id}`}
                        className="group flex items-start gap-3 rounded-lg border border-border bg-card p-3 hover:bg-accent/50 hover:border-primary/20 transition-all"
                      >
                        <ServerIcon iconUrl={rel.branding?.icon_url} name={rel.name} size={32} />
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">
                            {rel.name}
                          </h3>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {rel.one_liner || rel.description}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Quick Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Developer
                    </p>
                    {authorUrl ? (
                      <a
                        href={authorUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
                      >
                        {authorName}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <p className="text-sm font-medium text-foreground">
                        {authorName || "Community"}
                      </p>
                    )}
                  </div>
                  {version && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Version
                      </p>
                      <p className="text-sm font-medium text-foreground">
                        {version}
                      </p>
                    </div>
                  )}
                  {permissions && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Permissions
                      </p>
                      <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
                        {permissions.toLowerCase().includes("write") ? (
                          <ShieldIcon className="h-3 w-3 text-amber-400" />
                        ) : (
                          <Lock className="h-3 w-3 text-emerald-400" />
                        )}
                        {permissions}
                      </p>
                    </div>
                  )}
                  {server.connection?.transport && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Transport
                      </p>
                      <p className="text-sm font-medium text-foreground">
                        {server.connection.transport}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Links */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {docsUrl && (
                    <a
                      href={docsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <BookOpen className="h-3.5 w-3.5" />
                      Documentation
                    </a>
                  )}
                  {supportUrl && (
                    <a
                      href={supportUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <LifeBuoy className="h-3.5 w-3.5" />
                      Support
                    </a>
                  )}
                  {privacyUrl && (
                    <a
                      href={privacyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      Privacy Policy
                    </a>
                  )}
                  {repoUrl && (
                    <a
                      href={repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Repository
                    </a>
                  )}
                  {directoryUrl && (
                    <a
                      href={directoryUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Globe className="h-3.5 w-3.5" />
                      Anthropic Directory
                    </a>
                  )}
                </CardContent>
              </Card>

              {/* Tags */}
              {(server.tags?.length ?? 0) > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Tags</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1.5">
                      {server.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="text-[10px]"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
