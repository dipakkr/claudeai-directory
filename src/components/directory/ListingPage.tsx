import { Suspense, type ReactNode } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import DiscoverListing from "@/components/directory/DiscoverListing";
import type { DirectoryItem, DirectoryType, SortKey } from "@/lib/directory";

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
  /** Which tab is active; defaults to the items' type. */
  type?: DirectoryType;
  title: string;
  description: string;
  /** Show "N listed." after the description. Off where the count is still small. */
  showCount?: boolean;
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
  type,
  title,
  description,
  showCount = true,
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
        {/* useSearchParams in the listing needs a Suspense boundary. */}
        <Suspense>
          <DiscoverListing
            type={type ?? items[0]?.type ?? "skill"}
            title={title}
            description={showCount && items.length > 0 ? `${description} ${items.length} listed.` : description}
            items={items}
            orders={orders}
            searchPlaceholder={searchPlaceholder}
            initialCategory={initialCategory}
            initialQuery={initialQuery}
            emptyMessage={emptyMessage}
          />
        </Suspense>

        {children && (
          <section className="mx-auto mt-4 max-w-[1000px] px-4 md:px-8">
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
