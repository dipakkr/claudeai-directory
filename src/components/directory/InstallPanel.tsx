"use client";

import { useEffect } from "react";
import { ChevronDown, ExternalLink, KeyRound, Terminal } from "lucide-react";
import { CodeBlock, CopyButton, SectionLabel } from "@/components/directory/detail";
import FavoriteButton, { favoriteTargetType } from "@/components/shared/FavoriteButton";
import { track } from "@/lib/analytics";
import { recordRecent } from "@/lib/recent";
import type { InstallResolution, ResourceKind } from "@/lib/install";

const CTA_LABEL: Record<ResourceKind, string> = {
  skill: "Install Skill",
  mcp: "Add MCP",
  agent: "Install Agent",
};

function Step({ n, title, children }: { n?: number; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card/40 p-4">
      <p className="mb-2.5 flex items-center gap-2 text-sm text-foreground">
        {n !== undefined && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full border border-border font-mono text-[11px] text-muted-foreground">
            {n}
          </span>
        )}
        {title}
      </p>
      {children}
    </div>
  );
}

function CommandRow({
  command,
  event,
  surface,
  kind,
  resourceId,
}: {
  command: string;
  event: "install_command_copied" | "marketplace_command_copied" | "mcp_command_copied";
  /** Where the command runs, so we can see which install path people use. */
  surface?: "terminal" | "session";
  kind: ResourceKind;
  resourceId: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <div className="min-w-0 flex-1">
        {/* Wrapped so a long install line is readable before it is pasted. */}
        <CodeBlock wrap>{command}</CodeBlock>
      </div>
      <div className="pt-3">
        <CopyButton
          text={command}
          event={event}
          eventProps={{ resource_type: kind, resource_id: resourceId, ...(surface ? { surface } : {}) }}
        />
      </div>
    </div>
  );
}

function SourceLink({ href, kind, resourceId, label = "View source" }: { href: string; kind: ResourceKind; resourceId: string; label?: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => track("source_clicked", { resource_type: kind, resource_id: resourceId })}
      className="inline-flex h-10 items-center gap-1.5 rounded-full border border-border px-4 text-sm text-foreground transition-colors hover:border-[var(--cad-line-hover)]"
    >
      {label}
      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
    </a>
  );
}

/** Above-the-fold actions: the primary install CTA plus the source link. */
export function InstallActions({
  resolution,
  kind,
  resourceId,
  name,
  href,
  onInstall,
}: {
  resolution: InstallResolution;
  kind: ResourceKind;
  resourceId: string;
  name: string;
  href: string;
  /** Header variant: one quiet primary button that opens the Install tab, plus favorite. */
  onInstall?: () => void;
}) {
  useEffect(() => {
    track("resource_viewed", { resource_type: kind, resource_id: resourceId });
    recordRecent({ kind, id: resourceId, name, href });
  }, [kind, resourceId, name, href]);

  if (onInstall) {
    return (
      <>
        <FavoriteButton targetType={favoriteTargetType(kind)} targetId={resourceId} compact className="h-10 w-10 rounded-lg" />
        {resolution.verified ? (
          <button
            type="button"
            onClick={() => {
              track("install_clicked", { resource_type: kind, resource_id: resourceId });
              onInstall();
            }}
            className="inline-flex h-10 cursor-pointer items-center rounded-lg bg-primary px-4 text-[15px] font-medium text-white transition-colors hover:bg-[var(--cad-accent-hover)] dark:hover:bg-primary/90"
          >
            {CTA_LABEL[kind]}
          </button>
        ) : (
          <button
            type="button"
            onClick={onInstall}
            className="inline-flex h-10 cursor-pointer items-center rounded-lg bg-primary px-4 text-[15px] font-medium text-white transition-colors hover:bg-[var(--cad-accent-hover)] dark:hover:bg-primary/90"
          >
            How to install
          </button>
        )}
      </>
    );
  }

  return (
    <div className="mt-7 flex flex-wrap gap-2.5">
      {resolution.verified ? (
        <a
          href="#install"
          onClick={() => track("install_clicked", { resource_type: kind, resource_id: resourceId })}
          className="inline-flex h-10 items-center gap-2 rounded-full bg-foreground px-5 text-sm font-medium text-background transition-colors hover:bg-foreground/85"
        >
          <Terminal className="h-4 w-4" />
          {CTA_LABEL[kind]}
        </a>
      ) : (
        resolution.setupUrl && (
          <SourceLink href={resolution.setupUrl} kind={kind} resourceId={resourceId} label="View setup instructions" />
        )
      )}
      {resolution.sourceUrl && (resolution.verified || resolution.sourceUrl !== resolution.setupUrl) && (
        <SourceLink href={resolution.sourceUrl} kind={kind} resourceId={resourceId} />
      )}
      <FavoriteButton targetType={favoriteTargetType(kind)} targetId={resourceId} />
    </div>
  );
}

