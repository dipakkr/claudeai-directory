"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ExternalLink } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useSkillReplies, useCreateSkillReply } from "@/hooks/use-skills";
import { useAuth } from "@/lib/auth";
import type { SkillReply } from "@/types";

const schema = z.object({
  body: z.string().min(10, "Please write at least 10 characters"),
  link: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});
type FormValues = z.infer<typeof schema>;

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  return `${Math.floor(diff / 2592000)}mo ago`;
}

function ReplyCard({ reply }: { reply: SkillReply }) {
  return (
    <div className="py-4">
      <div className="flex items-start gap-3">
        <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-[11px] font-medium text-muted-foreground shrink-0 mt-0.5">
          {reply.author_avatar ? (
            <img src={reply.author_avatar} alt="" className="h-7 w-7 rounded-full object-cover" />
          ) : (
            reply.author[0]?.toUpperCase()
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-1.5">
            <span className="font-medium text-foreground">{reply.author}</span>
            <span className="text-border">·</span>
            <span>{timeAgo(reply.created_at)}</span>
          </div>
          <div className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
            {reply.body}
          </div>
          {reply.link && (
            <a
              href={reply.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-2 text-xs text-primary hover:underline"
            >
              <ExternalLink className="h-3 w-3" />
              {reply.link}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function ReplyForm({ skillSlug }: { skillSlug: string }) {
  const { isAuthenticated } = useAuth();
  const createReply = useCreateSkillReply(skillSlug);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = (values: FormValues) => {
    createReply.mutate(
      { body: values.body, link: values.link || undefined },
      {
        onSuccess: () => {
          reset();
          toast.success("Reply posted!");
        },
        onError: () => toast.error("Failed to post reply"),
      }
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
        <Link href="/login" className="text-primary hover:underline font-medium">
          Sign in
        </Link>{" "}
        to share what you&apos;re building.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div>
        <Textarea
          {...register("body")}
          placeholder="Describe how you're using this skill..."
          className="text-sm min-h-[80px]"
        />
        {errors.body && (
          <p className="mt-1 text-xs text-destructive">{errors.body.message}</p>
        )}
      </div>
      <div>
        <Input
          {...register("link")}
          placeholder="Link to your project (optional)"
          className="text-sm"
        />
        {errors.link && (
          <p className="mt-1 text-xs text-destructive">{errors.link.message}</p>
        )}
      </div>
      <div className="flex justify-end">
        <Button type="submit" size="sm" className="text-sm" disabled={createReply.isPending}>
          {createReply.isPending ? "Posting..." : "Share"}
        </Button>
      </div>
    </form>
  );
}

export default function SkillReplies({ skillSlug }: { skillSlug: string }) {
  const { data: replies, isLoading } = useSkillReplies(skillSlug);

  return (
    <div className="mt-10">
      <h3 className="text-xs font-bold text-foreground/80 mb-4 uppercase tracking-wider">
        What are you building with this skill?
      </h3>

      <div className="rounded-2xl border border-border bg-card p-6">
        {isLoading ? (
          <div className="divide-y divide-border mb-6">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="py-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-7 w-7 rounded-full" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))}
          </div>
        ) : (replies ?? []).length > 0 ? (
          <div className="divide-y divide-border mb-6">
            {(replies ?? []).map((reply) => (
              <ReplyCard key={reply.id} reply={reply} />
            ))}
          </div>
        ) : null}

        <div className={(replies ?? []).length > 0 ? "pt-4 border-t border-border" : ""}>
          <ReplyForm skillSlug={skillSlug} />
        </div>
      </div>
    </div>
  );
}
