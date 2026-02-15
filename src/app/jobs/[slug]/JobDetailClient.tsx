"use client";

import { use } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Building2,
  MapPin,
  Clock,
  DollarSign,
  Briefcase,
  ExternalLink,
  Calendar,
} from "lucide-react";
import { useJob } from "@/hooks/use-jobs";
import PageBreadcrumb from "@/components/layout/PageBreadcrumb";

export default function JobDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { data: job, isLoading } = useJob(slug);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1">
          <div className="container py-8">
            <Skeleton className="h-4 w-48 mb-6" />
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-4">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-32 w-full" />
              </div>
              <div>
                <Skeleton className="h-48 w-full" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-medium text-foreground mb-2">Job not found</h1>
            <Link href="/jobs">
              <Button variant="outline" size="sm">Back to Jobs</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container py-8">
          <PageBreadcrumb items={[
            { label: "Jobs", href: "/jobs" },
            { label: job.title },
          ]} />

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header */}
              <div>
                <div className="flex items-start gap-4 mb-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-lg font-medium shrink-0">
                    {job.logo ? (
                      <img src={job.logo} alt={job.company} className="h-12 w-12 rounded-lg object-cover" />
                    ) : (
                      job.company[0]?.toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h1 className="text-base font-semibold text-foreground">{job.title}</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">{job.company}</p>
                  </div>
                </div>

                {/* Meta info */}
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    {job.location}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Briefcase className="h-3.5 w-3.5" />
                    {job.type}
                  </span>
                  {job.salary_range && (
                    <span className="flex items-center gap-1.5">
                      <DollarSign className="h-3.5 w-3.5" />
                      {job.salary_range}
                    </span>
                  )}
                  {job.experience && (
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      {job.experience}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(job.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>

              <Separator />

              {/* Skills */}
              {job.skills_required.length > 0 && (
                <>
                  <div>
                    <h2 className="text-sm font-medium text-foreground mb-3 uppercase tracking-wider">Skills Required</h2>
                    <div className="flex flex-wrap gap-1.5">
                      {job.skills_required.map((skill) => (
                        <Badge key={skill} variant="outline" className="text-xs">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              {/* Description */}
              <div>
                <h2 className="text-sm font-medium text-foreground mb-3 uppercase tracking-wider">Description</h2>
                <div
                  className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground [&_h2]:text-foreground [&_h3]:text-foreground [&_strong]:text-foreground [&_a]:text-primary"
                  dangerouslySetInnerHTML={{ __html: job.description }}
                />
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Apply */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Apply</CardTitle>
                </CardHeader>
                <CardContent>
                  <a href={job.apply_url} target="_blank" rel="noopener noreferrer">
                    <Button className="w-full" size="sm">
                      <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                      Apply Now
                    </Button>
                  </a>
                </CardContent>
              </Card>

              {/* Company Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Company</p>
                    <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5" />
                      {job.company}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Location</p>
                    <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" />
                      {job.location}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Type</p>
                    <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
                      <Briefcase className="h-3.5 w-3.5" />
                      {job.type}
                    </p>
                  </div>
                  {job.salary_range && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Salary</p>
                      <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
                        <DollarSign className="h-3.5 w-3.5" />
                        {job.salary_range}
                      </p>
                    </div>
                  )}
                  {job.experience && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Experience</p>
                      <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        {job.experience}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Posted</p>
                    <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(job.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
