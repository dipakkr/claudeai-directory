"use client";

import { useEffect, useState } from "react";

import { VIEW_TOKEN_KEY } from "@/lib/auth";

/**
 * Landing page for admin "view as" links (opened from tj-admin). The token is in
 * the URL fragment, which never reaches a server; it moves to this tab's
 * sessionStorage and the fragment is wiped from history before going on.
 */
export default function ViewAsClient() {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const token = new URLSearchParams(window.location.hash.slice(1)).get("t");
    window.history.replaceState(null, "", window.location.pathname);
    if (!token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of the URL fragment
      setFailed(true);
      return;
    }
    try {
      sessionStorage.setItem(VIEW_TOKEN_KEY, token);
    } catch {
      setFailed(true);
      return;
    }
    // Full load so the auth provider starts in view mode.
    window.location.replace("/dashboard");
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 text-center text-sm text-muted-foreground">
      {failed ? "This view link is missing its key. Open it again from the admin." : "Opening the member's view..."}
    </div>
  );
}
