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
    <div className="cad-shell flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto flex max-w-[1180px] flex-col gap-3 px-8 pb-[26px] pt-[60px]">
          <h1 className="text-[clamp(32px,4vw,42px)] font-medium leading-[1.08]">Jobs</h1>
          <p className="text-base leading-[1.6] text-muted-foreground">
            AI and Claude-related roles, posted by the hiring manager.
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {types.map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`cad-chip whitespace-nowrap px-4 text-[13.5px] ${type === t ? "cad-chip-active" : "bg-transparent hover:text-primary"
                  }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="mx-auto max-w-[1180px] px-8 pb-[88px]">
              {(jobs ?? []).length > 0 ? (
                <div className="flex flex-col">
                  {(jobs ?? []).map((job) => (
                    <Link
                      key={job.id}
                      href={`/jobs/${job.id}`}
                      className="group flex items-start gap-5 border-t border-border py-[26px] transition-opacity hover:opacity-80"
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
                        <div className="text-[19px] font-medium tracking-normal">{job.title}</div>
                        <p className="max-w-[88ch] text-pretty text-[14.5px] leading-[1.6] text-muted-foreground">
                          {job.description?.replace(/<[^>]*>/g, "").slice(0, 240)}
                        </p>
                      </div>
                      <span className="hidden shrink-0 whitespace-nowrap rounded-[10px] border border-border px-5 py-2 text-[13.5px] text-foreground group-hover:border-primary group-hover:text-primary sm:block">
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
        </div>
      </main>
      <Footer />
    </div>
  );
}
