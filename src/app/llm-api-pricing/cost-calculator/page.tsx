"use client";

import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calculator, TrendingDown, TrendingUp, DollarSign } from "lucide-react";
import { apiPricing, calculateCost, compareProviders } from "@/data/apiPricing";

const CompareCost = () => {
    const [inputTokens, setInputTokens] = useState(10000);
    const [outputTokens, setOutputTokens] = useState(2000);

    const comparisons = compareProviders(inputTokens, outputTokens);

    const formatCost = (cost: number) => {
        if (cost < 0.01) return `$${cost.toFixed(4)}`;
        if (cost < 1) return `$${cost.toFixed(3)}`;
        return `$${cost.toFixed(2)}`;
    };

    const cheapest = comparisons[0];
    const mostExpensive = comparisons[comparisons.length - 1];

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />
            <main className="flex-1">
                <div className="border-b border-border">
                    <div className="container py-12">
                        <h1 className="text-3xl md:text-4xl font-medium text-foreground mb-4">
                            API Cost Calculator
                        </h1>
                        <p className="text-base text-muted-foreground max-w-2xl">
                            Compare API costs across different providers. Enter your expected token usage to see which provider offers the best value.
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
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-muted-foreground">Cheapest</span>
                                        <div className="flex items-center gap-2">
                                            <TrendingDown className="h-3 w-3 text-green-500" />
                                            <span className="text-sm font-medium">{cheapest.provider} {cheapest.model}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-muted-foreground">Most Expensive</span>
                                        <div className="flex items-center gap-2">
                                            <TrendingUp className="h-3 w-3 text-red-500" />
                                            <span className="text-sm font-medium">{mostExpensive.provider} {mostExpensive.model}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-muted-foreground">Price Difference</span>
                                        <span className="text-sm font-medium">
                                            {((mostExpensive.cost / cheapest.cost - 1) * 100).toFixed(1)}%
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Comparison Table */}
                        <div className="lg:col-span-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Cost Comparison</CardTitle>
                                    <CardDescription>
                                        Sorted by total cost (cheapest first)
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Provider</TableHead>
                                                <TableHead>Model</TableHead>
                                                <TableHead className="text-right">Input Cost</TableHead>
                                                <TableHead className="text-right">Output Cost</TableHead>
                                                <TableHead className="text-right">Total Cost</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {comparisons.map((comparison, index) => {
                                                const pricing = apiPricing.find(
                                                    p => p.provider === comparison.provider && p.model === comparison.model
                                                );
                                                if (!pricing) return null;

                                                const inputCost = (inputTokens / 1_000_000) * pricing.inputPrice;
                                                const outputCost = (outputTokens / 1_000_000) * pricing.outputPrice;
                                                const isCheapest = index === 0;
                                                const isExpensive = index === comparisons.length - 1;

                                                return (
                                                    <TableRow key={`${comparison.provider}-${comparison.model}`}>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-medium">{comparison.provider}</span>
                                                                {isCheapest && (
                                                                    <Badge variant="outline" className="text-xs bg-green-500/10 text-green-500 border-green-500/20">
                                                                        Best Value
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-muted-foreground">
                                                            {comparison.model}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            {formatCost(inputCost)}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            {formatCost(outputCost)}
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
                                </CardContent>
                            </Card>

                            {/* Pricing Details */}
                            <Card className="mt-6">
                                <CardHeader>
                                    <CardTitle className="text-sm">Pricing Details (per 1M tokens)</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        {apiPricing.map((pricing) => (
                                            <div key={`${pricing.provider}-${pricing.model}`} className="border rounded-lg p-3">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-sm font-medium">{pricing.provider}</span>
                                                    <Badge variant="secondary" className="text-xs">
                                                        {pricing.model}
                                                    </Badge>
                                                </div>
                                                <div className="space-y-1 text-xs text-muted-foreground">
                                                    <div className="flex justify-between">
                                                        <span>Input:</span>
                                                        <span className="text-foreground">${pricing.inputPrice}/1M</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>Output:</span>
                                                        <span className="text-foreground">${pricing.outputPrice}/1M</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>Context:</span>
                                                        <span className="text-foreground">{(pricing.contextWindow / 1000).toFixed(0)}K</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
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
