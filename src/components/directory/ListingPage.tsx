import type { ReactNode } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import DirectoryList from "@/components/directory/DirectoryList";
import type { DirectoryItem, SortKey } from "@/lib/directory";

/** Most common categories first, so the chips reflect what's actually listed. */
export function topCategories(items: DirectoryItem[], limit = 10): string[] {
  const counts = new Map<string, number>();
  for (const item of items) {
    if (item.category) counts.set(item.category, (counts.get(item.category) ?? 0) + 1);
  }
  return [...counts.entries()]
    // Singletons are usually data-entry leftovers ("Analysis" next to "Productivity & Analysis").
    .filter(([, count]) => count > 1)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([category]) => category);
}

interface ListingPageProps {
  title: string;
  description: string;
  items: DirectoryItem[];
  /** Trending / Top / New orderings. Omit for lists without ranking tabs. */
  orders?: Record<SortKey, string[]>;
  searchPlaceholder: string;
  initialCategory?: string;
  initialQuery?: string;
  schema?: ReactNode;
  emptyMessage?: string;
  /** Explainer copy under the list (kept for search visibility). */
  children?: ReactNode;
}

export default function ListingPage({
  title,
  description,
  items,
  orders,
  searchPlaceholder,
  initialCategory,
  initialQuery,
  schema,
  emptyMessage,
  children,
}: ListingPageProps) {
  return (
    <div className="min-h-screen bg-background">
      {schema}
      <Header />
      <main>
        <section className="mx-auto max-w-[1180px] px-4 pb-10 pt-16 text-center md:px-8 md:pt-20">
          <h1 className="text-[clamp(40px,5.5vw,60px)] font-normal leading-[1.05] text-foreground">{title}</h1>
          <p className="mx-auto mt-5 max-w-[56ch] text-pretty text-[16px] leading-relaxed text-muted-foreground md:text-[17px]">
            {description}
            {items.length > 0 && <span className="text-foreground"> {items.length} listed.</span>}
          </p>
        </section>

        <section className="mx-auto max-w-[840px] px-4 md:px-8">
          <DirectoryList
            items={items}
            orders={orders}
            searchPlaceholder={searchPlaceholder}
            categories={topCategories(items)}
            initialCategory={initialCategory}
            initialQuery={initialQuery}
            syncUrl
            emptyMessage={emptyMessage}
          />
        </section>

        {children && (
          <section className="mx-auto mt-24 max-w-[840px] px-4 md:px-8">
            <div className="border-t border-border pt-12 text-sm leading-relaxed text-muted-foreground [&_h2]:mb-4 [&_h2]:font-sans [&_h2]:text-base [&_h2]:font-medium [&_h2]:text-foreground [&_h3]:pt-2 [&_h3]:text-sm [&_h3]:font-medium [&_h3]:text-foreground [&_p]:mb-3 [&_strong]:font-medium [&_strong]:text-foreground">
              {children}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
