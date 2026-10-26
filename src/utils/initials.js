/* ==========================================================================
   Name helpers
   --------------------------------------------------------------------------
   Small presentation helper shared by the public team views. It never invents
   a name: a missing or empty value becomes a neutral "?" placeholder.
   ========================================================================== */

/** Up to two uppercase initials for a person or team name. */
export function getInitials(name) {
  if (typeof name !== "string") {
    return "?";
  }

  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "?";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}
