"use client";

import Link from "next/link";
import { ArrowUpRight, CheckCircle } from "lucide-react";
import type { Skill } from "@/types";

const FeaturedResources = ({ initialSkills = [] }: { initialSkills?: Skill[] }) => {
  return (
    <section className="cad-section cad-section-rule">
      <div className="container">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-base font-medium text-foreground">Featured Skills</h2>
          <Link
            href="/skills"
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
          >
            View all <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {initialSkills.slice(0, 8).map((skill) => (
            <Link
              key={skill.id}
              href={`/skills/${skill.id}`}
              className="cad-card group flex min-h-[172px] flex-col p-4"
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="cad-icon-tile">
                    {(skill.title || skill.name)[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-medium text-foreground flex items-center gap-1">
                      <span className="truncate">{skill.title || skill.name}</span>
                      {skill.verified && <CheckCircle className="h-3 w-3 text-primary shrink-0" />}
                    </h3>
                    <p className="truncate text-xs text-muted-foreground">{skill.category}</p>
                  </div>
                </div>
                <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <p className="mb-3 line-clamp-3 flex-1 text-xs leading-relaxed text-muted-foreground">
                {skill.description}
              </p>
              <div className="mt-auto flex items-center gap-3 border-t border-border pt-3 text-xs text-muted-foreground">
                <span>{skill.downloads.toLocaleString()} downloads</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedResources;
