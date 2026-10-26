/* ==========================================================================
   API configuration
   --------------------------------------------------------------------------
   Single source of truth for the backend origin and API base path.

   The deployed backend is an ASP.NET Core service whose public surface lives
   under `/api/v1`. `VITE_API_BASE_URL` carries the *whole* base
   (origin + `/api/v1`) so every endpoint module can be written as a bare path
   (`/teams`, `/judging/criteria`) and no call site can accidentally repeat
   the version prefix.

   The committed fallback is the already-deployed, non-secret service URL; it
   exists so a fresh clone runs without a `.env` file. Real credentials and
   tokens never live here (or anywhere else in the repo) — see .env.example.
   ========================================================================== */

const FALLBACK_BASE_URL = "https://nasa-space-apps-hurghada.runasp.net/api/v1";

const API_PATH_PREFIX = "/api/v1";

/**
 * Trims trailing slashes and repairs the two mistakes that would silently
 * duplicate or drop the version prefix:
 *   - `https://host/api/v1/` and `https://host/api/v1` are equivalent
 *   - a path that already carries `/api/v1` never gets it appended twice
 */
function normaliseBaseUrl(raw) {
  const value = typeof raw === "string" ? raw.trim() : "";
  if (!value) {
    return FALLBACK_BASE_URL;
  }

  const withoutTrailingSlashes = value.replace(/\/+$/, "");

  if (withoutTrailingSlashes.endsWith(API_PATH_PREFIX)) {
    return withoutTrailingSlashes;
  }

  return `${withoutTrailingSlashes}${API_PATH_PREFIX}`;
}

export const API_BASE_URL = normaliseBaseUrl(import.meta.env.VITE_API_BASE_URL);

/**
 * Joins the configured base with a relative endpoint path without ever
 * producing `/api/v1/api/v1/...`. Endpoint modules always pass bare paths.
 */
export function buildApiUrl(path) {
  const relative = String(path ?? "").replace(/^\/+/, "");

  if (relative.startsWith(API_PATH_PREFIX.slice(1))) {
    return `${API_BASE_URL.replace(new RegExp(`${API_PATH_PREFIX}$`), "")}/${relative}`;
  }

  return `${API_BASE_URL}/${relative}`;
}

/**
 * Joins the backend origin with a path that lives outside the versioned API
 * surface, such as a SignalR hub (`/hubs/judging`). Hubs are hosted at the
 * origin, not under `/api/v1`, so the API base cannot be used directly.
 */
export function buildHubUrl(path) {
  const relative = String(path ?? "").replace(/^\/+/, "");
  const origin = new URL(API_BASE_URL).origin;

  return `${origin}/${relative}`;
}
