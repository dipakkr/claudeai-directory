"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { InstallActions, InstallPanel } from "@/components/directory/InstallPanel";
import { Block, Chips, OverviewGrid, ResourceDetail, SideFacts, type DetailTab } from "@/components/directory/ResourceDetail";
import { compactNumber } from "@/lib/directory";
import { CategoryGlyph } from "@/components/directory/DiscoverListing";
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
  const author = agent.author?.name;
  const chips = tidy([agent.category, ...(agent.tags ?? [])]).slice(0, 8);
  const tools = agent.tools ?? [];

  const overview = (
    <OverviewGrid
      aside={
        <SideFacts
          facts={[
            { label: "Author", value: author, href: agent.author?.url },
            { label: "Model", value: agent.model },
            { label: "License", value: agent.license },
            { label: "GitHub stars", value: agent.stars ? compactNumber(agent.stars) : null },
          ]}
          links={[{ label: "Repository", href: resolution.sourceUrl || agent.github_url }]}
        >
          {tools.length > 0 && (
            <div>
              <h2 className="mb-2.5 font-sans text-[13.5px] font-normal text-muted-foreground">Tools it can use</h2>
              <Chips items={tools} />
            </div>
          )}
        </SideFacts>
      }
    >
      <Block label="Description">
        <p className="text-[15.5px] leading-relaxed text-foreground">{guide?.summary || agent.description}</p>
      </Block>
      {guide && <ResourceGuide guide={guide} />}
      {chips.length > 0 && (
        <Block label="Categories">
          <Chips items={chips} />
        </Block>
      )}
    </OverviewGrid>
  );

  const tabs: DetailTab[] = [
    { id: "overview", label: "Overview", content: overview },
    {
      id: "install",
      label: "Install",
      content: (
        <div className="max-w-[720px]">
          <InstallPanel resolution={resolution} kind="agent" resourceId={agent.id} bare />
        </div>
      ),
    },
  ];
  if (agent.content && !guide) {
    tabs.push({
      id: "contents",
      label: "Definition",
      content: (
        <article className="guide-prose max-w-[760px]">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{agent.content}</ReactMarkdown>
        </article>
      ),
    });
  }

  return (
    <ResourceDetail
      backHref="/agents"
      backLabel="Agents"
      icon={<CategoryGlyph category={agent.category || ""} type="agent" className="h-6 w-6" />}
      name={name}
      meta={[author && `by ${author}`, agent.stars ? `${compactNumber(agent.stars)} GitHub stars` : null, agent.model]}
      action={(openTab) => (
        <InstallActions
          resolution={resolution}
          kind="agent"
          resourceId={agent.id}
          name={name}
          href={`/agents/${agent.id}`}
          onInstall={() => openTab("install")}
        />
      )}
      tabs={tabs}
    />
  );
}
