/* ==========================================================================
   Core team endpoints
   --------------------------------------------------------------------------
   GET /api/v1/core-team
   Public. Returns the active core-team members only.
   ========================================================================== */

import { request } from "./client";

export function fetchCoreTeam({ signal } = {}) {
  return request("/core-team", { signal });
}
