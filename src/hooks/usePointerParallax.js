import { useEffect } from "react";
import usePrefersReducedMotion from "./usePrefersReducedMotion";

const FINE_POINTER_QUERY = "(hover: hover) and (pointer: fine)";

/**
 * Nudges the element by a few pixels as the pointer moves across the container.
 *
 * Offset is written to `--mx` / `--my` custom properties rather than to the
 * `transform` property, so the element's own transform (a scale, for example)
 * and its looping animation can keep owning `transform`. Only transform-driven
 * properties change, and the whole effect is skipped on touch devices, for
 * reduced motion, and when the browser has no rAF.
 */
export default function usePointerParallax(containerRef, { max = 8 } = {}) {
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const container = containerRef.current;
    if (!container || prefersReducedMotion ||
        typeof window === "undefined" ||
        typeof window.matchMedia !== "function" ||
        typeof window.requestAnimationFrame !== "function") {
      return undefined;
    }

    const pointerQuery = window.matchMedia(FINE_POINTER_QUERY);
    let frame = 0;
    let nextX = 0;
    let nextY = 0;

    function flush() {
      frame = 0;
      container.style.setProperty("--mx", `${nextX.toFixed(2)}px`);
      container.style.setProperty("--my", `${nextY.toFixed(2)}px`);
    }

    function handlePointerMove(event) {
      const rect = container.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) {
        return;
      }

      const ratioX = (event.clientX - rect.left) / rect.width - 0.5;
      const ratioY = (event.clientY - rect.top) / rect.height - 0.5;

      nextX = Math.max(-1, Math.min(1, ratioX * 2)) * max;
      nextY = Math.max(-1, Math.min(1, ratioY * 2)) * max;

      if (frame === 0) {
        frame = window.requestAnimationFrame(flush);
      }
    }

    function reset() {
      nextX = 0;
      nextY = 0;
      if (frame === 0) {
        frame = window.requestAnimationFrame(flush);
      }
    }

    function attach() {
      container.addEventListener("pointermove", handlePointerMove);
      container.addEventListener("pointerleave", reset);
    }

    function detach() {
      container.removeEventListener("pointermove", handlePointerMove);
      container.removeEventListener("pointerleave", reset);
      reset();
    }

    function handlePointerChange(event) {
      if (event.matches) {
        attach();
      } else {
        detach();
      }
    }

    if (pointerQuery.matches) {
      attach();
    }
    pointerQuery.addEventListener("change", handlePointerChange);

    return () => {
      if (frame !== 0) {
        window.cancelAnimationFrame(frame);
      }
      pointerQuery.removeEventListener("change", handlePointerChange);
      detach();
    };
  }, [containerRef, max, prefersReducedMotion]);
}