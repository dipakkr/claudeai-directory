"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import type { User } from "@/types";
import { api } from "./api";
import { clearUser, identifyUser, track } from "./analytics";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isNewUser: boolean;
  loginWithGoogle: (credential: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: ProfileUpdate) => Promise<void>;
  /** An admin is viewing this member's account, read-only, in this tab. */
  viewOnly: boolean;
  /** The admin's view session ran out (or was invalid). */
  viewExpired: boolean;
  exitView: () => void;
}

export interface ProfileUpdate {
  username?: string;
  name?: string;
  avatar?: string;
  bio?: string;
  website?: string;
  twitter?: string;
  github?: string;
  linkedin?: string;
  profession?: string;
  profession_detail?: string;
  country?: string;
  email_notifications?: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = "cc_token";
/** Admin "view as" token: this tab only, never written to localStorage. */
export const VIEW_TOKEN_KEY = "cad_view_token";

function readViewToken(): string | null {
  try {
    return sessionStorage.getItem(VIEW_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);
  const [viewOnly, setViewOnly] = useState(false);
  const [viewExpired, setViewExpired] = useState(false);

  useEffect(() => {
    const viewToken = readViewToken();
    if (viewToken) {
      // Viewing as a member: never touch the admin's own session in localStorage.
      api.setToken(viewToken);
      api
        .get<User>("/auth/me")
        .then((me) => {
          setUser(me);
          setViewOnly(true);
        })
        .catch(() => {
          sessionStorage.removeItem(VIEW_TOKEN_KEY);
          api.setToken(null);
          setViewExpired(true);
        })
        .finally(() => setIsLoading(false));
      return;
    }
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      api.setToken(token);
      api
        .get<User>("/auth/me")
        .then(setUser)
        .catch(() => {
          localStorage.removeItem(TOKEN_KEY);
          api.setToken(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  // Tie analytics to the member once we know who they are.
  const userId = user?.id;
  useEffect(() => {
    if (user && !viewOnly) identifyUser(user);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const loginWithGoogle = useCallback(async (credential: string) => {
    const res = await api.post<{ access_token: string; user: User }>(
      "/auth/google",
      { credential }
    );
    localStorage.setItem(TOKEN_KEY, res.access_token);
    api.setToken(res.access_token);
    setUser(res.user);
    track("signed_in", { isNew: Boolean(res.user.needs_onboarding) });
    // Flag as new user if no bio set (hasn't completed profile setup)
    if (!res.user.bio) {
      setIsNewUser(true);
    }
  }, []);

  const exitView = useCallback(() => {
    try {
      sessionStorage.removeItem(VIEW_TOKEN_KEY);
    } catch {
      // nothing stored
    }
    api.setToken(null);
    window.close();
    // Tabs not opened by script can't close themselves: go home signed out of the view.
    window.location.replace("/");
  }, []);

  const logout = useCallback(() => {
    if (readViewToken()) return exitView();
    localStorage.removeItem(TOKEN_KEY);
    api.setToken(null);
    setUser(null);
    setIsNewUser(false);
    clearUser();
  }, [exitView]);

  const updateProfile = useCallback(
    async (data: ProfileUpdate) => {
      const updated = await api.put<User>("/auth/me", data);
      setUser(updated);
      setIsNewUser(false);
    },
    []
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        isNewUser,
        loginWithGoogle,
        logout,
        updateProfile,
        viewOnly,
        viewExpired,
        exitView,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
