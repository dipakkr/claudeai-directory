"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

/** AuthProvider consumes the fragment before starting any identity request. */
export default function ViewAsClient() {
  const { viewOnly, viewExpired } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (viewOnly) router.replace("/dashboard");
  }, [viewOnly, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 text-center text-sm text-muted-foreground">
      {viewExpired ? "This view link could not be opened. Open View as again from the admin." : "Opening the member's view..."}
    </div>
  );
}
