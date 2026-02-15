"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import PageBreadcrumb from "@/components/layout/PageBreadcrumb";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useCreateFeedPost } from "@/hooks/use-feed";

const SubmitResource = () => {
    const router = useRouter();
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const createPost = useCreateFeedPost();
    const [formData, setFormData] = useState({
        title: "",
        url: "",
        description: "",
    });

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            toast.error("Sign in to submit a post");
            router.push("/login");
        }
    }, [authLoading, isAuthenticated, router]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title || !formData.url || !formData.description) {
            toast.error("Please fill in all required fields");
            return;
        }

        createPost.mutate(formData, {
            onSuccess: () => {
                toast.success("Post submitted!");
                router.push("/feed");
            },
            onError: () => {
                toast.error("Failed to submit. Please try again.");
            },
        });
    };

    const handleChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    if (authLoading) return null;

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />
            <main className="flex-1">
                <div className="container py-8 max-w-lg">
                    <PageBreadcrumb items={[
                        { label: "Feed", href: "/feed" },
                        { label: "Submit" },
                    ]} />
                    <div className="mb-6">
                        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs text-primary mb-4">
                            <Sparkles className="h-3 w-3" />
                            <span>Share with the community</span>
                        </div>
                        <h1 className="text-xl font-semibold text-foreground mb-2">
                            Submit a Post
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Share a link, tool, or resource with the Claude community.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="title" className="text-sm">
                                Title <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="title"
                                placeholder="e.g., New Claude API feature"
                                value={formData.title}
                                onChange={(e) => handleChange("title", e.target.value)}
                                className="text-sm"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="url" className="text-sm">
                                URL <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="url"
                                type="url"
                                placeholder="https://..."
                                value={formData.url}
                                onChange={(e) => handleChange("url", e.target.value)}
                                className="text-sm"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-sm">
                                Description <span className="text-destructive">*</span>
                            </Label>
                            <Textarea
                                id="description"
                                placeholder="Brief description of what you're sharing..."
                                value={formData.description}
                                onChange={(e) => handleChange("description", e.target.value)}
                                className="text-sm min-h-[100px]"
                                required
                            />
                        </div>

                        <div className="flex gap-3 pt-2">
                            <Button type="submit" size="sm" className="text-sm" disabled={createPost.isPending}>
                                {createPost.isPending ? "Submitting..." : "Submit Post"}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => router.push("/feed")}
                                className="text-sm"
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default SubmitResource;
