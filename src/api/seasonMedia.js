/* ==========================================================================
   Season media endpoints
   --------------------------------------------------------------------------
   GET /api/v1/seasonmedia?includeInactive=false
   ========================================================================== */

import { request } from "./client";

export function fetchSeasonMedia({ signal } = {}) {
  return request("/seasonmedia?includeInactive=false", { signal });
}
