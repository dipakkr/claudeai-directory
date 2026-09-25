"use client";

import { AlsoPlugin } from "@/components/directory/AlsoPlugin";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ResourceReplies from "@/components/shared/ResourceReplies";
import { DetailSection, ResourceDetail, scrollToInstall } from "@/components/directory/ResourceDetail";
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
  pluginHref = null,
}: {
  skill: Skill | null;
  id: string;
  resolution: InstallResolution;
  /** Our page for a plugin with the same slug, when there is one. */
  pluginHref?: string | null;
}) {
  const { data: fetchedSkill } = useSkill(initialSkill ? "" : id);
  const skill = initialSkill ?? fetchedSkill ?? null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {skill ? (
          <SkillBody skill={skill} resolution={resolution} pluginHref={pluginHref} />
        ) : (
          <p className="mx-auto max-w-[1000px] px-4 pt-14 text-sm text-muted-foreground md:px-8">Skill not found.</p>
        )}
      </main>
      <Footer />
    </div>
  );
}

function SkillBody({ skill, resolution, pluginHref }: { skill: Skill; resolution: InstallResolution; pluginHref: string | null }) {
  const guide = resourceGuides[`skill/${skill.id}`];
  const name = guide?.name || skill.title || skill.name;
  const author = skill.github_url?.match(/github\.com\/([^/?#]+)/i)?.[1];
  const byline = author ? (author.toLowerCase() === "anthropics" ? "Anthropic" : author) : null;
  const chips = tidy([skill.category, ...skill.tags]).slice(0, 6);

  return (
    <ResourceDetail
      backHref="/skills"
      backLabel="Skills"
      icon={<CategoryGlyph category={skill.category || ""} type="skill" name={skill.title || skill.name} tags={skill.tags} className="h-6 w-6" />}
      name={name}
      verified={skill.verified || skill.source === "official"}
      tagline={guide?.summary || skill.description}
      action={
        <InstallActions
          resolution={resolution}
          kind="skill"
          resourceId={skill.id}
          name={skill.title || skill.name}
          href={`/skills/${skill.id}`}
          onInstall={scrollToInstall}
        />
      }
      facts={[
        { label: "Made by", value: byline, href: author ? `https://github.com/${author}` : undefined },
        { label: "Categories", chips },
        { label: "Downloads", value: skill.downloads > 0 ? compactNumber(skill.downloads) : null },
        { label: "Activates on", chips: skill.triggers.slice(0, 8) },
      ]}
      links={[{ label: "Repository", href: resolution.sourceUrl || skill.github_url }]}
    >
      {guide && <ResourceGuide guide={guide} />}

      {pluginHref && <AlsoPlugin href={pluginHref} name={name} lead="Prefer one install?" />}

      <DetailSection id="install" title="Install">
        <InstallPanel resolution={resolution} kind="skill" resourceId={skill.id} bare />
      </DetailSection>

      {skill.content && !guide && (
        <DetailSection title="SKILL.md">
          <div className="rounded-[11px] border border-border p-5 sm:p-6">
            <article className="guide-prose guide-prose-compact">
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSlug]}>
                {skill.content}
              </ReactMarkdown>
            </article>
          </div>
        </DetailSection>
      )}

      <DetailSection title="Discussion">
        <ResourceReplies resourceType="skill" resourceId={skill.id} />
      </DetailSection>
    </ResourceDetail>
  );
}

const tidy = (values: (string | undefined | null)[]) =>
  values
    .filter((c): c is string => Boolean(c))
    .map((c) => c.replace(/[-_]+/g, " ").trim())
    .map((c) => c.charAt(0).toUpperCase() + c.slice(1))
    .filter((c, i, all) => all.findIndex((x) => x.toLowerCase() === c.toLowerCase()) === i);
