"use client";

import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calculator, TrendingDown, TrendingUp, Search } from "lucide-react";
import { apiPricing, compareProviders } from "@/data/apiPricing";

const CompareCost = () => {
    const [inputTokens, setInputTokens] = useState(10000);
    const [outputTokens, setOutputTokens] = useState(2000);
    const [searchQuery, setSearchQuery] = useState("");

    const comparisons = compareProviders(inputTokens, outputTokens, searchQuery).slice(0, 50);

    const formatCost = (cost: number) => {
        if (cost < 0.01) return `$${cost.toFixed(4)}`;
        if (cost < 1) return `$${cost.toFixed(3)}`;
        return `$${cost.toFixed(2)}`;
    };

    const cheapest = comparisons.length > 0 ? comparisons[0] : null;
    const mostExpensive = comparisons.length > 0 ? comparisons[comparisons.length - 1] : null;

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />
            <main className="flex-1">
                <div className="border-b border-border">
                    <div className="container py-12">
                        <h1 className="text-3xl md:text-4xl font-medium text-foreground mb-4">
                            API Cost Calculator & Features
                        </h1>
                        <p className="text-base text-muted-foreground max-w-2xl">
                            Compare API costs across different providers dynamically. Enter your expected token usage and search models to see their features and which provider offers the best value.
                        </p>
                    </div>
                </div>

                <div className="container py-12">
                    <div className="grid gap-8 lg:grid-cols-3">
                        {/* Calculator */}
                        <div className="lg:col-span-1">
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Calculator className="h-5 w-5 text-primary" />
                                        <CardTitle>Calculate Cost</CardTitle>
                                    </div>
                                    <CardDescription>
                                        Enter your expected token usage
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label htmlFor="input-tokens" className="text-sm">Input Tokens</Label>
                                        <Input
                                            id="input-tokens"
                                            type="number"
                                            value={inputTokens}
                                            onChange={(e) => setInputTokens(Number(e.target.value))}
                                            className="mt-1"
                                        />
                                        <p className="text-xs text-muted-foreground mt-1">
                                            ≈ {Math.round(inputTokens / 4)} words
                                        </p>
                                    </div>
                                    <div>
                                        <Label htmlFor="output-tokens" className="text-sm">Output Tokens</Label>
                                        <Input
                                            id="output-tokens"
                                            type="number"
                                            value={outputTokens}
                                            onChange={(e) => setOutputTokens(Number(e.target.value))}
                                            className="mt-1"
                                        />
                                        <p className="text-xs text-muted-foreground mt-1">
                                            ≈ {Math.round(outputTokens / 4)} words
                                        </p>
                                    </div>
                                    <div className="pt-4 border-t">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">Total Tokens</span>
                                            <span className="font-medium text-foreground">
                                                {(inputTokens + outputTokens).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Quick Stats */}
                            <Card className="mt-4">
                                <CardHeader>
                                    <CardTitle className="text-sm">Quick Stats</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {cheapest && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-muted-foreground">Cheapest</span>
                                            <div className="flex items-center gap-2">
                                                <TrendingDown className="h-3 w-3 text-green-500" />
                                                <span className="text-sm font-medium">{cheapest.provider} {cheapest.model.substring(0, 15)}{cheapest.model.length > 15 ? '...' : ''}</span>
                                            </div>
                                        </div>
                                    )}
                                    {mostExpensive && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-muted-foreground">Most Expensive</span>
                                            <div className="flex items-center gap-2">
                                                <TrendingUp className="h-3 w-3 text-red-500" />
                                                <span className="text-sm font-medium">{mostExpensive.provider} {mostExpensive.model.substring(0, 15)}{mostExpensive.model.length > 15 ? '...' : ''}</span>
                                            </div>
                                        </div>
                                    )}
                                    {cheapest && mostExpensive && cheapest.cost > 0 && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-muted-foreground">Price Difference</span>
                                            <span className="text-sm font-medium">
                                                {((mostExpensive.cost / cheapest.cost - 1) * 100).toFixed(1)}%
                                            </span>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Comparison Table */}
                        <div className="lg:col-span-2">
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle>Cost Comparison & Features</CardTitle>
                                            <CardDescription>
                                                Top 50 matches sorted by cost
                                            </CardDescription>
                                        </div>
                                        <div className="relative w-64">
                                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                type="search"
                                                placeholder="Search models..."
                                                className="pl-8"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {comparisons.length === 0 ? (
                                        <div className="text-center py-8 text-muted-foreground">
                                            No models found.
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Provider & Model</TableHead>
                                                        <TableHead>Features</TableHead>
                                                        <TableHead className="text-right">Total Cost</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {comparisons.map((comparison, index) => {
                                                        const isCheapest = index === 0;
                                                        const isExpensive = index === comparisons.length - 1 && comparisons.length > 1;

                                                        return (
                                                            <TableRow key={`${comparison.provider}-${comparison.model}-${index}`}>
                                                                <TableCell>
                                                                    <div className="flex flex-col gap-1">
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="font-medium">{comparison.provider}</span>
                                                                            {isCheapest && (
                                                                                <Badge variant="outline" className="text-xs bg-green-500/10 text-green-500 border-green-500/20">
                                                                                    Best Value
                                                                                </Badge>
                                                                            )}
                                                                        </div>
                                                                        <span className="text-muted-foreground text-sm">
                                                                            {comparison.model}
                                                                        </span>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <div className="flex flex-wrap gap-1">
                                                                        {comparison.features && comparison.features.length > 0 ? (
                                                                            comparison.features.map((f, i) => (
                                                                                <Badge key={i} variant="secondary" className="text-[10px] px-1.5 py-0 whitespace-nowrap">
                                                                                    {f}
                                                                                </Badge>
                                                                            ))
                                                                        ) : (
                                                                            <span className="text-xs text-muted-foreground">-</span>
                                                                        )}
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell className="text-right">
                                                                    <span className={`font-medium ${isCheapest ? 'text-green-500' : isExpensive ? 'text-red-500' : ''}`}>
                                                                        {formatCost(comparison.cost)}
                                                                    </span>
                                                                </TableCell>
                                                            </TableRow>
                                                        );
                                                    })}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Pricing Details */}
                            <Card className="mt-6">
                                <CardHeader>
                                    <CardTitle className="text-sm">Pricing Details (per 1M tokens) - Top Results</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        {comparisons.slice(0, 10).map((comparison, index) => {
                                            const pricing = apiPricing.find(
                                                p => p.provider === comparison.provider && p.model === comparison.model
                                            );
                                            if (!pricing) return null;

                                            return (
                                                <div key={`${pricing.provider}-${pricing.model}-${index}`} className="border rounded-lg p-3">
                                                    <div className="flex items-center justify-between mb-2 gap-2">
                                                        <span className="text-sm font-medium truncate" title={pricing.provider}>{pricing.provider}</span>
                                                        <Badge variant="secondary" className="text-[10px] truncate max-w-[120px]" title={pricing.model}>
                                                            {pricing.model}
                                                        </Badge>
                                                    </div>
                                                    <div className="space-y-1 text-xs text-muted-foreground">
                                                        <div className="flex justify-between">
                                                            <span>Input:</span>
                                                            <span className="text-foreground">${pricing.inputPrice.toFixed(2)}/1M</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span>Output:</span>
                                                            <span className="text-foreground">${pricing.outputPrice.toFixed(2)}/1M</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span>Context:</span>
                                                            <span className="text-foreground">{(pricing.contextWindow / 1000).toFixed(0)}K</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default CompareCost;

