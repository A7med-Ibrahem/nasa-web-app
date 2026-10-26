/* ==========================================================================
   Sponsor endpoints
   --------------------------------------------------------------------------
   GET /api/v1/sponsors?includeInactive=false
   ========================================================================== */

import { request } from "./client";

export function fetchSponsors({ signal } = {}) {
  return request("/sponsors?includeInactive=false", { signal });
}
