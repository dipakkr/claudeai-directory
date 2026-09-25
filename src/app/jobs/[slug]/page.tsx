import type { Metadata } from "next";
import { fetchApi } from "@/lib/api-server";
import type { Job } from "@/types";
import JobDetailClient from "./JobDetailClient";
import { JobPostingSchema, BreadcrumbSchema } from "@/components/seo/JsonLd";
import { pageTitle, plainText } from "@/lib/seo";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.claudeai.directory";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const job = await fetchApi<Job>(`/jobs/${slug}`);

  if (!job) {
    return { title: "Job Not Found" };
  }

  const title = `${job.title} at ${job.company}`;
  const description =
    (job.description ? plainText(job.description).slice(0, 160) : "") || `${job.title} role at ${job.company}`;

  return {
    title: pageTitle(title),
    description,
    alternates: { canonical: `/jobs/${slug}` },
    openGraph: {
      title,
      description,
      url: `/jobs/${slug}`,
      type: "article",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const job = await fetchApi<Job>(`/jobs/${slug}`);

  return (
    <>
      {job && (
        <>
          <JobPostingSchema
            title={job.title}
            description={job.description}
            company={job.company}
            location={job.location}
            salaryRange={job.salary_range}
            datePosted={job.created_at}
            applyUrl={job.apply_url}
          />
          <BreadcrumbSchema
            items={[
              { name: "Home", url: SITE_URL },
              { name: "AI Jobs", url: `${SITE_URL}/jobs` },
              { name: job.title, url: `${SITE_URL}/jobs/${slug}` },
            ]}
          />
        </>
      )}
      <JobDetailClient job={job} slug={slug} />
    </>
  );
}
