"use client";

import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, ArrowUpRight } from "lucide-react";
import Link from "next/link";

const categories = [
    { id: "all", label: "All" },
    { id: "prompts", label: "Prompts" },
    { id: "tools", label: "Tools" },
    { id: "tutorials", label: "Tutorials" },
];

const mockResources = [
    {
        id: 1,
        title: "Claude System Prompt Generator",
        description: "Generate effective system prompts for any use case with this interactive tool.",
        category: "tools",
        author: "AI Tools Co",
        tags: ["prompts", "generator", "developer-tools", "api"],
    },
    {
        id: 2,
        title: "Complete Claude API Guide",
        description: "Everything you need to know about integrating Claude into your applications.",
        category: "tutorials",
        author: "Developer Guide",
        tags: ["api", "integration", "developer", "guide"],
    },
    {
        id: 3,
        title: "Claude Prompt Library",
        description: "Over 100 tested prompts for coding, writing, analysis, and more.",
        category: "prompts",
        author: "Prompt Masters",
        tags: ["prompts", "library", "templates", "collection"],
    },
    {
        id: 4,
        title: "Claude Chrome Extension",
        description: "Access Claude anywhere on the web with this handy browser extension.",
        category: "tools",
        author: "Browser Tools",
        tags: ["extension", "browser", "chrome", "productivity"],
    },
    {
        id: 5,
        title: "Writing Better Fiction with Claude",
        description: "A comprehensive guide to using Claude for creative writing.",
        category: "tutorials",
        author: "Creative AI",
        tags: ["writing", "creative", "fiction", "guide"],
    },
    {
        id: 6,
        title: "Code Review Prompts Collection",
        description: "Specialized prompts for thorough code reviews.",
        category: "prompts",
        author: "DevPrompts",
        tags: ["code-review", "prompts", "developer", "quality"],
    },
];

const Resources = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState("all");
    const [selectedTag, setSelectedTag] = useState<string | null>(null);

    // Get all unique tags
    const allTags = Array.from(
        new Set(mockResources.flatMap((r) => r.tags || []))
    ).sort();

    const filteredResources = mockResources.filter((resource) => {
        const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (resource.tags || []).some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesCategory = activeCategory === "all" || resource.category === activeCategory;
        const matchesTag = !selectedTag || (resource.tags || []).includes(selectedTag);
        return matchesSearch && matchesCategory && matchesTag;
    });

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />
            <main className="flex-1">
                {/* Page Header */}
                <section className="py-8 border-b border-border">
                    <div className="container">
                        <h1 className="mb-2 text-lg font-medium text-foreground">
                            Resources
                        </h1>
                        <p className="mb-6 text-sm text-muted-foreground">
                            Discover prompts, tools, and tutorials for Claude AI
                        </p>

                        {/* Search */}
                        <div className="relative max-w-md">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search resources..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-10 bg-card border-border pl-10 text-sm"
                            />
                        </div>
                    </div>
                </section>

                {/* Filters & Resources */}
                <section className="py-8">
                    <div className="container">
                        {/* Category Filters */}
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

                        {/* Tag Filters */}
                        {allTags.length > 0 && (
                            <div className="mb-6">
                                <p className="text-xs text-muted-foreground mb-2">Filter by tags:</p>
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

                        {/* Results Count */}
                        <p className="mb-4 text-xs text-muted-foreground">
                            {filteredResources.length} resources
                        </p>

                        {/* Resources Grid */}
                        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                            {filteredResources.map((resource) => (
                                <Link
                                    key={resource.id}
                                    href={`/resources/${resource.id}`}
                                    className="group block rounded-lg border border-border bg-card p-4 transition-colors hover:bg-muted"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs text-muted-foreground mb-1 capitalize">{resource.category}</p>
                                            <h3 className="text-sm font-medium text-foreground mb-1">
                                                {resource.title}
                                            </h3>
                                            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                                                {resource.description}
                                            </p>
                                            {resource.tags && resource.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mb-2">
                                                    {resource.tags.slice(0, 3).map((tag) => (
                                                        <Badge
                                                            key={tag}
                                                            variant="outline"
                                                            className="text-xs"
                                                        >
                                                            #{tag}
                                                        </Badge>
                                                    ))}
                                                    {resource.tags.length > 3 && (
                                                        <span className="text-xs text-muted-foreground">
                                                            +{resource.tags.length - 3}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                            <p className="text-xs text-muted-foreground">
                                                by {resource.author}
                                            </p>
                                        </div>
                                        <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* Empty State */}
                        {filteredResources.length === 0 && (
                            <div className="py-16 text-center">
                                <p className="text-sm text-muted-foreground">
                                    No resources found.
                                </p>
                                <button
                                    className="mt-2 text-xs text-foreground hover:underline"
                                    onClick={() => {
                                        setSearchQuery("");
                                        setActiveCategory("all");
                                        setSelectedTag(null);
                                    }}
                                >
                                    Clear filters
                                </button>
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
