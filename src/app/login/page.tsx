"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { useAuth } from "@/lib/auth";

const Login = () => {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      // New accounts finish the short "Meet the community" step in a modal on
      // whatever page they land on, so everyone goes home here.
      router.push("/");
    }
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="flex items-center justify-center px-4 py-32">
        <div className="w-full max-w-sm text-center">
          <p className="text-base text-muted-foreground mb-8 leading-relaxed">
            Join the growing Claude<br />
            community and learn together.
          </p>
          <GoogleSignInButton width={360} />
        </div>
      </main>
    </div>
  );
};

export default Login;
