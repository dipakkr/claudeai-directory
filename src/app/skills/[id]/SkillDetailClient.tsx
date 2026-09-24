"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ResourceReplies from "@/components/shared/ResourceReplies";
import { Block, Chips, OverviewGrid, ResourceDetail, SideFacts, type DetailTab } from "@/components/directory/ResourceDetail";
import { compactNumber } from "@/lib/directory";
import { CategoryGlyph } from "@/components/directory/DiscoverListing";
import { InstallActions, InstallPanel } from "@/components/directory/InstallPanel";
import { useSkill } from "@/hooks/use-skills";
import { ResourceGuide } from "@/components/directory/ResourceGuide";
import { resourceGuides } from "@/data/resource-guides";
import type { InstallResolution } from "@/lib/install";
import type { Skill } from "@/types";

export default function SkillDetail({
  skill: initialSkill,
  id,
  resolution,
}: {
  skill: Skill | null;
  id: string;
  resolution: InstallResolution;
}) {
  const { data: fetchedSkill } = useSkill(initialSkill ? "" : id);
  const skill = initialSkill ?? fetchedSkill ?? null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {skill ? (
          <SkillBody skill={skill} resolution={resolution} />
        ) : (
          <p className="mx-auto max-w-[1000px] px-4 pt-14 text-sm text-muted-foreground md:px-8">Skill not found.</p>
        )}
      </main>
      <Footer />
    </div>
  );
}

function SkillBody({ skill, resolution }: { skill: Skill; resolution: InstallResolution }) {
  const guide = resourceGuides[`skill/${skill.id}`];
  const name = guide?.name || skill.title || skill.name;
  const author = skill.github_url?.match(/github\.com\/([^/?#]+)/i)?.[1];
  const byline = author ? (author.toLowerCase() === "anthropics" ? "Anthropic" : author) : null;
  const chips = [skill.category, ...skill.tags]
    .filter((c): c is string => Boolean(c))
    .map((c) => c.replace(/[-_]+/g, " ").trim())
    .map((c) => c.charAt(0).toUpperCase() + c.slice(1))
    .filter((c, i, all) => all.findIndex((x) => x.toLowerCase() === c.toLowerCase()) === i)
    .slice(0, 8);

  const overview = (
    <OverviewGrid
      aside={
        <SideFacts
          facts={[
            { label: "Author", value: byline },
            { label: "Source", value: skill.source === "official" ? "Official" : skill.source },
            { label: "Downloads", value: skill.downloads > 0 ? compactNumber(skill.downloads) : null },
          ]}
          links={[{ label: "Repository", href: resolution.sourceUrl || skill.github_url }]}
        />
      }
    >
      <Block label="Description">
        <p className="text-[15.5px] leading-relaxed text-foreground">{guide?.summary || skill.description}</p>
      </Block>
      {guide ? <ResourceGuide guide={guide} /> : null}
      {chips.length > 0 && (
        <Block label="Categories">
          <Chips items={chips} />
        </Block>
      )}
      {skill.triggers.length > 0 && (
        <Block label="Activates on">
          <Chips items={skill.triggers.slice(0, 10)} />
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
          <InstallPanel resolution={resolution} kind="skill" resourceId={skill.id} bare />
        </div>
      ),
    },
  ];
  if (skill.content && !guide) {
    tabs.push({
      id: "contents",
      label: "SKILL.md",
      content: (
        <article className="guide-prose max-w-[760px]">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSlug]}>
            {skill.content}
          </ReactMarkdown>
        </article>
      ),
    });
  }
  tabs.push({ id: "discussion", label: "Discussion", content: <ResourceReplies resourceType="skill" resourceId={skill.id} /> });

  return (
    <ResourceDetail
      backHref="/skills"
      backLabel="Skills"
      icon={<CategoryGlyph category={skill.category || ""} type="skill" className="h-6 w-6" />}
      name={name}
      meta={[byline && `by ${byline}`, skill.downloads > 0 && `${compactNumber(skill.downloads)} downloads`]}
      action={(openTab) => (
        <InstallActions
          resolution={resolution}
          kind="skill"
          resourceId={skill.id}
          name={skill.title || skill.name}
          href={`/skills/${skill.id}`}
          onInstall={() => openTab("install")}
        />
      )}
      tabs={tabs}
    />
  );
}
