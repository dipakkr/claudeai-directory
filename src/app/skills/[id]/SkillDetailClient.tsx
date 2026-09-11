"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import { Download } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ResourceReplies from "@/components/shared/ResourceReplies";
import { DetailHeader, DetailPage, IconTile, SectionLabel, StatPill, TagList } from "@/components/directory/detail";
import { InstallActions, InstallPanel } from "@/components/directory/InstallPanel";
import { useSkill } from "@/hooks/use-skills";
import { compactNumber } from "@/lib/directory";
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
        <DetailPage backHref="/skills" backLabel="Skills">
          {skill ? <SkillBody skill={skill} resolution={resolution} /> : <p className="text-sm text-muted-foreground">Skill not found.</p>}
        </DetailPage>
      </main>
      <Footer />
    </div>
  );
}

function SkillBody({ skill, resolution }: { skill: Skill; resolution: InstallResolution }) {
  const chips = [skill.source === "official" ? "official" : skill.source, skill.category, ...skill.tags].filter(
    (chip, i, all): chip is string => Boolean(chip) && all.indexOf(chip) === i,
  );

  return (
    <>
      <DetailHeader
        icon={<IconTile name={skill.title || skill.name} />}
        title={skill.title || skill.name}
        stats={
          skill.downloads > 0 ? (
            <StatPill icon={<Download className="h-3.5 w-3.5" />} title={`${skill.downloads.toLocaleString()} installs`}>
              {compactNumber(skill.downloads)}
            </StatPill>
          ) : undefined
        }
      />
      <p className="mt-2 font-mono text-[12px] uppercase tracking-wide text-muted-foreground">
        Skill{skill.source === "official" ? " · by Anthropic" : ""}
      </p>

      <p className="mt-5 text-[17px] leading-relaxed text-foreground/90">{skill.description}</p>

      <InstallActions
        resolution={resolution}
        kind="skill"
        resourceId={skill.id}
        name={skill.title || skill.name}
        href={`/skills/${skill.id}`}
      />

      {chips.length > 0 && (
        <div className="mt-8">
          <TagList tags={chips} />
        </div>
      )}

      <InstallPanel resolution={resolution} kind="skill" resourceId={skill.id} />

      {skill.triggers.length > 0 && (
        <>
          <SectionLabel>Triggers</SectionLabel>
          <TagList tags={skill.triggers} />
        </>
      )}

      {skill.content && (
        <>
          <SectionLabel>SKILL.md</SectionLabel>
          <div className="rounded-xl border border-border bg-card/40 p-6 sm:p-8">
            <article className="guide-prose">
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSlug]}>
                {skill.content}
              </ReactMarkdown>
            </article>
          </div>
        </>
      )}

      <div className="mt-14">
        <ResourceReplies resourceType="skill" resourceId={skill.id} />
      </div>
    </>
  );
}
