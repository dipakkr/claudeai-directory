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

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isNewUser: boolean;
  loginWithGoogle: (credential: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: { username?: string; name?: string; avatar?: string; bio?: string }) => Promise<void>;
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

  const loginWithGoogle = useCallback(async (credential: string) => {
    const res = await api.post<{ access_token: string; user: User }>(
      "/auth/google",
      { credential }
    );
    localStorage.setItem(TOKEN_KEY, res.access_token);
    api.setToken(res.access_token);
    setUser(res.user);
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
  }, []);

  const updateProfile = useCallback(
    async (data: { username?: string; name?: string; avatar?: string; bio?: string }) => {
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
