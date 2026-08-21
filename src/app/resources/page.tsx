"use client";

import { useMemo, useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useResources } from "@/hooks/use-resources";
import { useDebounce } from "@/hooks/use-debounce";

const categories = [
    { id: "all", label: "All" },
    { id: "article", label: "Articles" },
    { id: "guide", label: "Guides" },
    { id: "tool", label: "Tools" },
    { id: "video", label: "Videos" },
    { id: "repo", label: "Repos" },
];

function initials(name?: string | null) {
    if (!name) return "?";
    // Strip a trailing "(@handle)" so initials come from the person's name.
    const clean = name.replace(/\s*\(@[^)]+\)\s*$/, "").trim();
    return clean.split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "?";
}

const Resources = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState("all");
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const debouncedSearch = useDebounce(searchQuery, 300);

    const { data: resources = [], isLoading } = useResources({
        search: debouncedSearch || undefined,
        category: activeCategory === "all" ? undefined : activeCategory,
        tag: selectedTag || undefined,
        limit: 100,
    });

    const allTags = useMemo(
        () => Array.from(new Set(resources.flatMap((r) => r.tags || []))).sort(),
        [resources]
    );

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />
            <main className="flex-1">
                <section className="py-8 border-b border-border">
                    <div className="container">
                        <h1 className="mb-2 text-lg font-medium text-foreground">Resources</h1>
                        <p className="mb-6 text-sm text-muted-foreground">
                            Hand-picked articles, tools and guides for working with Claude — plus
                            the best of what the community shares.
                        </p>

                        <div className="flex flex-wrap items-center gap-3">
                            <div className="relative max-w-md flex-1 min-w-[220px]">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Search resources..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="h-10 bg-card border-border pl-10 text-sm"
                                />
                            </div>
                            <Link
                                href="/submit"
                                className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90"
                            >
                                Submit a resource
                            </Link>
                        </div>
                    </div>
                </section>

                <section className="py-8">
                    <div className="container">
                        <div className="mb-4 flex flex-wrap gap-2">
                            {categories.map((category) => (
                                <button
                                    key={category.id}
                                    onClick={() => {
                                        setActiveCategory(category.id);
                                        setSelectedTag(null);
                                    }}
                                    className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${activeCategory === category.id
                                        ? "bg-foreground text-background border-foreground"
                                        : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground"
                                        }`}
                                >
                                    {category.label}
                                </button>
                            ))}
                        </div>

                        {isLoading ? (
                            <p className="text-xs text-muted-foreground">Loading resources…</p>
                        ) : resources.length === 0 ? (
                            <div className="rounded-lg border border-dashed border-border p-8 text-center">
                                <p className="text-sm text-foreground mb-1">Nothing here yet</p>
                                <p className="text-xs text-muted-foreground mb-4">
                                    {searchQuery || selectedTag || activeCategory !== "all"
                                        ? "No resources match those filters."
                                        : "Be the first to share something useful."}
                                </p>
                                <Link href="/submit" className="text-xs text-primary hover:underline">
                                    Submit a resource →
                                </Link>
                            </div>
                        ) : (
                            <>
                                <p className="mb-4 text-xs text-muted-foreground">
                                    {resources.length} {resources.length === 1 ? "resource" : "resources"}
                                </p>

                                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                    {resources.map((resource) => (
                                        <div
                                            key={resource.id}
                                            className="group rounded-lg border border-border bg-card p-4 transition-colors hover:bg-muted"
                                        >
                                            {resource.cover_image && (
                                                <Link
                                                    href={`/resources/${resource.id}`}
                                                    className="mb-3 block overflow-hidden rounded-md border border-border"
                                                >
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img
                                                        src={resource.cover_image}
                                                        alt=""
                                                        loading="lazy"
                                                        className="aspect-[16/9] w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                                                    />
                                                </Link>
                                            )}

                                            <div className="flex items-start justify-between gap-2">
                                                <div className="min-w-0 flex-1">
                                                    <div className="mb-1 flex items-center gap-2">
                                                        <p className="text-xs text-muted-foreground capitalize">
                                                            {resource.category}
                                                        </p>
                                                        {resource.curated && (
                                                            <Badge variant="secondary" className="text-[10px]">
                                                                Editor pick
                                                            </Badge>
                                                        )}
                                                    </div>

                                                    <h3 className="text-sm font-medium text-foreground mb-1">
                                                        <Link
                                                            href={`/resources/${resource.id}`}
                                                            className="hover:underline"
                                                        >
                                                            {resource.title}
                                                        </Link>
                                                    </h3>

                                                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                                                        {resource.description}
                                                    </p>

                                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                        <Avatar className="h-5 w-5 shrink-0">
                                                            {resource.author_avatar && (
                                                                <AvatarImage
                                                                    src={resource.author_avatar}
                                                                    alt={resource.author || "Author"}
                                                                />
                                                            )}
                                                            <AvatarFallback className="text-[9px]">
                                                                {initials(resource.author)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <span className="truncate">
                                                            {resource.author ? (
                                                                resource.author_url ? (
                                                                    <a
                                                                        href={resource.author_url}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="text-foreground hover:underline"
                                                                    >
                                                                        {resource.author}
                                                                    </a>
                                                                ) : (
                                                                    resource.author
                                                                )
                                                            ) : (
                                                                "Community"
                                                            )}
                                                            {resource.source ? ` · ${resource.source}` : ""}
                                                            {resource.upvotes > 0 ? ` · ${resource.upvotes} upvotes` : ""}
                                                        </span>
                                                    </div>
                                                </div>

                                                <Link
                                                    href={`/resources/${resource.id}`}
                                                    aria-label={`Read ${resource.title}`}
                                                    className="shrink-0"
                                                >
                                                    <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground" />
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        {allTags.length > 0 && (
                            <div className="mt-10 border-t border-border pt-6">
                                <p className="text-xs text-muted-foreground mb-2">Browse by tag</p>
                                <div className="flex flex-wrap gap-2">
                                    {allTags.map((tag) => (
                                        <button
                                            key={tag}
                                            onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                                            className={`px-2 py-1 text-xs rounded-md border transition-colors ${selectedTag === tag
                                                ? "bg-primary text-primary-foreground border-primary"
                                                : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground"
                                                }`}
                                        >
                                            #{tag}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
};

export default Resources;
