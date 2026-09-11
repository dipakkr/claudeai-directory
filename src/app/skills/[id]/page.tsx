import type { Metadata } from "next";
import { fetchApi } from "@/lib/api-server";
import { loadRegistryIndex } from "@/lib/server/registry";
import { resolvePluginInstall } from "@/lib/install";
import { skillSource } from "@/lib/resource-source";
import { resourceTitle } from "@/lib/seo";
import type { Skill } from "@/types";
import SkillDetailClient from "./SkillDetailClient";
import { SoftwareApplicationSchema, BreadcrumbSchema } from "@/components/seo/JsonLd";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.claudeai.directory";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const skill = await fetchApi<Skill>(`/skills/${id}`);

  if (!skill) {
    return { title: "Skill Not Found" };
  }

  const title = resourceTitle(skill.title || skill.name, skill.description);
  const description =
    skill.description?.slice(0, 160) || `${skill.title || skill.name} skill for Claude`;

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: `/skills/${id}` },
    openGraph: {
      title,
      description,
      url: `/skills/${id}`,
      type: "website",
    },
    twitter: {
      card: "summary",
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
  const [skill, registry] = await Promise.all([fetchApi<Skill>(`/skills/${id}`), loadRegistryIndex()]);
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
            name={skill.title || skill.name}
            description={skill.description}
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
      <SkillDetailClient skill={skill} id={id} resolution={resolution} />
    </>
  );
}
