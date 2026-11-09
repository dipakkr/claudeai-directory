import Link from "next/link";
import LaunchSponsor from "./LaunchSponsor";
import { ArrowRight, Rocket } from "lucide-react";

/** Shared sidebar for launch discovery and individual launch pages. */
export default function LaunchSidebar() {
  return (
    <aside aria-label="Sponsors and launch resources" className="min-w-0 lg:sticky lg:top-24 lg:self-start">
          <div className="space-y-5">
            <LaunchSponsor />
            <section className="rounded-xl border border-border bg-card/30 p-5">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary"><Rocket size={18} aria-hidden="true" /></span>
              <h2 className="mt-4 font-sans text-[18px] font-medium tracking-tight">Your next launch starts here.</h2>
              <p className="mt-2 text-[13px] leading-6 text-muted-foreground">Built an app with Claude? Share it with the community and meet your first users.</p>
              <Link href="/launches/submit" className="mt-5 flex items-center justify-between rounded-lg bg-foreground px-4 py-2.5 text-[12px] font-medium text-background transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
                Launch your app <ArrowRight size={15} aria-hidden="true" />
              </Link>
              <p className="mt-3 text-[11px] text-muted-foreground">Free to submit.</p>
            </section>
          </div>
        </aside>
  );
}
