"use client";

import { useState } from "react";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";

export function FooterSubscribe() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitting(true);
    try {
      // Our own list is the source of truth.
      await api.post("/newsletter/subscribe", { email, source: window.location.pathname });
      // Also forward to the Substack; a failure there doesn't undo the signup.
      void fetch("https://substackapi.com/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, domain: "tooljunction.substack.com" }),
      }).catch(() => undefined);
      toast.success("You're subscribed. The next digest lands in your inbox.");
      setEmail("");
    } catch (error) {
      const detail = error instanceof ApiError ? (error.data as { detail?: unknown })?.detail : undefined;
      toast.error(typeof detail === "string" ? detail : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-md gap-2">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        aria-label="Email address"
        className="h-10 min-w-0 flex-1 rounded-full border border-border bg-card px-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-[var(--cad-line-hover)]"
      />
      <button
        type="submit"
        disabled={isSubmitting}
        className="h-10 shrink-0 rounded-full bg-foreground px-5 text-sm font-medium text-background transition-colors hover:bg-foreground/85 disabled:opacity-60"
      >
        {isSubmitting ? "…" : "Subscribe"}
      </button>
    </form>
  );
}
