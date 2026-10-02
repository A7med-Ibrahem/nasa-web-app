import { useEffect, useState } from "react";
import usePrefersReducedMotion from "./usePrefersReducedMotion";

const DURATION = 1000;

function splitTarget(target) {
  const match = /^([^\d]*)(\d[\d,]*)(.*)$/.exec(target);
  if (!match) {
    return { digits: null };
  }
  return { prefix: match[1], digits: match[2], suffix: match[3] };
}

function easeOutCubic(progress) {
  return 1 - (1 - progress) ** 3;
}

/**
 * Counts a stat up from zero once it scrolls into view.
 *
 * The formatted value always resolves back to the exact source string, so the
 * rendered text is identical before, during and after the animation — the
 * count is never the reason a number looks different.
 *
 * Reduced motion, an unsupported `requestAnimationFrame`, or an unparsable
 * target all return the target verbatim.
 */
export default function useCountUp(target, { active = true, duration = DURATION } = {}) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [value, setValue] = useState(target);
  const shouldAnimate = active && !prefersReducedMotion;

  useEffect(() => {
    if (!shouldAnimate || typeof window === "undefined" ||
        typeof window.requestAnimationFrame !== "function") {
      return undefined;
    }

    const { digits, prefix = "", suffix = "" } = splitTarget(target);
    const end = Number.parseInt(digits.replace(/,/g, ""), 10);

    if (!Number.isFinite(end) || end === 0) {
      return undefined;
    }

    let frame = 0;
    let start = null;

    function step(timestamp) {
      if (start === null) {
        start = timestamp;
      }

      const progress = Math.min((timestamp - start) / duration, 1);
      const current = Math.round(end * easeOutCubic(progress));
      setValue(`${prefix}${current.toLocaleString("en-US")}${suffix}`);

      if (progress < 1) {
        frame = window.requestAnimationFrame(step);
      } else {
        setValue(target);
      }
    }

    frame = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(frame);
  }, [target, shouldAnimate, duration]);

  // Motion is opt-in, so the exact source string is what renders whenever the
  // count is not running: before it triggers, when it is skipped, and after.
  return shouldAnimate ? value : target;
}