"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { useAuth } from "@/lib/auth";

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
const GSI_SRC = "https://accounts.google.com/gsi/client";

// One script tag for the whole app, shared by the login page and the sign-in modal.
let gsiScript: Promise<void> | null = null;
function loadGoogleScript() {
  if (window.google?.accounts) return Promise.resolve();
  if (!gsiScript) {
    gsiScript = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = GSI_SRC;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => {
        gsiScript = null;
        reject(new Error("Could not load Google sign-in"));
      };
      document.head.appendChild(script);
    });
  }
  return gsiScript;
}

/** Google's "Sign in with Google" button, wired to our auth. */
export function GoogleSignInButton({ width = 320, onSignedIn }: { width?: number; onSignedIn?: () => void }) {
  const { loginWithGoogle } = useAuth();
  const ref = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  // Google keeps the first callback it is given; route it through a ref so it
  // always calls the latest props.
  const onCredential = useRef<(credential: string) => void>(() => {});
  onCredential.current = async (credential: string) => {
    setLoading(true);
    try {
      await loginWithGoogle(credential);
      toast.success("Signed in");
      onSignedIn?.();
    } catch {
      toast.error("Could not sign in with Google");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    loadGoogleScript()
      .then(() => {
        if (cancelled || !window.google || !ref.current) return;
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (response: { credential: string }) => onCredential.current(response.credential),
        });
        window.google.accounts.id.renderButton(ref.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "signin_with",
          shape: "pill",
          width,
        });
      })
      .catch(() => {
        if (!cancelled) toast.error("Could not load Google sign-in. Check your connection and try again.");
      });
    return () => {
      cancelled = true;
    };
  }, [width]);

  return (
    <div className="flex flex-col items-center gap-2">
      <div ref={ref} className="flex min-h-[44px] justify-center" />
      {loading && <p className="text-xs text-muted-foreground">Signing in...</p>}
    </div>
  );
}
