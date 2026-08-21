"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Mail, Sparkles } from "lucide-react";
import { toast } from "sonner";

const CTASection = () => {
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
    <section className="cad-section">
      <div className="container">
        <div className="cad-card p-8 md:p-10">
          <div className="grid gap-10 md:grid-cols-2 md:gap-16 items-center">
            {/* Left — Join CTA */}
            <div>
              <div className="cad-chip mb-4 inline-flex items-center gap-1.5 text-primary">
                <Sparkles className="h-3 w-3" />
                Open community
              </div>
              <h2 className="mb-2 text-2xl font-medium text-foreground">
                Join the directory
              </h2>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                Share your skills, prompts, and projects with the Claude
                community. Help builders discover what&apos;s possible.
              </p>
              <div className="flex gap-3">
                <Link href="/signup">
                  <Button size="sm">
                    Get Started
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Button>
                </Link>
                <Link href="/submit">
                  <Button variant="outline" size="sm">
                    Submit a Resource
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right — Newsletter */}
            <div className="md:border-l md:border-border md:pl-16">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground mb-4">
                <Mail className="h-3 w-3" />
                Weekly digest
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                Stay updated
              </h3>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                Curated Claude AI resources delivered to your inbox every week.
              </p>
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-9 border-border bg-background text-sm"
                  required
                />
                <Button type="submit" size="sm" variant="secondary" disabled={isSubmitting}>
                  {isSubmitting ? "..." : "Subscribe"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
