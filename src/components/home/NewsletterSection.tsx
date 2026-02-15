"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail } from "lucide-react";
import { toast } from "sonner";

const NewsletterSection = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitting(true);
    setTimeout(() => {
      toast.success("Thanks for subscribing!");
      setEmail("");
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <section className="py-10 bg-muted/20">
      <div className="container">
        <div className="mx-auto max-w-md text-center">
          <h2 className="mb-2 text-base font-medium text-foreground">Stay updated</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Weekly curated Claude AI resources delivered to your inbox.
          </p>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-9 bg-background border-border pl-10 text-sm"
                required
              />
            </div>
            <Button type="submit" size="sm" disabled={isSubmitting}>
              {isSubmitting ? "..." : "Subscribe"}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;
