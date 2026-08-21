"use client";

import { useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { CheckCircle } from "lucide-react";
import { useSkills } from "@/hooks/use-skills";
import { CollectionPageSchema } from "@/components/seo/JsonLd";
import type { Skill } from "@/types";

const categories = [
  { label: "All", value: "All" },
  { label: "Productivity", value: "productivity" },
  { label: "Design", value: "design" },
  { label: "Code", value: "code" },
  { label: "Media", value: "media" },
];

export default function SkillsClient({
  initialData,
}: {
  initialData: Skill[];
  initialParams: { category?: string; search?: string };
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const search = searchParams.get("search") ?? "";
  const category = searchParams.get("category") ?? "All";

  const { data: skills } = useSkills(
    {
      search: search || undefined,
      category: category === "All" ? undefined : category,
    },
    { initialData }
  );



  const setCategory = useCallback((value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "All") {
      params.set("category", value);
    } else {
      params.delete("category");
    }

    router.push(`/skills?${params.toString()}`);
  }, [router, searchParams]);

  return (
    <div className="cad-shell flex flex-col">
      <CollectionPageSchema
        name="Claude Skills"
        description="Browse and install Claude skills shared by the community."
        url="https://www.claudeai.directory/skills"
      />
      <Header />
      <main className="flex-1">
        <div className="mx-auto flex max-w-[1180px] flex-col gap-3 px-8 pb-[34px] pt-[60px]">
          <h1 className="text-[clamp(32px,4vw,42px)] font-medium leading-[1.08]">Claude Skills</h1>
          <p className="max-w-[62ch] text-base leading-[1.6] text-muted-foreground">
              Browse Claude skills and capabilities shared by the community
            </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c.value}
                onClick={() => setCategory(c.value)}
                className={`cad-chip whitespace-nowrap px-3.5 text-[13px] ${category === c.value
                  ? "cad-chip-active"
                  : "bg-card hover:border-primary hover:text-primary"
                  }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mx-auto max-w-[1180px] px-8 pb-[88px]">
          <>
            <p className="mb-4 text-xs text-muted-foreground">
              {skills?.length ?? 0} skills found
            </p>
            <div className="grid gap-3.5 [grid-template-columns:repeat(auto-fit,minmax(340px,1fr))]">
              {(skills ?? []).map((skill) => (
                <Link
                  key={skill.id}
                  href={`/skills/${skill.id}`}
                  className="group flex items-center gap-3.5 rounded-[9px] border border-border bg-card p-4 hover:border-[var(--cad-line-hover)]"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[var(--cad-chip)] text-sm font-medium text-[var(--cad-accent-hover)]">
                    {(skill.title || skill.name)[0]?.toUpperCase()}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex min-w-0 items-center gap-[7px]">
                      <div className="truncate text-[15px] font-semibold">{skill.title || skill.name}</div>
                      {skill.verified && (
                        <div className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-[var(--cad-chip)] text-[9px] text-[var(--cad-faint)]">
                          <CheckCircle className="h-3 w-3" />
                        </div>
                      )}
                      <div className="shrink-0 whitespace-nowrap rounded-md bg-[var(--cad-accent-soft)] px-[7px] py-0.5 text-[10.5px] uppercase tracking-[0.06em] text-[var(--cad-accent-hover)]">
                        {skill.category}
                      </div>
                    </div>
                    <div className="line-clamp-2 text-pretty text-[13px] leading-[1.45] text-muted-foreground">
                      {skill.description}
                    </div>
                    <span className="text-xs text-[var(--cad-faint)]">
                      {skill.downloads.toLocaleString()} downloads
                      {skill.tags.length > 0 ? ` · ${skill.tags.slice(0, 2).join(", ")}` : ""}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
            {(skills ?? []).length === 0 && (
              <div className="py-16 text-center">
                <p className="text-sm text-muted-foreground">No skills found.</p>
              </div>
            )}
          </>

          {/* SEO: What are Claude Skills */}
          <section className="mt-20 border-t border-border pt-12 max-w-3xl">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              What are Claude Skills?
            </h2>
            <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
              <p>
                <strong className="text-foreground">Claude Skills</strong> are reusable, community-built
                capabilities that extend what Claude can do. A skill is a packaged set of instructions,
                prompts, or workflows that teaches Claude how to perform a specific task&mdash;from
                generating code in a particular framework to following a design system or writing in a
                specific tone.
              </p>
              <h3 className="text-sm font-medium text-foreground pt-2">How do Skills work?</h3>
              <p>
                Skills are defined as structured prompts or configuration files that you can install
                into your Claude workflow. Once installed, Claude automatically applies the skill&apos;s
                instructions when relevant.
              </p>
              <h3 className="text-sm font-medium text-foreground pt-2">Why use Skills?</h3>
              <ul className="list-disc list-inside space-y-1 pl-1">
                <li><strong className="text-foreground">Save time:</strong> Skip repetitive setup by reusing proven instructions others have already refined.</li>
                <li><strong className="text-foreground">Consistency:</strong> Ensure Claude follows the same patterns and standards across your team or project.</li>
                <li><strong className="text-foreground">Community-driven:</strong> Browse skills shared by other developers and contribute your own.</li>
                <li><strong className="text-foreground">Composable:</strong> Combine multiple skills to create powerful, tailored workflows.</li>
              </ul>
              <h3 className="text-sm font-medium text-foreground pt-2">Getting started</h3>
              <p>
                Browse the skills above, find one that fits your use case, and follow the install
                instructions on the skill detail page. You can also{" "}
                <Link href="/submit" className="text-primary hover:underline">submit your own skill</Link>{" "}
                to share with the community.
              </p>
            </div>
          </section>

          <section className="mt-12 border-t border-border pt-10 max-w-3xl">
            <h3 className="text-lg font-medium text-foreground mb-3">Explore more from ClaudeAI Directory</h3>
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm">
              <Link href="/mcp" className="text-primary hover:underline">MCP Connectors</Link>
              <Link href="/prompts" className="text-primary hover:underline">Prompt Library</Link>
              <Link href="/showcase" className="text-primary hover:underline">Community Showcase</Link>
              <Link href="/jobs" className="text-primary hover:underline">AI Jobs</Link>
              <Link href="/learn" className="text-primary hover:underline">Learn &amp; Resources</Link>
              <Link href="/feed" className="text-primary hover:underline">Latest Feed</Link>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
