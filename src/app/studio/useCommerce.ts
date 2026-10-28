"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { commerceError, studioRequest, type StudioConfig, type StudioLibrary } from "@/lib/studio-commerce";

export function useCommerce() {
  const { user, isLoading: authLoading, viewOnly } = useAuth();
  const [revision, setRevision] = useState(0);
  const [configState, setConfigState] = useState<{ value?: StudioConfig; error?: string; revision: number }>({ revision: -1 });
  const [libraryState, setLibraryState] = useState<{ value?: StudioLibrary; error?: string; owner: string; revision: number }>();
  const owner = user?.id;
  useEffect(() => {
    const abort = new AbortController();
    studioRequest<StudioConfig>("/config", undefined, abort.signal).then(value => setConfigState({ value, revision })).catch(error => {
      if (!abort.signal.aborted) setConfigState({ error: commerceError(error), revision });
    });
    return () => abort.abort();
  }, [revision]);
  useEffect(() => {
    if (!owner || authLoading) return;
    const abort = new AbortController();
    studioRequest<StudioLibrary>("/library", undefined, abort.signal).then(value => setLibraryState({ value, owner, revision })).catch(error => {
      if (!abort.signal.aborted) setLibraryState({ error: commerceError(error), owner, revision });
    });
    return () => abort.abort();
  }, [owner, authLoading, revision]);
  const currentLibrary = libraryState?.owner === owner && libraryState?.revision === revision ? libraryState : undefined;
  const currentConfig = configState.revision === revision ? configState : undefined;
  const refresh = useCallback(() => setRevision(value => value + 1), []);
  return {
    user, authLoading, viewOnly,
    config: currentConfig?.value,
    configError: currentConfig?.error,
    library: currentLibrary?.value,
    libraryError: currentLibrary?.error,
    loading: authLoading || !currentConfig || Boolean(owner && !currentLibrary),
    refresh,
  };
}
