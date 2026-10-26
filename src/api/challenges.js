/* ==========================================================================
   Challenge endpoints
   --------------------------------------------------------------------------
   GET /api/v1/challenges
   GET /api/v1/challenges/{challengeId}

   Used by the judge details panel to turn the team's `challengeId` into a
   title and description. The relationship is only ever resolved through that
   explicit identifier — never by array position or name matching.
   ========================================================================== */

import { request } from "./client";

export function fetchChallenges({ signal } = {}) {
  return request("/challenges", { signal });
}

export function fetchChallenge(challengeId, { signal } = {}) {
  return request(`/challenges/${challengeId}`, { signal });
}
