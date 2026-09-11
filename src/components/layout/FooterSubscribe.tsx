"use client";

import { useState } from "react";
import { toast } from "sonner";

export function FooterSubscribe() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("https://substackapi.com/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, domain: "tooljunction.substack.com" }),
      });
      if (!res.ok) throw new Error();
      toast.success("You're subscribed! Check your inbox.");
      setEmail("");
    } catch {
      toast.error("Something went wrong. Try subscribing at tooljunction.substack.com");
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
