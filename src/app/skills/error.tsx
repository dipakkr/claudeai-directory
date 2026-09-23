"use client";

import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function SkillsError({ reset }: { reset: () => void }) {
  return <div className="min-h-screen bg-background">
    <Header />
    <main className="mx-auto min-h-[60vh] max-w-[840px] px-4 py-16 md:px-8">
      <h1 className="text-3xl text-foreground">Skills are temporarily unavailable</h1>
      <p role="status" className="mt-4 text-muted-foreground">We couldn&apos;t load this page. Please try again.</p>
      <div className="mt-6 flex items-center gap-6">
        <button onClick={reset} className="rounded-full bg-foreground px-5 py-2 text-sm text-background">Try again</button>
        <Link href="/skills" className="text-sm underline underline-offset-4">Browse skills</Link>
      </div>
    </main>
    <Footer />
  </div>;
}
