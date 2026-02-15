"use client";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth";
import { CommandMenuProvider } from "@/components/layout/CommandMenu";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient());

    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <TooltipProvider>
                    <CommandMenuProvider>
                        {children}
                    </CommandMenuProvider>
                    <Toaster />
                    <Sonner />
                </TooltipProvider>
            </AuthProvider>
        </QueryClientProvider>
    );
}
