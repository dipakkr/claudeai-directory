"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { InstallActions, InstallPanel } from "@/components/directory/InstallPanel";
import { DetailSection, ResourceDetail, scrollToInstall } from "@/components/directory/ResourceDetail";
import { CategoryGlyph } from "@/components/directory/DiscoverListing";
import { compactNumber } from "@/lib/directory";
import type { InstallResolution } from "@/lib/install";
import type { Agent } from "@/types";
import { ResourceGuide } from "@/components/directory/ResourceGuide";
import { resourceGuides } from "@/data/resource-guides";

const tidy = (values: (string | undefined | null)[]) =>
  values
    .filter((c): c is string => Boolean(c))
    .map((c) => c.replace(/[-_]+/g, " ").trim())
    .map((c) => c.charAt(0).toUpperCase() + c.slice(1))
    .filter((c, i, all) => all.findIndex((x) => x.toLowerCase() === c.toLowerCase()) === i);

export default function AgentDetail({ agent, resolution }: { agent: Agent; resolution: InstallResolution }) {
  const name = agent.title || agent.name;
  const guide = resourceGuides[`agent/${agent.id}`];

  return (
    <ResourceDetail
      backHref="/agents"
      backLabel="Agents"
      icon={<CategoryGlyph category={agent.category || ""} type="agent" name={name} tags={agent.tags} className="h-6 w-6" />}
      name={name}
      tagline={guide?.summary || agent.description}
      action={
        <InstallActions resolution={resolution} kind="agent" resourceId={agent.id} name={name} href={`/agents/${agent.id}`} onInstall={scrollToInstall} />
      }
      facts={[
        { label: "Made by", value: agent.author?.name, href: agent.author?.url },
        { label: "Categories", chips: tidy([agent.category, ...(agent.tags ?? [])]).slice(0, 6) },
        { label: "Model", value: agent.model },
        { label: "License", value: agent.license },
        { label: "GitHub stars", value: agent.stars ? compactNumber(agent.stars) : null },
        { label: "Tools it can use", chips: agent.tools ?? [] },
      ]}
      links={[{ label: "Repository", href: resolution.sourceUrl || agent.github_url }]}
    >
      {guide && <ResourceGuide guide={guide} />}

      <DetailSection id="install" title="Install">
        <InstallPanel resolution={resolution} kind="agent" resourceId={agent.id} bare />
      </DetailSection>

      {agent.content && !guide && (
        <DetailSection title="Definition">
          <div className="rounded-[11px] border border-border p-5 sm:p-6">
            <article className="guide-prose guide-prose-compact">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{agent.content}</ReactMarkdown>
            </article>
          </div>
        </DetailSection>
      )}
    </ResourceDetail>
  );
}
