import type { Metadata } from "next";

import { fetchApi } from "@/lib/api-server";
import type { LaunchReach } from "./SubmitLaunchClient";
import { rankedLaunches } from "@/lib/home-community";
import type { ShowcaseProject } from "@/types";
import SubmitLaunchClient from "./SubmitLaunchClient";
import { LaunchGuide } from "./LaunchGuide";

const TITLE = "Launch Your AI App or MCP Server for Free";
const DESCRIPTION =
  "Submit the app, MCP server, skill or agent you built with Claude. Get a launch page, upvotes, a community feed post and a dofollow backlink. Live in about a minute.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/launches/submit" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/launches/submit" },
  twitter: { title: TITLE, description: DESCRIPTION },
};

export default async function SubmitLaunchPage({ searchParams }: { searchParams: Promise<{ finish?: string; listing?: string; launch?: string }> }) {
  // ?finish=<slug>: open straight on the "go live" step for a saved launch (from the dashboard).
  const { finish, listing, launch } = await searchParams;
  const [all, reach] = await Promise.all([
    fetchApi<ShowcaseProject[]>("/showcase?limit=100", { revalidate: 600 }),
    fetchApi<LaunchReach>("/showcase/launch-reach", { revalidate: 3600 }),
  ]);
  const launches = rankedLaunches(all ?? []);
  const recent = [...launches].sort((a, b) => Date.parse(b.listed_at || b.created_at) - Date.parse(a.listed_at || a.created_at)).slice(0, 5);
  return <SubmitLaunchClient finishSlug={finish} reach={reach} paidSlug={listing === "paid" ? launch : undefined} guide={<LaunchGuide recent={recent} liveCount={launches.length} />} />;
}
