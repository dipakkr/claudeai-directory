import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Workflow, Zap, FileText, Briefcase, Code2 } from "lucide-react";

const workflowCategories = [
    {
        title: "Automation Workflows",
        description: "Automate repetitive tasks and boost efficiency",
        icon: Zap,
        href: "/workflows/automation",
        count: "45 workflows",
    },
    {
        title: "Content Creation",
        description: "Streamline your content creation process",
        icon: FileText,
        href: "/workflows/content",
        count: "32 workflows",
    },
    {
        title: "Development Workflows",
        description: "Enhance your development process with AI",
        icon: Code2,
        href: "/workflows/development",
        count: "28 workflows",
    },
    {
        title: "Business Automation",
        description: "Automate business processes and operations",
        icon: Briefcase,
        href: "/workflows/business",
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
                                <Link key={category.title} href={category.href}>
                                    <Card className="h-full hover:bg-muted transition-colors">
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
                                </Link>
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
