import type { Metadata } from "next";

import LaunchAnalyticsClient from "./LaunchAnalyticsClient";

export const metadata: Metadata = {
  title: "Launch analytics",
  robots: { index: false, follow: false },
};

export default async function LaunchAnalyticsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <LaunchAnalyticsClient slug={slug} />;
}
