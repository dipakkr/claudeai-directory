"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Plus, Eye, Download, Star, TrendingUp, Clock, CheckCircle2, AlertCircle } from "lucide-react";

export default function CreatorResourcesPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) return null;

  // TODO: Fetch creator's resources from API
  const resources = [
    {
      id: "1",
      name: "Claude Prompt Library",
      type: "skill",
      status: "listed" as const,
      views: 2300,
      downloads: 450,
      rating: 4.8,
      reviewCount: 28,
      trending: 16,
      createdAt: "2 days ago",
      url: "/skills/claude-prompt-library",
    },
    {
      id: "2",
      name: "Airtable MCP",
      type: "mcp",
      status: "pending" as const,
      views: 0,
      downloads: 0,
      rating: 0,
      reviewCount: 0,
      createdAt: "5 days ago",
      daysWaiting: 5,
    },
    {
      id: "3",
      name: "Old Skill",
      type: "skill",
      status: "rejected" as const,
      views: 0,
      downloads: 0,
      rating: 0,
      reviewCount: 0,
      createdAt: "14 days ago",
      feedback: "Missing example usage in README",
    },
  ];

  const statusConfig = {
    listed: {
      label: "LISTED",
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-50 dark:bg-emerald-950",
      icon: CheckCircle2,
    },
    pending: {
      label: "PENDING REVIEW",
      color: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-50 dark:bg-amber-950",
      icon: Clock,
    },
    rejected: {
      label: "NEEDS REVISION",
      color: "text-destructive",
      bgColor: "bg-destructive/10",
      icon: AlertCircle,
    },
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="mx-auto max-w-[1120px] px-4 py-12 md:px-8">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <h1 className="text-3xl font-normal text-foreground md:text-4xl">My Resources</h1>
              <p className="mt-2 text-muted-foreground">Manage and track your submissions</p>
            </div>
            <Button asChild>
              <Link href="/submit">
                <Plus className="h-4 w-4" />
                Submit Resource
              </Link>
            </Button>
          </div>

          <div className="mt-12 space-y-4">
            {resources.map((resource) => {
              const config = statusConfig[resource.status];
              const StatusIcon = config.icon;

              return (
                <div
                  key={resource.id}
                  className="rounded-xl border border-border bg-card/45 p-6"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-medium text-foreground truncate">
                          {resource.name}
                        </h3>
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${config.color} ${config.bgColor}`}>
                          <StatusIcon className="h-3.5 w-3.5" />
                          {config.label}
                        </span>
                      </div>

                      <p className="text-sm text-muted-foreground mb-3">
                        {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)} • Created {resource.createdAt}
                      </p>

                      {resource.status === "listed" && (
                        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <Eye className="h-3.5 w-3.5" />
                            {resource.views.toLocaleString()} views
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Download className="h-3.5 w-3.5" />
                            {resource.downloads} downloads
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Star className="h-3.5 w-3.5" />
                            {resource.rating} ({resource.reviewCount} reviews)
                          </span>
                          {resource.trending && (
                            <span className="flex items-center gap-1.5 text-primary">
                              <TrendingUp className="h-3.5 w-3.5" />
                              Trending #{resource.trending}
                            </span>
                          )}
                        </div>
                      )}

                      {resource.status === "pending" && (
                        <p className="text-xs text-muted-foreground">
                          You'll get notified when approved. Average wait: 2-3 days
                        </p>
                      )}

                      {resource.status === "rejected" && (
                        <p className="text-xs text-muted-foreground">
                          💬 {resource.feedback}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {resource.status === "listed" && (
                        <>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={resource.url || "#"}>View</Link>
                          </Button>
                          <Button variant="outline" size="sm">
                            Share
                          </Button>
                        </>
                      )}

                      {resource.status === "pending" && (
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      )}

                      {resource.status === "rejected" && (
                        <>
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                          <Button size="sm">Resubmit</Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {resources.length === 0 && (
            <div className="mt-12 rounded-xl border border-dashed border-border p-12 text-center">
              <p className="text-base font-medium text-foreground">No resources yet</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Start by submitting your first skill, MCP, or agent
              </p>
              <Button asChild className="mt-4">
                <Link href="/submit">Submit your first resource</Link>
              </Button>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
