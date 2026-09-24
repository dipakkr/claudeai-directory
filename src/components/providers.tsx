"use client";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth";
import OnboardingModal from "@/components/onboarding/OnboardingModal";
import AdvertiseDialog from "@/components/advertise/AdvertiseDialog";
import { CommandMenuProvider } from "@/components/layout/CommandMenu";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { useState } from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient());

    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
                <AuthProvider>
                    <TooltipProvider>
                        <CommandMenuProvider>
                            {children}
                        </CommandMenuProvider>
                        <OnboardingModal />
                        <AdvertiseDialog />
                        <Toaster />
                        <Sonner />
                    </TooltipProvider>
                </AuthProvider>
            </ThemeProvider>
        </QueryClientProvider>
    );
}
