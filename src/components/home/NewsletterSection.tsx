import { FooterSubscribe } from "@/components/layout/FooterSubscribe";

export default function NewsletterSection() {
  return <section className="py-10 bg-muted/20">
    <div className="mx-auto max-w-md px-4 text-center">
      <h2 className="mb-2 text-base font-medium">The weekly Claude digest</h2>
      <p className="mb-4 text-sm text-muted-foreground">New Skills, MCP servers and useful resources. One email a week.</p>
      <FooterSubscribe />
    </div>
  </section>;
}
