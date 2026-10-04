import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { BreadcrumbSchema, SoftwareApplicationSchema } from "@/components/seo/JsonLd";
import PartDetail from "@/components/directory/PartDetail";
import { pluginResolution } from "@/lib/plugin-install";
import { KIND_LABEL, MIN_INDEXABLE_BODY } from "@/lib/plugin-parts";
import type { Plugin, PluginPartDoc, PluginPartKind } from "@/types";

const SITE_URL = "https://www.claudeai.directory";

/** Metadata for a plugin's skill or agent page. Its own description is written for the model ("Use when…"), so the title comes from the plugin. */
export function partMetadata(part: PluginPartDoc, plugin: Plugin, kind: PluginPartKind): Metadata {
  const pluginName = plugin.title || plugin.name;
  const label = KIND_LABEL[kind].one;
  const url = `${SITE_URL}/${kind}/${part.slug}`;
  const pretty = part.name.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const full = `${pretty}: ${pluginName} ${label} for Claude Code`;
  const title = full.length <= 60 ? full : `${pretty}: ${pluginName} ${label}`.slice(0, 60);
  const lead = `${pretty}, ${label === "Agent" ? "an" : "a"} ${label.toLowerCase()} in the ${pluginName} plugin for Claude Code.`;
  const description = `${lead} ${part.description}`.trim().slice(0, 160);
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    robots: (part.body?.length ?? 0) < MIN_INDEXABLE_BODY ? { index: false, follow: true } : undefined,
    openGraph: { title, description, url, type: "website" },
    twitter: { card: "summary", title, description },
  };
}

/** /skills/{slug} or /agents/{slug} for a skill or agent that ships inside a plugin. */
export default function PartPage({ part, plugin, kind }: { part: PluginPartDoc; plugin: Plugin; kind: PluginPartKind }) {
  const url = `${SITE_URL}/${kind}/${part.slug}`;
  return (
    <div className="min-h-screen bg-background">
      <SoftwareApplicationSchema name={part.name} description={part.description} url={url} author={plugin.author?.name} category="DeveloperApplication" />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: SITE_URL },
          { name: kind === "skills" ? "Skills" : "Agents", url: `${SITE_URL}/${kind}` },
          { name: part.name, url },
        ]}
      />
      <Header />
      <main>
        <PartDetail part={part} kind={kind} plugin={plugin} resolution={pluginResolution(plugin)} />
      </main>
      <Footer />
    </div>
  );
}
