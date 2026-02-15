"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Star,
    ExternalLink,
    Share2,
    Twitter,
    Facebook,
    Linkedin,
    Copy,
    Calendar,
    User,
    TrendingUp,
    Bookmark
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import PageBreadcrumb from "@/components/layout/PageBreadcrumb";

// Mock data - in production this would come from an API
const mockResource = {
    id: 1,
    title: "Claude System Prompt Generator",
    description: "Generate effective system prompts for any use case with this interactive tool. Perfect for developers, content creators, and AI enthusiasts who want to get the most out of Claude AI.",
    longDescription: "This comprehensive tool helps you create powerful system prompts that guide Claude's behavior and responses. Whether you're building applications, creating content, or automating workflows, this generator provides templates and best practices for crafting prompts that deliver consistent, high-quality results.",
    category: "tools",
    author: "AI Tools Co",
    authorUrl: "https://example.com",
    url: "https://example.com/claude-prompt-generator",
    tags: ["prompts", "generator", "developer-tools", "api"],
    rating: 4.7,
    reviewCount: 124,
    views: 15420,
    bookmarks: 892,
    createdAt: "2024-01-15",
    updatedAt: "2024-11-20",
    featured: true,
};

const mockReviews = [
    {
        id: 1,
        author: "Sarah Chen",
        rating: 5,
        comment: "This tool saved me hours of work! The prompt templates are incredibly useful.",
        date: "2 days ago",
    },
    {
        id: 2,
        author: "Mike Johnson",
        rating: 4,
        comment: "Great resource, but could use more examples for specific use cases.",
        date: "5 days ago",
    },
    {
        id: 3,
        author: "Alex Rivera",
        rating: 5,
        comment: "Best prompt generator I've found. Highly recommend!",
        date: "1 week ago",
    },
];

