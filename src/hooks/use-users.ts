import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { PublicProfile } from "@/types";

export function useUserProfile(username: string) {
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!username) return;

    setIsLoading(true);
    setError(null);

    api
      .get<PublicProfile>(`/users/${username}`)
      .then(setProfile)
      .catch(() => setError("User not found"))
      .finally(() => setIsLoading(false));
  }, [username]);

  return { profile, isLoading, error };
}
