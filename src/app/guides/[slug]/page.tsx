import type { Metadata } from "next";
import { fetchApi } from "@/lib/api-server";
import type { GuideDetail } from "@/types";
import GuideDetailPage from "./GuideRedirectClient";
import { BreadcrumbSchema } from "@/components/seo/JsonLd";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://claudeai.directory";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const guide = await fetchApi<GuideDetail>(`/guides/${slug}`);

  if (!guide) {
    return { title: "Guide Not Found" };
  }

  const title = guide.title;
  const description = guide.description?.slice(0, 160) || `Learn ${guide.title} with Claude`;

  return {
    title,
    description,
    alternates: { canonical: `/guides/${slug}` },
    openGraph: { title, description, url: `/guides/${slug}` },
  };
}

export default async function GuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = await fetchApi<GuideDetail>(`/guides/${slug}`);

  return (
    <>
      {guide && (
        <BreadcrumbSchema
          items={[
            { name: "Home", url: SITE_URL },
            { name: "Guides", url: `${SITE_URL}/guides` },
            { name: guide.title, url: `${SITE_URL}/guides/${slug}` },
          ]}
        />
      )}
      <GuideDetailPage />
    </>
  );
}
