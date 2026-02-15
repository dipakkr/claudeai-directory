import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - Claude Directory",
  description: "Privacy policy for Claude Directory (claudeai.directory).",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container max-w-3xl py-16">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Privacy Policy
          </h1>
          <p className="text-sm text-muted-foreground mb-10">
            Last updated: February 2026
          </p>

          <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8 text-muted-foreground">
            <section>
              <h2 className="text-xl font-semibold text-foreground">
                Introduction
              </h2>
              <p>
                Claude Directory (&quot;claudeai.directory&quot;, &quot;we&quot;,
                &quot;our&quot;, or &quot;us&quot;) is committed to protecting
                your privacy. This Privacy Policy explains how we collect, use,
                and safeguard your information when you visit our website.
              </p>
              <p>
                Claude Directory is an independent community project and is{" "}
                <strong className="text-foreground">not</strong> affiliated with
                Anthropic or Claude.ai.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">
                Information We Collect
              </h2>
              <h3 className="text-base font-medium text-foreground">
                Information You Provide
              </h3>
              <ul className="space-y-1">
                <li>
                  Account information (name, email) when you sign up
                </li>
                <li>
                  Content you submit such as resources, comments, or discussion
                  posts
                </li>
                <li>
                  Contact information when you reach out to us
                </li>
              </ul>

              <h3 className="text-base font-medium text-foreground mt-4">
                Information Collected Automatically
              </h3>
              <ul className="space-y-1">
                <li>
                  Usage data such as pages visited, time spent, and referral
                  sources
                </li>
                <li>
                  Device and browser information
                </li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">
                How We Use Your Information
              </h2>
              <ul className="space-y-1">
                <li>To provide and maintain our service</li>
                <li>To personalize your experience</li>
                <li>To communicate with you about updates or changes</li>
                <li>To analyze usage and improve our platform</li>
                <li>To prevent fraud and ensure security</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">
                Data Sharing
              </h2>
              <p>
                We do not sell your personal information. We may share data with
                third-party service providers that help us operate the platform
                (e.g., hosting, analytics). These providers are bound by
                contractual obligations to protect your data.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">
                Cookies
              </h2>
              <p>
                We use cookies to keep you signed in and to understand how you
                use our site. You can control cookies through your browser
                settings.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">
                Your Rights
              </h2>
              <p>You have the right to:</p>
              <ul className="space-y-1">
                <li>Access the personal data we hold about you</li>
                <li>Request correction of inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Withdraw consent for data processing</li>
              </ul>
              <p>
                To exercise these rights, contact us through our{" "}
                <Link
                  href="/community"
                  className="text-primary hover:underline"
                >
                  community page
                </Link>
                .
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">
                Data Security
              </h2>
              <p>
                We implement reasonable security measures to protect your
                information. However, no method of transmission over the internet
                is 100% secure and we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">
                Changes to This Policy
              </h2>
              <p>
                We may update this Privacy Policy from time to time. Changes
                will be posted on this page with an updated revision date.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">
                Contact
              </h2>
              <p>
                If you have questions about this Privacy Policy, please reach
                out via our{" "}
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
