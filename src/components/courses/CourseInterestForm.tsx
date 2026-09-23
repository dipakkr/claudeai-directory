"use client";

import { useState } from "react";
import { ArrowRight, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type CourseInterestFormProps = {
  courseSlug?: string;
  source: string;
  compact?: boolean;
};

const roles = [
  "GTM",
  "SEO",
  "Product",
  "Marketing",
  "Excel or Sheets",
  "Freelance",
  "Claude Code",
  "Other",
];

export default function CourseInterestForm({
  courseSlug = "claude-work-courses",
  source,
  compact = false,
}: CourseInterestFormProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState(roles[0]);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "missing">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/course-interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, role, course: courseSlug, source }),
      });

      if (response.ok) {
        setStatus("success");
        setMessage("You are on the launch list. The free previews are below.");
        setEmail("");
        setName("");
        return;
      }

      const body = (await response.json().catch(() => null)) as { message?: string } | null;
      setStatus(response.status === 503 ? "missing" : "idle");
      setMessage(body?.message || "Something went wrong. Try again in a moment.");
    } catch {
      setStatus("idle");
      setMessage("Something went wrong. Try again in a moment.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {!compact ? (
        <Input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Name"
          className="h-11 bg-background"
        />
      ) : null}
      <div className="relative">
        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          className="h-11 bg-background pl-10"
          required
        />
      </div>
      {!compact ? (
        <select
          value={role}
          onChange={(event) => setRole(event.target.value)}
          className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground"
        >
          {roles.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      ) : null}
      <Button type="submit" size="lg" className="w-full" disabled={status === "loading"}>
        {status === "loading" ? "Joining..." : "Get the starter kit"}
        <ArrowRight className="h-4 w-4" />
      </Button>
      {message ? (
        <p
          className={`text-xs leading-relaxed ${
            status === "success" ? "text-primary" : "text-muted-foreground"
          }`}
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}
