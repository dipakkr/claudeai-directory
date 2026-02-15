import type { Metadata } from "next";
import ResourceDetail from "./ResourceDetailClient";
import { BreadcrumbSchema } from "@/components/seo/JsonLd";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://claudeai.directory";

export const metadata: Metadata = {
  title: "Resource — Claude AI Tool",
  description: "Discover tools, templates, and utilities for working with Claude AI.",
  alternates: { canonical: "/resources" },
};

export default function ResourcePage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: SITE_URL },
          { name: "Resources", url: `${SITE_URL}/resources` },
        ]}
      />
      <ResourceDetail />
    </>
  );
}
