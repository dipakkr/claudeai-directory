"use client";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth";
import { SignInProvider } from "@/components/auth/SignInDialog";
import OnboardingModal from "@/components/onboarding/OnboardingModal";
import VisitorInvitation from "@/components/engagement/VisitorInvitation";
import AdvertiseDialog from "@/components/advertise/AdvertiseDialog";
import { CommandMenuProvider } from "@/components/layout/CommandMenu";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import type { Reach } from "@/components/advertise/SponsorReach";
import { useState } from "react";

export default function Providers({ children, initialReach }: { children: React.ReactNode; initialReach?: Reach | null }) {
    const [queryClient] = useState(() => {
        const client = new QueryClient();
        if (initialReach) {
            const updatedAt = Date.parse(initialReach.updated_at ?? "");
            client.setQueryData(["stats", "open", 7], initialReach, { updatedAt: Number.isFinite(updatedAt) ? updatedAt : 0 });
        }
        return client;
    });

    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
                <AuthProvider>
                    <SignInProvider>
                        <TooltipProvider>
                            <CommandMenuProvider>
                                {children}
                            </CommandMenuProvider>
                            <OnboardingModal />
                            <AdvertiseDialog />
                            <VisitorInvitation />
                            <Toaster />
                            <Sonner />
                        </TooltipProvider>
                    </SignInProvider>
                </AuthProvider>
            </ThemeProvider>
        </QueryClientProvider>
    );
}
