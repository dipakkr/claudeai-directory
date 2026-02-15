"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, CheckCircle, Download } from "lucide-react";
import { useSkills } from "@/hooks/use-skills";
import { CollectionPageSchema } from "@/components/seo/JsonLd";

const categories = [
  { label: "All", value: "All" },
  { label: "Productivity", value: "productivity" },
  { label: "Design", value: "design" },
  { label: "Code", value: "code" },
  { label: "Media", value: "media" },
];

const Skills = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const { data: skills, isLoading } = useSkills({
    search: search || undefined,
    category: category === "All" ? undefined : category,
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <CollectionPageSchema
        name="Claude Skills"
        description="Browse and install Claude skills shared by the community."
        url="https://claudeai.directory/skills"
      />
      <Header />
      <main className="flex-1">
        <div className="container py-10">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-foreground mb-2">Skills</h1>
            <p className="text-sm text-muted-foreground">
              Browse Claude skills and capabilities shared by the community
            </p>
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search skills..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 bg-card border-border pl-10 text-sm"
            />
          </div>
          <div className="flex items-center gap-1.5 mb-6 overflow-x-auto">
            {categories.map((c) => (
              <button
                key={c.value}
                onClick={() => setCategory(c.value)}
                className={`px-2.5 py-1 text-[11px] rounded-md border transition-colors whitespace-nowrap ${category === c.value
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border text-muted-foreground hover:text-foreground"
                  }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-36 rounded-lg" />
              ))}
            </div>
          ) : (
            <>
              <p className="mb-4 text-xs text-muted-foreground">
                {skills?.length ?? 0} skills found
              </p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {(skills ?? []).map((skill) => (
                  <Link
                    key={skill.id}
                    href={`/skills/${skill.id}`}
                    className="group rounded-lg border border-border bg-card p-4 hover:bg-accent/50 hover:border-primary/20 transition-all flex flex-col"
                  >
                    {/* Top row: icon + name */}
                    <div className="flex items-center gap-2.5 mb-2.5">
                      <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-sm font-semibold shrink-0">
                        {skill.name[0]?.toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-medium text-foreground flex items-center gap-1">
                          <span className="truncate">{skill.name}</span>
                          {skill.verified && <CheckCircle className="h-3 w-3 text-primary shrink-0" />}
                        </h3>
                        <p className="text-[11px] text-muted-foreground">{skill.category}</p>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3 flex-1">
                      {skill.description}
                    </p>

                    {/* Footer: tags + downloads */}
                    <div className="flex items-center justify-between gap-2">
                      {skill.tags.length > 0 ? (
                        <div className="flex flex-wrap gap-1 min-w-0">
                          {skill.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <div />
                      )}
                      <span className="flex items-center gap-1 text-[11px] text-muted-foreground/60 shrink-0">
                        <Download className="h-3 w-3" />
                        {skill.downloads.toLocaleString()}
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
          )}

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

              <h3 className="text-sm font-medium text-foreground pt-2">
                How do Skills work?
              </h3>
              <p>
                Skills are defined as structured prompts or configuration files that you can install
                into your Claude workflow. Once installed, Claude automatically applies the skill&apos;s
                instructions when relevant. Skills can cover coding patterns, writing styles, analysis
                frameworks, design guidelines, and more.
              </p>

              <h3 className="text-sm font-medium text-foreground pt-2">
                Why use Skills?
              </h3>
              <ul className="list-disc list-inside space-y-1 pl-1">
                <li><strong className="text-foreground">Save time:</strong> Skip repetitive setup by reusing proven instructions others have already refined.</li>
                <li><strong className="text-foreground">Consistency:</strong> Ensure Claude follows the same patterns and standards across your team or project.</li>
                <li><strong className="text-foreground">Community-driven:</strong> Browse skills shared by other developers and contribute your own.</li>
                <li><strong className="text-foreground">Composable:</strong> Combine multiple skills to create powerful, tailored workflows.</li>
              </ul>

              <h3 className="text-sm font-medium text-foreground pt-2">
                Getting started
              </h3>
              <p>
                Browse the skills above, find one that fits your use case, and follow the install
                instructions on the skill detail page. You can also{" "}
                <Link href="/submit" className="text-primary hover:underline">submit your own skill</Link>{" "}
                to share with the community.
              </p>
            </div>
          </section>

          {/* Interlinks */}
          <section className="mt-12 border-t border-border pt-10 max-w-3xl">
            <h3 className="text-lg font-medium text-foreground mb-3">
              Explore more from Claude Directory
            </h3>
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
};

export default Skills;
