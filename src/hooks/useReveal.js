import { useEffect, useState } from "react";
import usePrefersReducedMotion from "./usePrefersReducedMotion";

const ITEM_SELECTOR = "[data-reveal-item]";

const DEFAULTS = {
  threshold: 0.2,
  rootMargin: "0px 0px -8% 0px",
  stagger: 90,
};

function resolveDelay(element, position, stagger) {
  const explicitIndex = Number.parseFloat(
    element.style.getPropertyValue("--reveal-index"),
  );
  const index = Number.isFinite(explicitIndex) ? explicitIndex : position;

  element.style.setProperty("--reveal-delay", `${index * stagger}ms`);
}

/**
 * Reveals elements as they scroll into view, once each.
 *
 * The hook is deliberately opt-in and fail-safe:
 *   - reduced motion        -> nothing is hidden, ever
 *   - no IntersectionObserver -> nothing is hidden (all content stays visible)
 *   - JavaScript disabled   -> the attributes are never written, so the CSS
 *                               default is fully visible content
 *
 * Elements opt in with `data-reveal-item` and are marked with `data-reveal`
 * only while they are still hidden, so a scroll that never fires cannot leave
 * content permanently invisible.
 */
function useRevealInternal(containerRef, { enabled, stagger, threshold, rootMargin }) {
  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const container = containerRef.current;
    if (!container) {
      return undefined;
    }

    const elements = Array.from(container.querySelectorAll(ITEM_SELECTOR));
    if (elements.length === 0) {
      return undefined;
    }

    elements.forEach((element, position) => {
      resolveDelay(element, position, stagger);
      if (element.dataset.reveal !== "done") {
        element.dataset.reveal = "pending";
      }
    });

    if (typeof window === "undefined" || typeof window.IntersectionObserver !== "function") {
      // Unsupported browser: reveal everything rather than hiding it forever.
      elements.forEach((element) => {
        element.dataset.reveal = "done";
      });
      return undefined;
    }

    const observer = new window.IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }
          entry.target.dataset.reveal = "done";
          observer.unobserve(entry.target);
        });
      },
      { threshold, rootMargin },
    );

    elements.forEach((element) => {
      if (element.dataset.reveal !== "done") {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [containerRef, enabled, stagger, threshold, rootMargin]);
}

/**
 * Reports whether `ref`'s element has entered the viewport.
 *
 * Starts `false` so a count-up never runs before it can be seen, and returns
 * `true` forever once triggered. Without IntersectionObserver it returns
 * `true` immediately so callers fall back to their static value.
 */
export function useInView(ref, { threshold = DEFAULTS.threshold, rootMargin = DEFAULTS.rootMargin } = {}) {
  const [inView, setInView] = useState(
    typeof window === "undefined" || typeof window.IntersectionObserver !== "function",
  );

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof window === "undefined" ||
        typeof window.IntersectionObserver !== "function") {
      setInView(true);
      return undefined;
    }

    const observer = new window.IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, threshold, rootMargin]);

  return inView;
}

/**
 * Reveals the `[data-reveal-item]` children of `containerRef` with a stagger.
 */
export function useRevealGroup(containerRef, options = {}) {
  const {
    threshold = DEFAULTS.threshold,
    rootMargin = DEFAULTS.rootMargin,
    stagger = DEFAULTS.stagger,
  } = options;

  const prefersReducedMotion = usePrefersReducedMotion();
  const motionAllowed = !prefersReducedMotion;

  useRevealInternal(containerRef, {
    enabled: motionAllowed,
    stagger,
    threshold,
    rootMargin,
  });
}