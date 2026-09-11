import Link from "next/link";
import ListingPage from "@/components/directory/ListingPage";
import { CollectionPageSchema } from "@/components/seo/JsonLd";
import { promptToItem, rankWithinType } from "@/lib/directory";
import type { Prompt } from "@/types";

export default function PromptsClient({
  initialData,
  initialParams,
}: {
  initialData: Prompt[];
  initialParams: { category?: string; search?: string };
}) {
  return (
    <ListingPage
      title="Prompts"
      description="Copy-ready prompts for Claude, from code review to cold email."
      items={rankWithinType(initialData.map(promptToItem))}
      searchPlaceholder="Search prompts…"
      initialCategory={initialParams.category}
      initialQuery={initialParams.search}
      schema={
        <CollectionPageSchema
          name="AI Prompts"
          description="Curated, copy-ready prompts for Claude AI across coding, writing, analysis, and more."
          url="https://www.claudeai.directory/prompts"
        />
      }
    >
      <h2>What are Prompts?</h2>
      <p>
        <strong>AI Prompts</strong> are ready-to-use, copy-paste instructions that help you get better results from Claude.
        Each prompt is crafted for a specific task so you can skip the trial-and-error and get straight to useful output.
      </p>
      <h3>How to use a prompt</h3>
      <p>
        Browse the library above, open a prompt that matches your task, and copy it. Paste it into Claude and replace any
        placeholder values with your own context. You can also{" "}
        <Link href="/submit" className="text-foreground underline underline-offset-4 hover:text-primary">
          submit your own prompts
        </Link>
        .
      </p>
    </ListingPage>
  );
}
