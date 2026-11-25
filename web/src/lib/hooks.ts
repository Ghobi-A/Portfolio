import { useEffect, useState, useSyncExternalStore } from "react";

/** False during prerender and the hydration pass, true once React owns the page.
 *  Interactive-only UI (tabs, previews, cursor) switches on from here, so the
 *  server HTML and the first client render always match. */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}

function subscribeMedia(query: string) {
  return (notify: () => void) => {
    const media = window.matchMedia(query);
    media.addEventListener("change", notify);
    return () => media.removeEventListener("change", notify);
  };
}

/** A media query as React state; false on the server. */
export function useMedia(query: string): boolean {
  return useSyncExternalStore(subscribeMedia(query), () => window.matchMedia(query).matches, () => false);
}

export const useReduced = () => useMedia("(prefers-reduced-motion: reduce)");
export const useFinePointer = () => useMedia("(hover: hover) and (pointer: fine)");
