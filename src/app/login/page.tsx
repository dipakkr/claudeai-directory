"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: Record<string, unknown>) => void;
          renderButton: (element: HTMLElement, config: Record<string, unknown>) => void;
        };
      };
    };
  }
}

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

const Login = () => {
  const { loginWithGoogle, isAuthenticated, isNewUser } = useAuth();
  const router = useRouter();
  const googleBtnRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.push(isNewUser ? "/setup-profile" : "/");
    }
  }, [isAuthenticated, isNewUser, router]);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google && googleBtnRef.current) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleResponse,
        });
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "signin_with",
          shape: "rectangular",
          width: 360,
        });
      }
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGoogleResponse = async (response: { credential: string }) => {
    setLoading(true);
    try {
      await loginWithGoogle(response.credential);
      toast.success("Signed in successfully");
    } catch {
      toast.error("Could not sign in with Google");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="flex items-center justify-center px-4 py-32">
        <div className="w-full max-w-sm text-center">
          <p className="text-base text-muted-foreground mb-8 leading-relaxed">
            Join the growing Claude<br />
            community and learn together.
          </p>

          <div className="space-y-3">
            <div
              ref={googleBtnRef}
              className="flex justify-center min-h-[44px]"
            />

            {loading && (
              <p className="text-xs text-muted-foreground">Signing in...</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;