const ResourceDetail = () => {
    const params = useParams();
    const id = params?.id;
    const [isBookmarked, setIsBookmarked] = useState(false);

    // In a real app, you'd fetch data based on `id`
    console.log("Resource ID:", id);

    const handleShare = (platform: string) => {
        const url = window.location.href;
        const title = mockResource.title;

        let shareUrl = "";
        switch (platform) {
            case "twitter":
                shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
                break;
            case "facebook":
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
                break;
            case "linkedin":
                shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
                break;
            case "copy":
                navigator.clipboard.writeText(url);
                toast.success("Link copied to clipboard!");
                return;
        }

        if (shareUrl) {
            window.open(shareUrl, "_blank", "width=600,height=400");
        }
    };

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }).map((_, i) => (
            <Star
                key={i}
                className={`h-4 w-4 ${i < Math.floor(rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : i < rating
                            ? "fill-yellow-200 text-yellow-200"
                            : "text-muted-foreground"
                    }`}
            />
        ));
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />
            <main className="flex-1">
                <div className="container py-8">
                    <PageBreadcrumb items={[
                        { label: "Resources", href: "/resources" },
                        { label: mockResource.title },
                    ]} />
                    <div className="grid gap-8 lg:grid-cols-3">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Header */}
                            <div>
                                <div className="flex items-start justify-between gap-4 mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Badge variant="secondary" className="text-xs">
                                                {mockResource.category}
                                            </Badge>
                                            {mockResource.featured && (
                                                <Badge className="text-xs bg-primary">Featured</Badge>
                                            )}
                                        </div>
                                        <h1 className="text-2xl md:text-3xl font-medium text-foreground mb-3">
                                            {mockResource.title}
                                        </h1>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <User className="h-4 w-4" />
                                                <span>by {mockResource.author}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-4 w-4" />
                                                <span>Updated {mockResource.updatedAt}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Rating & Stats */}
                                <div className="flex items-center gap-6 mb-6">
                                    <div className="flex items-center gap-2">
                                        {renderStars(mockResource.rating)}
                                        <span className="text-sm font-medium text-foreground">
                                            {mockResource.rating}
                                        </span>
                                        <span className="text-sm text-muted-foreground">
                                            ({mockResource.reviewCount} reviews)
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                        <TrendingUp className="h-4 w-4" />
                                        <span>{mockResource.views.toLocaleString()} views</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                        <Bookmark className="h-4 w-4" />
                                        <span>{mockResource.bookmarks} bookmarks</span>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-wrap gap-3 mb-6">
                                    <Button
                                        size="sm"
                                        onClick={() => window.open(mockResource.url, "_blank")}
                                        className="text-xs"
                                    >
                                        Visit Resource
                                        <ExternalLink className="ml-2 h-3 w-3" />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setIsBookmarked(!isBookmarked)}
                                        className="text-xs"
                                    >
                                        <Bookmark
                                            className={`mr-2 h-3 w-3 ${isBookmarked ? "fill-current" : ""
                                                }`}
                                        />
                                        {isBookmarked ? "Bookmarked" : "Bookmark"}
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleShare("copy")}
                                        className="text-xs"
                                    >
                                        <Share2 className="mr-2 h-3 w-3" />
                                        Share
                                    </Button>
                                </div>

                                {/* Tags */}
                                <div className="flex flex-wrap gap-2">
                                    {mockResource.tags.map((tag) => (
                                        <Badge
                                            key={tag}
                                            variant="outline"
                                            className="text-xs"
                                        >
                                            #{tag}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            <Separator />

                            {/* Description */}
                            <div>
                                <h2 className="text-sm font-medium text-foreground mb-3">
                                    About this resource
                                </h2>
                                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                                    {mockResource.description}
                                </p>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {mockResource.longDescription}
                                </p>
                            </div>

                            <Separator />

                            {/* Reviews */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-sm font-medium text-foreground">
                                        Reviews ({mockResource.reviewCount})
                                    </h2>
                                    <Button variant="outline" size="sm" className="text-xs">
                                        Write a Review
                                    </Button>
                                </div>

                                <div className="space-y-4">
                                    {mockReviews.map((review) => (
                                        <div
                                            key={review.id}
                                            className="rounded-lg border border-border bg-card p-4"
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <p className="text-sm font-medium text-foreground">
                                                        {review.author}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {review.date}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    {renderStars(review.rating)}
                                                </div>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                {review.comment}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Share Section */}
                            <div className="rounded-lg border border-border bg-card p-4">
                                <h3 className="text-sm font-medium text-foreground mb-3">
                                    Share this resource
                                </h3>
                                <div className="grid grid-cols-2 gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleShare("twitter")}
                                        className="text-xs"
                                    >
                                        <Twitter className="mr-2 h-3 w-3" />
                                        Twitter
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleShare("facebook")}
                                        className="text-xs"
                                    >
                                        <Facebook className="mr-2 h-3 w-3" />
                                        Facebook
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleShare("linkedin")}
                                        className="text-xs"
                                    >
                                        <Linkedin className="mr-2 h-3 w-3" />
                                        LinkedIn
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleShare("copy")}
                                        className="text-xs"
                                    >
                                        <Copy className="mr-2 h-3 w-3" />
                                        Copy Link
                                    </Button>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="rounded-lg border border-border bg-card p-4">
                                <h3 className="text-sm font-medium text-foreground mb-3">
                                    Statistics
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-muted-foreground">Rating</span>
                                        <span className="text-sm font-medium text-foreground">
                                            {mockResource.rating}/5.0
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-muted-foreground">Reviews</span>
                                        <span className="text-sm font-medium text-foreground">
                                            {mockResource.reviewCount}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-muted-foreground">Views</span>
                                        <span className="text-sm font-medium text-foreground">
                                            {mockResource.views.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-muted-foreground">Bookmarks</span>
                                        <span className="text-sm font-medium text-foreground">
                                            {mockResource.bookmarks}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Related Resources */}
                            <div className="rounded-lg border border-border bg-card p-4">
                                <h3 className="text-sm font-medium text-foreground mb-3">
                                    Related Resources
                                </h3>
                                <div className="space-y-2">
                                    <Link
                                        href="/resources/2"
                                        className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        Complete Claude API Guide
                                    </Link>
                                    <Link
                                        href="/resources/3"
                                        className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        Claude Prompt Library
                                    </Link>
                                    <Link
                                        href="/resources/4"
                                        className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        Building AI Agents with Claude
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default ResourceDetail;
