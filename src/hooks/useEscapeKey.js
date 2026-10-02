import { useEffect } from "react";

/**
 * Calls `onEscape` when the Escape key is pressed, while `active` is true.
 * The listener is only attached while active, and always removed on unmount.
 *
 * Used by the Navbar to close its mobile menu and return focus to the toggle;
 * reused unchanged by any future drawer, modal or popover.
 *
 * @param {boolean} active       Whether the Escape behaviour is enabled.
 * @param {Function} onEscape    Called when Escape is pressed.
 */
export default function useEscapeKey(active, onEscape) {
  useEffect(() => {
    if (!active) return undefined;

    function handleKeyDown(event) {
      if (event.key === "Escape") onEscape();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [active, onEscape]);
}