"use client";

import Link from "next/link";
import { ArrowUpRight, Star, CheckCircle } from "lucide-react";
import type { Skill } from "@/types";

const FeaturedResources = ({ initialSkills = [] }: { initialSkills?: Skill[] }) => {
  return (
    <section className="py-10">
      <div className="container">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-medium text-foreground">Featured Skills</h2>
          <Link
            href="/skills"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            View all <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {initialSkills.slice(0, 8).map((skill) => (
            <Link
              key={skill.id}
              href={`/skills/${skill.id}`}
              className="group rounded-lg border border-border bg-card p-4 hover:bg-accent/50 hover:border-primary/20 transition-all flex flex-col min-h-[160px]"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center text-primary text-sm font-medium shrink-0">
                    {(skill.title || skill.name)[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-medium text-foreground flex items-center gap-1">
                      <span className="truncate">{skill.title || skill.name}</span>
                      {skill.verified && <CheckCircle className="h-3 w-3 text-primary shrink-0" />}
                    </h3>
                    <p className="text-xs text-muted-foreground truncate">{skill.category}</p>
                  </div>
                </div>
                <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </div>
              <p className="text-xs text-muted-foreground line-clamp-3 mb-2 flex-1">
                {skill.description}
              </p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-auto">
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
