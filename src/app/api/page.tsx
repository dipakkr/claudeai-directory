import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Code, Key, BookOpen, Zap, Shield, ArrowRight } from "lucide-react";
import Link from "next/link";

const guideSections = [
    {
        title: "Getting Started",
        description: "Learn the basics of the Claude API",
        icon: Zap,
        href: "/api/getting-started",
        topics: ["Authentication", "First API call", "Rate limits", "Error handling"]
    },
    {
        title: "Authentication",
        description: "Set up API keys and secure your requests",
        icon: Key,
        href: "/api/authentication",
        topics: ["API keys", "Security best practices", "Key rotation", "Environment variables"]
    },
    {
        title: "Making Requests",
        description: "Send requests and handle responses",
        icon: Code,
        href: "/api/requests",
        topics: ["REST API", "Request format", "Response handling", "Streaming"]
    },
    {
        title: "Best Practices",
        description: "Optimize your API usage",
        icon: BookOpen,
        href: "/api/best-practices",
        topics: ["Cost optimization", "Performance", "Error handling", "Rate limiting"]
    },
    {
        title: "Integration Examples",
        description: "Real-world code examples",
        icon: Code,
        href: "/api/integration",
        topics: ["Python", "JavaScript", "Node.js", "React"]
    },
    {
        title: "Security & Privacy",
        description: "Keep your data safe",
        icon: Shield,
        href: "/api/security",
        topics: ["Data privacy", "Encryption", "Compliance", "Audit logs"]
    }
];

const APIGuide = () => {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />
            <main className="flex-1">
                <div className="border-b border-border">
                    <div className="container py-12">
                        <h1 className="text-3xl md:text-4xl font-medium text-foreground mb-4">
                            Claude API Guide
                        </h1>
                        <p className="text-base text-muted-foreground max-w-2xl">
                            Complete guide to using the Claude API. Learn how to integrate Claude into your applications,
                            build AI agents, and maximize productivity.
                        </p>
                    </div>
                </div>

                <div className="container py-12">
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {guideSections.map((section) => {
                            const Icon = section.icon;
                            return (
                                <Link key={section.title} href={section.href}>
                                    <Card className="h-full hover:bg-muted transition-colors">
                                        <CardHeader>
                                            <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center mb-3">
                                                <Icon className="h-5 w-5 text-primary" />
                                            </div>
                                            <CardTitle className="text-lg">{section.title}</CardTitle>
                                            <CardDescription>{section.description}</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-2">
                                                {section.topics.map((topic) => (
                                                    <div key={topic} className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <ArrowRight className="h-3 w-3" />
                                                        <span>{topic}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Quick Start Code Example */}
                <div className="container pb-12">
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Start Example</CardTitle>
                            <CardDescription>Get started with Claude API in minutes</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-muted rounded-lg p-4 overflow-x-auto">
                                <pre className="text-sm font-mono">
                                    {`import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const message = await anthropic.messages.create({
  model: "claude-3-5-sonnet-20241022",
  max_tokens: 1024,
  messages: [{
    role: "user",
    content: "Hello, Claude!"
  }]
});

console.log(message.content);`}
                                </pre>
                            </div>
                            <div className="mt-4 flex gap-2">
                                <Badge variant="outline">JavaScript/TypeScript</Badge>
                                <Badge variant="outline">Node.js</Badge>
                                <Badge variant="outline">SDK</Badge>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default APIGuide;
