import { fetchApi } from "@/lib/api-server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { resourceGuides } from "@/data/resource-guides";
import { loadSkill, loadSkills } from "@/lib/server/skills";
import { loadRegistryIndex } from "@/lib/server/registry";
import { resolvePluginInstall } from "@/lib/install";
import { skillSource } from "@/lib/resource-source";
import { resourceTitle, DEFAULT_OG_IMAGE } from "@/lib/seo";
import SkillDetailClient from "./SkillDetailClient";
import PartPage, { partMetadata } from "@/components/directory/PartPage";
import { loadPluginPart } from "@/lib/server/plugin-parts";
import { SoftwareApplicationSchema, BreadcrumbSchema } from "@/components/seo/JsonLd";

const SITE_URL = "https://www.claudeai.directory";

export const revalidate = 300;

// Published skills ship as ready-to-serve HTML. New slugs can still render on
// demand, and ISR refreshes existing pages without blocking a reader.
export async function generateStaticParams() {
  const skills = await loadSkills();
  return skills.map(skill => ({ id: skill.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const skill = await loadSkill(id);

  if (!skill) {
    // Skills that ship inside a plugin live at the same short URL.
    const fromPlugin = await loadPluginPart("skills", id);
    return fromPlugin ? partMetadata(fromPlugin.part, fromPlugin.plugin, "skills") : { title: "Skill Not Found" };
  }

  const guide = resourceGuides[`skill/${id}`];
  const title = guide?.title || resourceTitle(skill.title || skill.name, skill.description);
  const description =
    guide?.metaDescription || skill.description?.slice(0, 160) || `${skill.title || skill.name} skill for Claude`;

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: `${SITE_URL}/skills/${id}` },
    openGraph: {
      images: [DEFAULT_OG_IMAGE],
      title,
      description,
      url: `${SITE_URL}/skills/${id}`,
      type: "website",
    },
    twitter: {
      images: [DEFAULT_OG_IMAGE.url],
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function SkillDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const skill = await loadSkill(id);
  if (!skill) {
    const fromPlugin = await loadPluginPart("skills", id);
    if (!fromPlugin) notFound();
    return <PartPage part={fromPlugin.part} plugin={fromPlugin.plugin} kind="skills" />;
  }
  const [registry, plugin] = await Promise.all([loadRegistryIndex(3000), fetchApi<{ id: string }>(`/plugins/${id}`)]);
  const source = skill ? skillSource(skill) : null;
  const resolution = resolvePluginInstall({
    match: source ? registry.get(source.repo, source.path) : null,
    sourceUrl: source?.url ?? skill?.github_url,
  });

  return (
    <>
      {skill && (
        <>
          <SoftwareApplicationSchema
            name={resourceGuides[`skill/${id}`]?.name || skill.title || skill.name}
            description={resourceGuides[`skill/${id}`]?.summary || skill.description}
            url={`${SITE_URL}/skills/${id}`}
            category="DeveloperApplication"
          />
          <BreadcrumbSchema
            items={[
              { name: "Home", url: SITE_URL },
              { name: "Skills", url: `${SITE_URL}/skills` },
              { name: skill.title || skill.name, url: `${SITE_URL}/skills/${id}` },
            ]}
          />
        </>
      )}
      <SkillDetailClient skill={skill} id={id} resolution={resolution} pluginHref={plugin ? `/plugins/${plugin.id}` : null} />
    </>
  );
}
