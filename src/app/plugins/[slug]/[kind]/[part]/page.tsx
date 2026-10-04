import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { BreadcrumbSchema, SoftwareApplicationSchema } from "@/components/seo/JsonLd";
import { fetchApi } from "@/lib/api-server";
import { pluginResolution } from "@/lib/plugin-install";
import type { Agent, Plugin, PluginPartDoc, PluginPartKind } from "@/types";
import { KIND_LABEL, MIN_INDEXABLE_BODY, standaloneTwin } from "@/lib/plugin-parts";
import { loadSkills } from "@/lib/server/skills";
import { reviewedAgents } from "@/data/resource-guides";
import PartDetail from "./PartDetail";

const SITE_URL = "https://www.claudeai.directory";

type Params = Promise<{ slug: string; kind: string; part: string }>;

const isKind = (k: string): k is PluginPartKind => k === "skills" || k === "agents" || k === "commands";

/** Standalone skills or agents listed on their own, to find the one that is this same file. */
async function standaloneFor(kind: PluginPartKind) {
  if (kind === "skills") return loadSkills().catch(() => []);
  if (kind === "agents") return [...((await fetchApi<{ data: Agent[] }>("/agents?limit=200"))?.data ?? []), ...reviewedAgents];
  return [];
}

async function load(params: Params) {
  const { slug, kind, part } = await params;
  if (!isKind(kind)) return null;
  const [doc, plugin, standalone] = await Promise.all([
    fetchApi<PluginPartDoc>(`/plugins/${encodeURIComponent(slug)}/${kind}/${encodeURIComponent(part)}`),
    fetchApi<Plugin>(`/plugins/${encodeURIComponent(slug)}`),
    standaloneFor(kind),
  ]);
  if (!doc || !plugin) return null;
  // The same file elsewhere (another plugin, or its own listing here) is the page to index.
  const twin = standaloneTwin(doc, standalone);
  const canonicalPath = doc.canonical || (twin ? `/${kind}/${twin.id}` : `/plugins/${plugin.id}/${kind}/${doc.slug}`);
  return { doc, plugin, kind, canonicalPath };
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const data = await load(params);
  if (!data) return { title: "Not Found" };
  const { doc, plugin, kind, canonicalPath } = data;
  const pluginName = plugin.title || plugin.name;
  const label = KIND_LABEL[kind].one;
  const url = `${SITE_URL}/plugins/${plugin.id}/${kind}/${doc.slug}`;
  // Part descriptions are written for the model ("Use when…"), so the title is built from the plugin instead.
  const pretty = doc.name.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const full = `${pretty}: ${pluginName} ${label} for Claude Code`;
  const title = full.length <= 60 ? full : `${pretty}: ${pluginName} ${label}`.slice(0, 60);
  const lead = `${pretty}, ${label === "Agent" ? "an" : "a"} ${label.toLowerCase()} in the ${pluginName} plugin for Claude Code.`;
  const description = `${lead} ${doc.description}`.trim().slice(0, 160);
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: `${SITE_URL}${canonicalPath}` },
    robots: (doc.body?.length ?? 0) < MIN_INDEXABLE_BODY ? { index: false, follow: true } : undefined,
    openGraph: { title, description, url, type: "website" },
    twitter: { card: "summary", title, description },
  };
}

export default async function PluginPartPage({ params }: { params: Params }) {
  const data = await load(params);
  if (!data) notFound();
  const { doc, plugin, kind } = data;
  const pluginName = plugin.title || plugin.name;
  const url = `${SITE_URL}/plugins/${plugin.id}/${kind}/${doc.slug}`;

  return (
    <div className="min-h-screen bg-background">
      <SoftwareApplicationSchema name={doc.name} description={doc.description} url={url} author={plugin.author?.name} category="DeveloperApplication" />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: SITE_URL },
          { name: "Plugins", url: `${SITE_URL}/plugins` },
          { name: pluginName, url: `${SITE_URL}/plugins/${plugin.id}` },
          { name: doc.name, url },
        ]}
      />
      <Header />
      <main>
        <PartDetail part={doc} kind={kind} plugin={plugin} resolution={pluginResolution(plugin)} />
      </main>
      <Footer />
    </div>
  );
}
