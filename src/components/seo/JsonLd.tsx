export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://claudeai.directory";

export function OrganizationSchema() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "Claude Directory",
        url: SITE_URL,
        description:
          "The community directory for Claude AI — skills, MCP servers, prompts, and more.",
      }}
    />
  );
}

export function WebSiteSchema() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "Claude Directory",
        url: SITE_URL,
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${SITE_URL}/mcp?search={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      }}
    />
  );
}

export function CollectionPageSchema({
  name,
  description,
  url,
}: {
  name: string;
  description: string;
  url: string;
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name,
        description,
        url,
        isPartOf: { "@type": "WebSite", name: "Claude Directory", url: SITE_URL },
      }}
    />
  );
}

export function BreadcrumbSchema({
  items,
}: {
  items: { name: string; url: string }[];
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: item.name,
          item: item.url,
        })),
      }}
    />
  );
}

export function SoftwareApplicationSchema({
  name,
  description,
  url,
  author,
  category,
  ratingValue,
  ratingCount,
}: {
  name: string;
  description: string;
  url: string;
  author?: string;
  category?: string;
  ratingValue?: number;
  ratingCount?: number;
}) {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name,
    description,
    url,
    applicationCategory: category || "DeveloperApplication",
    operatingSystem: "Any",
  };
  if (author) data.author = { "@type": "Organization", name: author };
  if (ratingValue && ratingCount) {
    data.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue,
      ratingCount,
    };
  }
  // Required for SoftwareApplication
  data.offers = {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  };
  return <JsonLd data={data} />;
}

export function JobPostingSchema({
  title,
  description,
  company,
  location,
  salaryRange,
  datePosted,
  applyUrl,
}: {
  title: string;
  description: string;
  company: string;
  location?: string;
  salaryRange?: string;
  datePosted: string;
  applyUrl?: string;
}) {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title,
    description,
    datePosted,
    hiringOrganization: {
      "@type": "Organization",
      name: company,
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: location || "Remote",
      },
    },
  };
  if (salaryRange) data.baseSalary = salaryRange;
  if (applyUrl) data.url = applyUrl;
  // Valid for 60 days from posting
  const validDate = new Date(datePosted);
  validDate.setDate(validDate.getDate() + 60);
  data.validThrough = validDate.toISOString();
  return <JsonLd data={data} />;
}

export function ArticleSchema({
  title,
  description,
  url,
  datePublished,
  author,
}: {
  title: string;
  description: string;
  url: string;
  datePublished: string;
  author?: string;
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Article",
        headline: title,
        description,
        url,
        datePublished,
        author: { "@type": "Person", name: author || "Claude Directory" },
        publisher: { "@type": "Organization", name: "Claude Directory" },
      }}
    />
  );
}
