"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Star } from "lucide-react";
import { DetailHeader, DetailPage, IconTile, SectionLabel, StatPill, TagList } from "@/components/directory/detail";
import { InstallActions, InstallPanel } from "@/components/directory/InstallPanel";
import { compactNumber } from "@/lib/directory";
import type { InstallResolution } from "@/lib/install";
import type { Agent } from "@/types";

export default function AgentDetail({ agent, resolution }: { agent: Agent; resolution: InstallResolution }) {
  const name = agent.title || agent.name;
  const chips = [agent.category, agent.license, agent.model ? `model: ${agent.model}` : "", ...(agent.tags ?? [])].filter(
    (chip, i, all): chip is string => Boolean(chip) && all.indexOf(chip) === i,
  );

  return (
    <DetailPage backHref="/agents" backLabel="Agents">
      <DetailHeader
        icon={<IconTile name={name} />}
        title={name}
        stats={
          agent.stars ? (
            <StatPill icon={<Star className="h-3.5 w-3.5" />} title={`${agent.stars.toLocaleString()} GitHub stars on the source repo`}>
              {compactNumber(agent.stars)}
            </StatPill>
          ) : undefined
        }
      />
      <p className="mt-2 font-mono text-[12px] uppercase tracking-wide text-muted-foreground">
        Agent{agent.author?.name ? ` · by ${agent.author.name}` : ""}
      </p>

      <p className="mt-5 text-[17px] leading-relaxed text-foreground/90">{agent.description}</p>

      <InstallActions resolution={resolution} kind="agent" resourceId={agent.id} name={name} href={`/agents/${agent.id}`} />

      {chips.length > 0 && (
        <div className="mt-8">
          <TagList tags={chips} />
        </div>
      )}

      <InstallPanel resolution={resolution} kind="agent" resourceId={agent.id} />

      {(agent.tools?.length ?? 0) > 0 && (
        <>
          <SectionLabel>Tools it can use</SectionLabel>
          <TagList tags={agent.tools ?? []} />
        </>
      )}

      {agent.content && (
        <>
          <SectionLabel>Agent definition</SectionLabel>
          <div className="rounded-xl border border-border bg-card/40 p-6 sm:p-8">
            <article className="guide-prose">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{agent.content}</ReactMarkdown>
            </article>
          </div>
        </>
      )}
    </DetailPage>
  );
}
