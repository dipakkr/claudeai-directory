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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);

  useEffect(() => {
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
    if (user) identifyUser(user);
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

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    api.setToken(null);
    setUser(null);
    setIsNewUser(false);
    clearUser();
  }, []);

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