/** The install section. Commands appear only for verified resolutions. */
export function InstallPanel({
  resolution,
  kind,
  resourceId,
  bare = false,
}: {
  resolution: InstallResolution;
  kind: ResourceKind;
  resourceId: string;
  /** Inside the Install tab: no section label or anchor (the tab is the anchor). */
  bare?: boolean;
}) {
  return (
    <section id={bare ? undefined : "install"} className="scroll-mt-24">
      {!bare && <SectionLabel>Install</SectionLabel>}

      {resolution.method === "plugin_marketplace" && (
        <div className="space-y-3">
          <Step title="Run in your terminal">
            <CommandRow
              command={resolution.terminalCommand}
              event="install_command_copied"
              surface="terminal"
              kind={kind}
              resourceId={resourceId}
            />
            <p className="mt-2.5 text-[13px] leading-relaxed text-muted-foreground">
              Adds the {resolution.match.marketplaceName} marketplace if you don&apos;t have it yet, then installs. Start a
              new Claude Code session to use it.
            </p>
          </Step>
          <details className="group rounded-xl border border-border bg-card/40 p-4 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between text-sm text-foreground">
              Already in a Claude Code session?
              <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" />
            </summary>
            <div className="mt-3 space-y-3">
              <div>
                <p className="mb-1.5 text-[13px] text-muted-foreground">1. Add the marketplace (first time only)</p>
                <CommandRow
                  command={resolution.addMarketplaceCommand}
                  event="marketplace_command_copied"
                  surface="session"
                  kind={kind}
                  resourceId={resourceId}
                />
              </div>
              <div>
                <p className="mb-1.5 text-[13px] text-muted-foreground">2. Install</p>
                <CommandRow
                  command={resolution.installCommand}
                  event="install_command_copied"
                  surface="session"
                  kind={kind}
                  resourceId={resourceId}
                />
              </div>
            </div>
          </details>
          <p className="text-[13px] leading-relaxed text-muted-foreground">
            {resolution.match.bundledWith.length > 0 && (
              <>
                {" "}
                This installs the <span className="text-foreground">{resolution.match.pluginName}</span> plugin, which also
                includes: {resolution.match.bundledWith.join(", ")}.
              </>
            )}
            {!resolution.match.ours && (
              <> Published in the creator&apos;s own marketplace ({resolution.match.marketplaceSource}).</>
            )}
          </p>
        </div>
      )}

      {resolution.method === "mcp_http" && (
        <div className="space-y-3">
          <Step n={1} title="Add the server to Claude Code">
            <CommandRow command={resolution.command} event="mcp_command_copied" kind={kind} resourceId={resourceId} />
          </Step>
          {resolution.oauthRequired && (
            <Step n={2} title="Sign in">
              <p className="text-sm leading-relaxed text-muted-foreground">
                Run <code className="rounded bg-secondary px-1.5 py-0.5 font-mono text-[12.5px] text-foreground">/mcp</code> in
                Claude Code and complete the login flow for this server.
              </p>
            </Step>
          )}
          <p className="text-[13px] leading-relaxed text-muted-foreground">
            These instructions target Claude Code. Check the publisher&apos;s documentation for support in other Claude
            surfaces; a valid server URL alone does not establish compatibility.
          </p>
        </div>
      )}

      {resolution.method === "mcp_stdio" && (
        <div className="space-y-3">
          <Step n={1} title="Add the server to Claude Code">
            <CommandRow command={resolution.command} event="mcp_command_copied" kind={kind} resourceId={resourceId} />
          </Step>
          <p className="flex gap-2 text-[13px] leading-relaxed text-muted-foreground">
            <Terminal className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            This runs a local command on your machine. Review the source before adding it.
          </p>
          {resolution.envKeys.length > 0 && (
            <p className="flex gap-2 text-[13px] leading-relaxed text-muted-foreground">
              <KeyRound className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>
                Replace YOUR_VALUE with your own values for:{" "}
                {resolution.envKeys.map((key, i) => (
                  <span key={key}>
                    {i > 0 && ", "}
                    <code className="font-mono text-[12.5px] text-foreground">{key}</code>
                  </span>
                ))}
              </span>
            </p>
          )}
        </div>
      )}

      {resolution.method === "manual" && (
        <div className="rounded-xl border border-dashed border-border p-5">
          <p className="text-[15px] text-foreground">Direct install not available yet</p>
          <p className="mt-1.5 text-sm text-muted-foreground">{resolution.reason}</p>
          {resolution.setupUrl && (
            <div className="mt-4">
              <SourceLink href={resolution.setupUrl} kind={kind} resourceId={resourceId} label="View setup instructions" />
            </div>
          )}
        </div>
      )}
    </section>
  );
}
