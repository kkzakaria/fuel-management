/**
 * useMediaQuery Hook
 *
 * A hook for responsive design that tracks media query matches.
 * Safely handles SSR by defaulting to false until mounted.
 */

import { useSyncExternalStore, useCallback } from "react";

function getServerSnapshot(): boolean {
  return false; // SSR default
}

export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (callback: () => void) => {
      const media = window.matchMedia(query);
      media.addEventListener("change", callback);
      return () => media.removeEventListener("change", callback);
    },
    [query]
  );

  const getSnapshot = useCallback(() => {
    return window.matchMedia(query).matches;
  }, [query]);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
