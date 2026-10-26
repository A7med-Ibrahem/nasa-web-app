/* ==========================================================================
   Image helpers
   --------------------------------------------------------------------------
   Convert any supported image representation to a safe <img> src.

   Supported:
   - plain base64 (sniff first chars to choose MIME)
   - data URI (pass through if starts with "data:image/")
   - http(s) URL (pass through)
   - null/empty -> null

   Never allow javascript: or other schemes.
   ========================================================================== */

const PNG_SIGNATURE = "iVBOR";
const JPEG_SIGNATURE = "/9j/";
const GIF_SIGNATURE = "R0lGOD";
const WEBP_SIGNATURE = "UklGR";
const SVG_SIGNATURE1 = "PHN2Zy";
const SVG_SIGNATURE2 = "PD94bW";

function sniffMime(base64) {
  if (typeof base64 !== "string") {
    return null;
  }
  if (base64.startsWith(PNG_SIGNATURE)) {
    return "image/png";
  }
  if (base64.startsWith(JPEG_SIGNATURE)) {
    return "image/jpeg";
  }
  if (base64.startsWith(GIF_SIGNATURE)) {
    return "image/gif";
  }
  if (base64.startsWith(WEBP_SIGNATURE)) {
    return "image/webp";
  }
  if (base64.startsWith(SVG_SIGNATURE1) || base64.startsWith(SVG_SIGNATURE2)) {
    return "image/svg+xml";
  }
  return null;
}

export function toImageSrc(value) {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  if (trimmed === "") {
    return null;
  }

  if (trimmed.startsWith("data:image/")) {
    return trimmed;
  }
  if (trimmed.startsWith("https://")) {
    return trimmed;
  }
  if (trimmed.startsWith("http://")) {
    return trimmed;
  }

  // Try to sniff as plain base64
  // Avoid treating arbitrary strings as base64; we only accept known signatures
  const mime = sniffMime(trimmed);
  if (mime) {
    return `data:${mime};base64,${trimmed}`;
  }

  // If it doesn't match any known safe pattern, reject (never allow javascript: etc)
  return null;
}

export function imagePlaceholder() {
  return null;
}
