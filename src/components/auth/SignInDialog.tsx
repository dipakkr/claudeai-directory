"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import Link from "next/link";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { track } from "@/lib/analytics";
import { useAuth } from "@/lib/auth";

/** `resumed` is true when the action runs right after signing in from the modal. */
export type AuthedAction<T> = (ctx: { resumed: boolean }) => T | Promise<T>;

interface RequireAuthOptions {
  /** Wait until a new member finishes the "Meet the community" step (for actions that open a dialog). */
  afterOnboarding?: boolean;
}

interface SignInContextValue {
  /**
   * Runs `action` now if signed in. Otherwise opens the sign-in modal and runs
   * it once the user signs in. Resolves with the action's result, or undefined
   * if the modal is closed without signing in.
   */
  requireAuth: <T>(reason: string, action?: AuthedAction<T>, options?: RequireAuthOptions) => Promise<T | undefined>;
  /** Opens the modal with no follow-up action (plain "Sign in" buttons). */
  openSignIn: (reason?: string) => void;
}

interface Pending {
  action?: AuthedAction<unknown>;
  afterOnboarding: boolean;
  resolve: (value: unknown) => void;
}

const SignInContext = createContext<SignInContextValue | null>(null);

export function SignInProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<string | undefined>();
  const pending = useRef<Pending | null>(null);

  const settle = useCallback((value: unknown) => {
    const current = pending.current;
    pending.current = null;
    current?.resolve(value);
  }, []);

  const requireAuth = useCallback<SignInContextValue["requireAuth"]>(
    async (nextReason, action, options) => {
      if (isAuthenticated && !(options?.afterOnboarding && user?.needs_onboarding)) {
        return action ? await action({ resumed: false }) : undefined;
      }
      settle(undefined); // a newer request replaces an older one
      return new Promise((resolve) => {
        pending.current = {
          action: action as AuthedAction<unknown> | undefined,
          afterOnboarding: Boolean(options?.afterOnboarding),
          resolve: resolve as (value: unknown) => void,
        };
        if (!isAuthenticated) {
          setReason(nextReason);
          setOpen(true);
          track("sign_in_prompted", { reason: nextReason || "sign_in" });
        }
      });
    },
    [isAuthenticated, settle, user?.needs_onboarding],
  );

  const openSignIn = useCallback((nextReason?: string) => void requireAuth(nextReason ?? ""), [requireAuth]);

  // Continue the action once signed in (and, when asked, once onboarding is done).
  useEffect(() => {
    const current = pending.current;
    if (!current || !isAuthenticated) return;
    if (current.afterOnboarding && user?.needs_onboarding) return;
    pending.current = null;
    Promise.resolve(current.action?.({ resumed: true })).then(current.resolve, () => current.resolve(undefined));
  }, [isAuthenticated, user?.needs_onboarding]);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next && !isAuthenticated) settle(undefined);
  };

  return (
    <SignInContext.Provider value={{ requireAuth, openSignIn }}>
      {children}
      {/* Hidden as soon as the user is signed in, however that happened. */}
      <Dialog open={open && !isAuthenticated} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-[380px] gap-0 rounded-2xl p-7 text-center">
          <DialogHeader className="items-center space-y-2 text-center sm:text-center">
            <DialogTitle className="text-xl font-semibold">{reason ? `Sign in to ${reason}` : "Sign in"}</DialogTitle>
            <DialogDescription className="text-sm leading-6">
              Free, one click with Google.{reason ? " You'll pick up right where you left off." : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-6">
            <GoogleSignInButton width={300} onSignedIn={() => setOpen(false)} />
          </div>
          <p className="mt-6 text-xs leading-5 text-muted-foreground">
            By continuing you agree to our{" "}
            <Link href="/terms" onClick={() => handleOpenChange(false)} className="underline underline-offset-2 hover:text-foreground">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" onClick={() => handleOpenChange(false)} className="underline underline-offset-2 hover:text-foreground">
              Privacy Policy
            </Link>
            .
          </p>
        </DialogContent>
      </Dialog>
    </SignInContext.Provider>
  );
}

export function useSignIn() {
  const ctx = useContext(SignInContext);
  if (!ctx) throw new Error("useSignIn must be used within SignInProvider");
  return ctx;
}

/** Drop-in for `<Link href="/login">`: opens the sign-in modal and keeps the user on this page. */
export function SignInButton({
  reason,
  className,
  children,
}: {
  reason?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const { openSignIn } = useSignIn();
  return (
    <button type="button" onClick={() => openSignIn(reason)} className={className}>
      {children}
    </button>
  );
}
