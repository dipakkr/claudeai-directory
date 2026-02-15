import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service - Claude Directory",
  description: "Terms of service for Claude Directory (claudeai.directory).",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container max-w-3xl py-16">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Terms of Service
          </h1>
          <p className="text-sm text-muted-foreground mb-10">
            Last updated: February 2026
          </p>

          <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8 text-muted-foreground">
            <section>
              <h2 className="text-xl font-semibold text-foreground">
                Agreement to Terms
              </h2>
              <p>
                By accessing Claude Directory (&quot;claudeai.directory&quot;,
                &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;), you agree to
                be bound by these Terms of Service. If you do not agree, please
                do not use the site.
              </p>
              <p>
                Claude Directory is an independent community project and is{" "}
                <strong className="text-foreground">not</strong> affiliated with
                Anthropic, Claude.ai, or Claude.com in any way.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">
                Use of Service
              </h2>
              <p>You agree to use Claude Directory only for lawful purposes. You must not:</p>
              <ul className="space-y-1">
                <li>Use the service in any way that violates applicable laws</li>
                <li>
                  Submit false, misleading, or harmful content
                </li>
                <li>
                  Attempt to gain unauthorized access to any part of the service
                </li>
                <li>
                  Interfere with or disrupt the service or its infrastructure
                </li>
                <li>Scrape or harvest data without permission</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">
                Accounts
              </h2>
              <p>
                When you create an account, you are responsible for maintaining
                the security of your credentials and for all activity under your
                account. You must notify us immediately of any unauthorized use.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">
                User Content
              </h2>
              <p>
                You retain ownership of content you submit to Claude Directory.
                By submitting content, you grant us a non-exclusive, worldwide,
                royalty-free license to use, display, and distribute that content
                on our platform.
              </p>
              <p>
                We reserve the right to remove any content that violates these
                terms or that we deem inappropriate.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">
                Third-Party Resources
              </h2>
              <p>
                Claude Directory links to and references third-party tools,
                resources, and websites. We do not control and are not
                responsible for third-party content. Use third-party resources at
                your own risk.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">
                Intellectual Property
              </h2>
              <p>
                The Claude Directory website, its design, and original content
                are the property of Claude Directory. &quot;Claude&quot; and
                &quot;Anthropic&quot; are trademarks of Anthropic, PBC. All
                other trademarks belong to their respective owners. Our use of
                these names is for descriptive purposes only and does not imply
                endorsement or affiliation.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">
                Disclaimer of Warranties
              </h2>
              <p>
                Claude Directory is provided &quot;as is&quot; and &quot;as
                available&quot; without warranties of any kind, express or
                implied. We do not guarantee that the service will be
                uninterrupted, error-free, or secure.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">
                Limitation of Liability
              </h2>
              <p>
                To the maximum extent permitted by law, Claude Directory shall
                not be liable for any indirect, incidental, special, or
                consequential damages arising from your use of the service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">
                Changes to Terms
              </h2>
              <p>
                We may update these Terms from time to time. Continued use of
                the service after changes constitutes acceptance of the revised
                terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">
                Contact
              </h2>
              <p>
                If you have questions about these Terms, please reach out via
                our{" "}
                <Link
                  href="/community"
                  className="text-primary hover:underline"
                >
                  community page
                </Link>
                .
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
