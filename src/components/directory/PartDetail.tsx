"use client";

import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { repoUrlTransform } from "@/lib/markdown-links";
import remarkGfm from "remark-gfm";
import { Bot, Github, Package, Sparkles } from "lucide-react";
import { InstallActions, InstallPanel } from "@/components/directory/InstallPanel";
import { DetailSection, ResourceDetail, scrollToInstall } from "@/components/directory/ResourceDetail";
import { PluginPartList, plainText } from "@/components/directory/PluginPartList";
import { compactNumber, pluginIcon } from "@/lib/directory";
import type { InstallResolution } from "@/lib/install";
import { KIND_LABEL } from "@/lib/plugin-parts";
import type { Plugin, PluginPartDoc, PluginPartKind } from "@/types";

const ICONS = { skills: Sparkles, agents: Bot };
const MORE_SHOWN = 8;

const plural = (n: number, word: string) => `${n} ${n === 1 ? word.replace(/s$/, "") : word}`;

/** A skill or agent that ships inside a plugin, at /skills/{slug} or /agents/{slug}. */
export default function PartDetail({
  part,
  kind,
  plugin,
  resolution,
}: {
  part: PluginPartDoc;
  kind: PluginPartKind;
  plugin: Plugin;
  resolution: InstallResolution;
}) {
  const label = KIND_LABEL[kind];
  const Icon = ICONS[kind];
  const pluginName = plugin.title || plugin.name;
  const pluginHref = `/plugins/${plugin.id}`;
  const parts = plugin.components;
  const siblings = (parts?.[kind] ?? []).filter((p) => p.slug !== part.slug);

  // Everything else the plugin adds, so people see what comes with one install.
  const totals = plugin.contents;
  const others = (n: number | undefined, word: string, same: boolean) => {
    const count = (n ?? 0) - (same ? 1 : 0);
    return count > 0 ? plural(count, same ? `other ${word}` : word) : null;
  };
  const alsoAdds = [
    others(totals?.skills, "skills", kind === "skills"),
    others(totals?.agents, "agents", kind === "agents"),
    others(totals?.commands, "commands", false),
    parts?.mcp_servers.length ? plural(parts.mcp_servers.length, "MCP servers") : null,
    totals?.hooks ? "hooks" : null,
  ].filter((x): x is string => Boolean(x));

  return (
    <ResourceDetail
      backHref={`/${kind}`}
      backLabel={kind === "skills" ? "Skills" : "Agents"}
      icon={<Icon className="h-6 w-6" />}
      name={part.name}
      verified={plugin.official?.anthropic_verified}
      meta={
        <>
          <span>{label.one}</span>
          <span aria-hidden>·</span>
          <span>
            in the{" "}
            <Link href={pluginHref} className="text-foreground hover:text-primary">
              {pluginName}
            </Link>{" "}
            plugin
          </span>
          {plugin.author?.name && (
            <>
              <span aria-hidden>·</span>
              <span>by {plugin.author.name}</span>
            </>
          )}
        </>
      }
      action={
        <InstallActions resolution={resolution} kind="plugin" resourceId={plugin.id} name={pluginName} href={pluginHref} onInstall={scrollToInstall} />
      }
      tagline={part.description ? plainText(part.description) : null}
      facts={[
        { label: "Type", value: label.one },
        { label: "Plugin", value: pluginName, href: pluginHref },
        { label: "Also in", chips: (part.also_in ?? []).map((p) => p.title) },
        { label: "Made by", value: plugin.author?.name, href: plugin.author?.url || undefined },
        { label: "Anthropic verified", value: plugin.official?.anthropic_verified ? "Yes" : null },
        { label: "Plugin installs on Claude Marketplace", value: plugin.official?.installs ? compactNumber(plugin.official.installs) : null },
      ]}
      links={[
        { label: "View source file", href: part.url },
        { label: `${pluginName} on Claude Marketplace`, href: plugin.official?.url },
      ]}
    >
      <div className="flex gap-4 rounded-[12px] border border-border bg-[var(--cad-raised)] px-5 py-4">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-[10px] border border-border text-muted-foreground">
          {pluginIcon(plugin) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={pluginIcon(plugin)!} alt="" width={18} height={18} className="h-[18px] w-[18px] object-contain" />
          ) : (
            <Package className="h-4 w-4" />
          )}
        </span>
        <p className="text-[14px] leading-6 text-muted-foreground">
          {label.what} It comes with the{" "}
          <Link href={pluginHref} className="text-foreground underline underline-offset-[3px] hover:text-primary">
            {pluginName} plugin
          </Link>
          {alsoAdds.length > 0 ? <>, which also adds {alsoAdds.join(", ")}.</> : "."} Installing the plugin is how you get it.
          {(part.also_in ?? []).length > 0 && (
            <>
              {" "}Also comes in{" "}
              {part.also_in!.map((p, i) => (
                <span key={p.id}>
                  {i > 0 && ", "}
                  <Link href={`/plugins/${p.id}`} className="text-foreground underline underline-offset-[3px] hover:text-primary">
                    {p.title}
                  </Link>
                </span>
              ))}
              .
            </>
          )}
        </p>
      </div>

      <DetailSection id="install" title={`Install ${pluginName}`}>
        <InstallPanel resolution={resolution} kind="plugin" resourceId={plugin.id} bare />
      </DetailSection>

      {part.body && (
        <DetailSection title={label.body}>
          <div className="rounded-[11px] border border-border p-5 sm:p-6">
            <article className="guide-prose guide-prose-compact">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ h1: "h2" }} urlTransform={repoUrlTransform(part.url)}>
                {part.body}
              </ReactMarkdown>
            </article>
          </div>
          <a href={part.url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground">
            <Github className="h-3.5 w-3.5" />
            View the file on GitHub
          </a>
        </DetailSection>
      )}

      {siblings.length > 0 && (
        <DetailSection id="more" title={`More ${label.many} in ${pluginName}`}>
          <PluginPartList kind={kind} parts={siblings.slice(0, MORE_SHOWN)} total={Math.min(siblings.length, MORE_SHOWN)} icon={Icon} />
          <Link href={pluginHref} className="mt-3 inline-block text-[13.5px] text-[var(--cad-link)] underline underline-offset-[3px]">
            Everything in {pluginName}
          </Link>
        </DetailSection>
      )}
    </ResourceDetail>
  );
}
