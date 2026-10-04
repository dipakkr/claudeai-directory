"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Discussion from "@/components/discussion/Discussion";
import { api } from "@/lib/api";
import type { GuideReport } from "@/lib/connector-guides";

const SITE_URL = "https://www.claudeai.directory";

/**
 * Comments on a connector guide. Each one can say which method the reader
 * tried and whether it worked, so the page shows real-world results next to
 * our own tests. The first page of comments comes from the server so it is
 * in the HTML for search engines.
 */
export default function GuideDiscussion({
  slug,
  app,
  methods,
  initialReports,
}: {
  slug: string;
  app: string;
  methods: string[];
  initialReports: GuideReport[];
}) {
  const path = `/connector-guides/${slug}/replies`;
  const queryClient = useQueryClient();
  const [method, setMethod] = useState("");
  const [outcome, setOutcome] = useState<"" | "worked" | "failed">("");

  const { data: reports, isLoading } = useQuery({
    queryKey: ["connector-replies", slug],
    queryFn: () => api.get<GuideReport[]>(path),
    initialData: initialReports,
  });
  const create = useMutation({
    mutationFn: (data: { body: string; link?: string }) =>
      api.post<GuideReport>(path, { ...data, method: method || null, outcome: (method && outcome) || null }),
    onSuccess: () => {
      setMethod("");
      setOutcome("");
      queryClient.invalidateQueries({ queryKey: ["connector-replies", slug] });
    },
  });

  const chip = (active: boolean) =>
    `rounded-full border px-3 py-1 text-[13px] transition-colors ${
      active ? "border-foreground/60 bg-foreground/10 text-foreground" : "border-border text-muted-foreground hover:text-foreground"
    }`;

  return (
    <Discussion
      title="Did it work for you?"
      count={reports?.length ?? 0}
      comments={(reports ?? []).map((r) => ({
        id: r.id,
        author: r.author,
        authorAvatar: r.author_avatar,
        headline: r.method && r.outcome ? `${r.outcome === "worked" ? "Worked" : "Didn't work"} · ${r.method}` : null,
        body: r.body,
        link: r.link,
        createdAt: r.created_at,
      }))}
      isLoading={isLoading}
      onPost={({ body, link }) => create.mutateAsync({ body, link })}
      permalink={(id) => `${SITE_URL}/connectors/${slug}#${id}`}
      withLinkField
      minLength={10}
      placeholder={`Which setup did you try, on which OS and Claude app? What happened?`}
      emptyText={`No reports yet. Tried connecting ${app} to Claude? Say what worked and what didn't.`}
      intro={
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[13px] text-muted-foreground">Method you tried:</span>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="rounded-md border border-border bg-background px-2 py-1 text-[13px] text-foreground"
              aria-label="Method you tried"
            >
              <option value="">Just a comment</option>
              {methods.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          {method && (
            <div className="flex flex-wrap items-center gap-2" role="radiogroup" aria-label="Result">
              <span className="text-[13px] text-muted-foreground">Result:</span>
              <button type="button" role="radio" aria-checked={outcome === "worked"} className={chip(outcome === "worked")} onClick={() => setOutcome("worked")}>
                Worked
              </button>
              <button type="button" role="radio" aria-checked={outcome === "failed"} className={chip(outcome === "failed")} onClick={() => setOutcome("failed")}>
                Didn&apos;t work
              </button>
            </div>
          )}
        </div>
      }
    />
  );
}
