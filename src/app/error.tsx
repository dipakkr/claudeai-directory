"use client";

// Keep recovery independent of auth and other application contexts: they may
// be the reason the route failed. Reload the document, not just the route tree.
export default function PageError() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-xl flex-col justify-center px-6 py-16">
      <h1 className="text-3xl font-semibold text-foreground">This page couldn&apos;t load</h1>
      <p role="status" className="mt-4 text-muted-foreground">
        Reload the page to try again. If it still won&apos;t open, return to launches.
      </p>
      <div className="mt-6 flex flex-wrap items-center gap-6">
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-full bg-foreground px-5 py-2 text-sm text-background"
        >
          Reload page
        </button>
        {/* A document navigation also clears an incompatible client router. */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a href="/launches" className="text-sm text-foreground underline underline-offset-4">
          Back to launches
        </a>
      </div>
    </main>
  );
}
