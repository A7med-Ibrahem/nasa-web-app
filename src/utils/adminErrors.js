/* ==========================================================================
   Admin error helpers
   --------------------------------------------------------------------------
   The deployed server mixes dotted and underscore error codes between
   endpoints, so every switch uses the underscore spelling. `loadMessage`
   keeps the shared 401/403/network copy in one place.
   ========================================================================== */

import { ApiError } from "../api/client";
import { adminData } from "../data/adminData";

export function loadMessage(cause, fallback) {
  if (cause instanceof ApiError) {
    if (cause.isForbidden) {
      return cause.message || adminData.common.forbidden;
    }
    if (cause.isUnauthorized) {
      return cause.message || adminData.common.unauthorized;
    }
    if (cause.isNetworkError) {
      return cause.message || adminData.common.network;
    }
    /* A 5xx can carry raw framework text. Never render that in the admin UI. */
    if (cause.status >= 500) {
      return fallback;
    }
    return cause.message || fallback;
  }
  return fallback;
}

export function codeKey(cause) {
  if (!(cause instanceof ApiError)) {
    return "";
  }
  return String(cause.code || "").replace(/\./g, "_");
}

export function statusCode(cause) {
  return cause instanceof ApiError ? cause.status : 0;
}
