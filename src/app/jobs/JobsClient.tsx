"use client";

import { useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Briefcase } from "lucide-react";
import { useJobs } from "@/hooks/use-jobs";
import type { Job } from "@/types";

const types = ["All", "Full-time", "Part-time", "Contract", "Remote"];

export default function JobsClient({
  initialData,
  initialParams,
}: {
  initialData: Job[];
  initialParams: { type?: string; search?: string };
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get("type") ?? "All";
  const search = searchParams.get("search") ?? "";

  const { data: jobs } = useJobs(
    {
      type: type === "All" ? undefined : type.toLowerCase(),
      search: search || undefined,
    },
    { initialData }
  );

  const setType = useCallback((value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "All") params.set("type", value);
    else params.delete("type");
    router.push(`/jobs?${params.toString()}`);
  }, [router, searchParams]);



  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container py-10">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-foreground mb-2">Jobs</h1>
            <p className="text-sm text-muted-foreground">AI and Claude-related job opportunities</p>
          </div>



          <div className="flex flex-wrap items-center gap-2 mb-6 pb-2 sm:pb-0">
            {types.map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-colors ${type === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="flex gap-8">
            <div className="flex-1 min-w-0">
              {(jobs ?? []).length > 0 ? (
                <div className="divide-y divide-border border-t border-border">
                  {(jobs ?? []).map((job) => (
                    <div key={job.id} className="py-5 group">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-2">
                        <div className="flex flex-wrap items-center gap-y-1.5 gap-x-2 text-xs text-muted-foreground min-w-0">
                          <span className="h-5 w-5 rounded bg-primary/10 flex items-center justify-center text-[10px] font-semibold text-primary shrink-0">
                            {job.company[0]?.toUpperCase()}
                          </span>
                          <span className="font-medium text-muted-foreground">{job.company}</span>
                          <span className="text-border hidden sm:inline">·</span>
                          <span>{job.location}</span>
                          <span className="text-border hidden sm:inline">·</span>
                          <span>{job.type}</span>
                          {job.salary_range && (
                            <>
                              <span className="text-border hidden sm:inline">·</span>
                              <span>{job.salary_range}</span>
                            </>
                          )}
                          {job.source === "aggregated" && job.source_url && (
                            <>
                              <span className="text-border hidden sm:inline">·</span>
                              <span className="text-muted-foreground/60 w-full sm:w-auto">
                                via {new URL(job.source_url).hostname.replace("www.", "").replace("boards.greenhouse.io", "Greenhouse")}
                              </span>
                            </>
                          )}
                        </div>
                        <Link href={`/jobs/${job.id}`} className="shrink-0">
                          <Button size="sm" variant="outline" className="h-7 text-xs px-3">View</Button>
                        </Link>
                      </div>
                      <Link href={`/jobs/${job.id}`} className="text-sm font-medium text-foreground hover:underline">
                        {job.title}
                      </Link>
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

            <div className="hidden lg:block w-72 shrink-0">
              <div className="sticky top-20 rounded-xl border border-border bg-card p-6">
                <h2 className="text-xl font-semibold text-foreground leading-tight mb-3">
                  Reach thousands of Claude developers.
                </h2>
                <p className="text-xs text-muted-foreground mb-5">
                  Connect with top AI talent and grow your team by reaching a dedicated community of developers.
                </p>
                <Link href="/submit">
                  <Button variant="outline" className="w-full text-sm">Add job listing</Button>
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
