import Link from "next/link";
import ListingPage from "@/components/directory/ListingPage";
import { CollectionPageSchema } from "@/components/seo/JsonLd";
import { buildOrders, skillToItem, type Orders } from "@/lib/directory";
import type { Skill } from "@/types";

export default function SkillsClient({
  initialData,
  initialParams,
  ranked,
}: {
  initialData: Skill[];
  initialParams: { category?: string; search?: string };
  ranked: Orders;
}) {
  const items = initialData.map(skillToItem);
  return (
    <ListingPage
      title="Claude Skills"
      description="Community-built Skills for coding, research, testing, productivity and more. Explore what is trending and install what you need."
      showCount={false}
      items={items}
      orders={buildOrders(items, ranked, false)}
      searchPlaceholder="Search skills…"
      initialCategory={initialParams.category}
      initialQuery={initialParams.search}
      schema={
        <CollectionPageSchema
          name="Claude Skills"
          description="Browse and install Claude skills shared by the community."
          url="https://www.claudeai.directory/skills"
        />
      }
    >
      <h2>What are Claude Skills?</h2>
      <p>
        <strong>Claude Skills</strong> are reusable, community-built capabilities that extend what Claude can do. A skill is
        a packaged set of instructions, prompts, or workflows that teaches Claude how to perform a specific task: from
        generating code in a particular framework to following a design system or writing in a specific tone.
      </p>
      <h3>How do Skills work?</h3>
      <p>
        Skills are defined as structured prompts or configuration files that you can install into your Claude workflow.
        Once installed, Claude automatically applies the skill&apos;s instructions when relevant.
      </p>
      <h3>Why use Skills?</h3>
      <ul className="mb-3 list-inside list-disc space-y-1 pl-1">
        <li><strong>Save time:</strong> Skip repetitive setup by reusing proven instructions others have already refined.</li>
        <li><strong>Consistency:</strong> Ensure Claude follows the same patterns and standards across your team or project.</li>
        <li><strong>Community-driven:</strong> Browse skills shared by other developers and contribute your own.</li>
        <li><strong>Composable:</strong> Combine multiple skills to create powerful, tailored workflows.</li>
      </ul>
      <h3>Getting started</h3>
      <p>
        Browse the skills above, find one that fits your use case, and follow the install instructions on the skill detail
        page. You can also{" "}
        <Link href="/submit" className="text-foreground underline underline-offset-4 hover:text-primary">
          submit your own skill
        </Link>{" "}
        to share with the community.
      </p>
    </ListingPage>
  );
}
