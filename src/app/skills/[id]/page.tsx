import type { Metadata } from "next";
import { fetchApi } from "@/lib/api-server";
import type { Skill } from "@/types";
import SkillDetailClient from "./SkillDetailClient";
import { SoftwareApplicationSchema, BreadcrumbSchema } from "@/components/seo/JsonLd";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://claudeai.directory";

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

  const title = `${skill.title || skill.name} Skill`;
  const description =
    skill.description?.slice(0, 160) || `${skill.title || skill.name} skill for Claude AI`;

  return {
    title,
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
  const skill = await fetchApi<Skill>(`/skills/${id}`);

  return (
    <>
      {skill && (
        <>
          <SoftwareApplicationSchema
            name={skill.title || skill.name}
            description={skill.description}
            url={`${SITE_URL}/skills/${id}`}
            category="DeveloperApplication"
            ratingValue={skill.rating || undefined}
            ratingCount={skill.review_count || undefined}
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
      <SkillDetailClient params={params} />
    </>
  );
}
