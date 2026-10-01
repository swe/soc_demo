import { useCallback, useSyncExternalStore } from "react";

/** Breakpoints shared with Tailwind: phone < md ≤ tablet < xl ≤ desktop. */
export const MOBILE_MAX = 767.98;
export const TABLET_MAX = 1279.98;

function useMatchMedia(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}

export function useIsMobile() {
  return useMatchMedia(`(max-width: ${MOBILE_MAX}px)`);
}

/** Icon-rail range: wide enough for a sidebar, too narrow to keep it open. */
export function useIsTablet() {
  return useMatchMedia(`(min-width: 768px) and (max-width: ${TABLET_MAX}px)`);
}
