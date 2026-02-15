"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Briefcase, Search } from "lucide-react";
import { useJobs } from "@/hooks/use-jobs";

const types = ["All", "Full-time", "Part-time", "Contract", "Remote"];

export default function JobsPage() {
  const [type, setType] = useState("All");
  const [search, setSearch] = useState("");
  const { data: jobs, isLoading } = useJobs({
    type: type === "All" ? undefined : type.toLowerCase(),
    search: search || undefined,
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container py-10">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-foreground mb-2">Jobs</h1>
            <p className="text-sm text-muted-foreground">
              AI and Claude-related job opportunities
            </p>
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search jobs by title, company, or skills..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div className="flex items-center gap-2 mb-6">
            {types.map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-colors ${
                  type === t
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Two-column layout */}
          <div className="flex gap-8">
            {/* Job list */}
            <div className="flex-1 min-w-0">
              {isLoading ? (
                <div className="divide-y divide-border border-t border-border">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="py-5 space-y-2">
                      <Skeleton className="h-3 w-64" />
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  ))}
                </div>
              ) : (jobs ?? []).length > 0 ? (
                <div className="divide-y divide-border border-t border-border">
                  {(jobs ?? []).map((job) => (
                    <div
                      key={job.id}
                      className="py-5 group"
                    >
                      {/* Meta line */}
                      <div className="flex items-center justify-between gap-4 mb-1">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-0">
                          <span className="h-5 w-5 rounded bg-primary/10 flex items-center justify-center text-[10px] font-semibold text-primary shrink-0">
                            {job.company[0]?.toUpperCase()}
                          </span>
                          <span className="font-medium text-muted-foreground">{job.company}</span>
                          <span className="text-border">·</span>
                          <span>{job.location}</span>
                          <span className="text-border">·</span>
                          <span>{job.type}</span>
                          {job.salary_range && (
                            <>
                              <span className="text-border">·</span>
                              <span>{job.salary_range}</span>
                            </>
                          )}
                          {job.source === "aggregated" && job.source_url && (
                            <>
                              <span className="text-border">·</span>
                              <span className="text-muted-foreground/60">
                                via {new URL(job.source_url).hostname.replace("www.", "").replace("boards.greenhouse.io", "Greenhouse")}
                              </span>
                            </>
                          )}
                        </div>
                        <Link href={`/jobs/${job.id}`} className="shrink-0">
                          <Button size="sm" variant="outline" className="h-7 text-xs px-3">
                            View
                          </Button>
                        </Link>
                      </div>

                      {/* Title */}
                      <Link
                        href={`/jobs/${job.id}`}
                        className="text-sm font-medium text-foreground hover:underline"
                      >
                        {job.title}
                      </Link>

                      {/* Description */}
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2 max-w-2xl">
                        {job.description?.replace(/<[^>]*>/g, "").slice(0, 200)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center">
                  <Briefcase className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No jobs found.</p>
                </div>
              )}
            </div>

            {/* Right sidebar CTA */}
            <div className="hidden lg:block w-72 shrink-0">
              <div className="sticky top-20 rounded-xl border border-border bg-card p-6">
                <h2 className="text-xl font-semibold text-foreground leading-tight mb-3">
                  Reach thousands of Claude developers.
                </h2>
                <p className="text-xs text-muted-foreground mb-5">
                  Connect with top AI talent and grow your team
                  by reaching a dedicated community of developers.
                </p>
                <Link href="/submit">
                  <Button variant="outline" className="w-full text-sm">
                    Add job listing
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
