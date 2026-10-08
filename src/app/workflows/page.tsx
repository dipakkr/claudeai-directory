import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, FileText, Briefcase, Code2 } from "lucide-react";

// Orphan placeholder: its counts are not real and its category pages do not exist,
// so the cards are not links. Kept out of search until it is rebuilt or removed.
export const metadata: Metadata = {
  title: "Claude Workflows",
  robots: { index: false, follow: false },
  alternates: { canonical: "/workflows" },
};

const workflowCategories = [
    {
        title: "Automation Workflows",
        description: "Automate repetitive tasks and boost efficiency",
        icon: Zap,
        count: "45 workflows",
    },
    {
        title: "Content Creation",
        description: "Streamline your content creation process",
        icon: FileText,
        count: "32 workflows",
    },
    {
        title: "Development Workflows",
        description: "Enhance your development process with AI",
        icon: Code2,
        count: "28 workflows",
    },
    {
        title: "Business Automation",
        description: "Automate business processes and operations",
        icon: Briefcase,
        count: "22 workflows",
    },
];

const Workflows = () => {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />
            <main className="flex-1">
                <div className="border-b border-border">
                    <div className="container py-12">
                        <h1 className="text-3xl md:text-4xl font-medium text-foreground mb-4">
                            Claude AI Workflows
                        </h1>
                        <p className="text-base text-muted-foreground max-w-2xl">
                            Discover powerful workflows to automate tasks, create content, and supercharge your productivity.
                            Each workflow is tested and ready to use.
                        </p>
                    </div>
                </div>

                <div className="container py-12">
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {workflowCategories.map((category) => {
                            const Icon = category.icon;
                            return (
                                <div key={category.title}>
                                    <Card className="h-full">
                                        <CardHeader>
                                            <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center mb-3">
                                                <Icon className="h-5 w-5 text-primary" />
                                            </div>
                                            <CardTitle className="text-lg">{category.title}</CardTitle>
                                            <CardDescription>{category.description}</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-xs text-muted-foreground">{category.count}</p>
                                        </CardContent>
                                    </Card>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Workflows;
