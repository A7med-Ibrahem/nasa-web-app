import { useEffect, useState } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function getInitialPreference() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia(QUERY).matches;
}

/**
 * Tracks the user's `prefers-reduced-motion` setting.
 *
 * Motion is a progressive enhancement, so JavaScript asks this hook before it
 * hides anything: when motion is reduced we never apply a "hidden" pending
 * state, which keeps all content immediately visible and fully interactive.
 * The change is observed live, so toggling the OS setting takes effect without
 * a reload.
 */
export default function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(getInitialPreference);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return undefined;
    }

    const mediaQuery = window.matchMedia(QUERY);

    function handleChange(event) {
      setPrefersReducedMotion(event.matches);
    }

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return prefersReducedMotion;
}