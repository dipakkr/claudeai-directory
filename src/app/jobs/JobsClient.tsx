"use client";

import { useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Briefcase } from "lucide-react";
import { useJobs } from "@/hooks/use-jobs";
import type { Job } from "@/types";
import { CompanyLogo } from "@/components/jobs/CompanyLogo";

const types = ["All", "Full-time", "Part-time", "Contract", "Remote"];

export default function JobsClient({
  initialData,
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
        <section className="mx-auto flex max-w-[1120px] flex-col gap-3 px-4 pb-6 pt-9 md:px-8 md:pt-12">
          <h1 className="text-[32px] font-normal leading-tight text-foreground md:text-[42px]">Jobs</h1>
          <p className="max-w-[680px] text-sm leading-6 text-muted-foreground md:text-base">
            AI, ML, agent and Claude ecosystem roles sourced from public job boards and company careers pages.
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {types.map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`rounded-full border px-3 py-1.5 text-xs transition ${type === t ? "border-foreground bg-foreground text-background" : "border-border bg-card text-muted-foreground hover:border-[var(--cad-line-hover)] hover:text-foreground"
                  }`}
              >
                {t}
              </button>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-[1120px] px-4 pb-20 md:px-8">
          {(jobs ?? []).length > 0 ? (
            <div className="border-y border-border">
              {(jobs ?? []).map((job) => (
                <Link
                  key={job.id}
                  href={`/jobs/${job.id}`}
                  className="group flex items-start gap-4 border-b border-border py-5 transition-colors last:border-b-0 hover:bg-card/45 sm:gap-5"
                >
                  <div className="flex min-w-0 flex-1 flex-col gap-2.5">
                    <div className="flex min-w-0 flex-wrap items-center gap-2.5 text-[13.5px] text-muted-foreground">
                      <CompanyLogo
                        company={job.company}
                        logo={job.logo}
                        className="h-[22px] w-[22px] text-[11px]"
                      />
                      <span className="font-medium text-foreground">{job.company}</span>
                      <span className="text-[var(--cad-faint)]">·</span>
                      <span>{job.location}</span>
                      <span className="text-[var(--cad-faint)]">·</span>
                      <span>{job.type}</span>
                      {job.salary_range && (
                        <>
                          <span className="text-[var(--cad-faint)]">·</span>
                          <span>{job.salary_range}</span>
                        </>
                      )}
                    </div>
                    <div className="text-lg font-medium tracking-normal text-foreground">{job.title}</div>
                    <p className="max-w-[78ch] text-pretty text-sm leading-6 text-muted-foreground">
                      {job.description?.replace(/<[^>]*>/g, "").slice(0, 240)}
                    </p>
                  </div>
                  <span className="hidden shrink-0 whitespace-nowrap rounded-full border border-border px-4 py-2 text-[13px] text-foreground transition-colors group-hover:border-primary group-hover:text-primary sm:block">
                    View
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center">
              <Briefcase className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No jobs found.</p>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
