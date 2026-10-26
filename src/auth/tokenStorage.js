/* ==========================================================================
   Token storage
   --------------------------------------------------------------------------
   One store, one key, two lifetimes — exactly what the backend contract asks
   for (there is no refresh-token endpoint):

   - rememberMe = false -> sessionStorage  (cleared when the tab closes)
   - rememberMe = true  -> localStorage    (persists, ~30 day server lifetime)

   The client reads tokens through `getStoredToken()` and the auth context is
   the only code that writes or clears them, so there is no second, competing
   authentication mechanism anywhere in the app.

   Storage access is wrapped: private-mode browsers and locked-down embeds can
   throw on `window.sessionStorage`, and a failed read must never crash boot.
   ========================================================================== */

const TOKEN_KEY = "spaceapps.hurghada.accessToken";

function storageArea(remember) {
  return remember ? window.localStorage : window.sessionStorage;
}

/** Returns the stored access token from either scope, or `null`. */
export function getStoredToken() {
  try {
    return (
      window.sessionStorage.getItem(TOKEN_KEY) ||
      window.localStorage.getItem(TOKEN_KEY) ||
      null
    );
  } catch {
    return null;
  }
}

/**
 * Persists a fresh access token. Clears both scopes first so a token can
 * never survive in two storages with different lifetimes.
 */
export function storeToken(token, { remember = false } = {}) {
  clearStoredToken();
  if (!token) {
    return;
  }

  try {
    storageArea(remember).setItem(TOKEN_KEY, token);
  } catch {
    /* Storage unavailable: the session stays in memory for this page load. */
  }
}

/** Removes the token from both scopes (logout and rejected sessions). */
export function clearStoredToken() {
  try {
    window.sessionStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* Nothing to clear. */
  }
}
