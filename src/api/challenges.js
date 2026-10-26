/* ==========================================================================
   Challenge endpoints
   --------------------------------------------------------------------------
   GET /api/v1/challenges
   GET /api/v1/challenges/{challengeId}

   Used by the public challenge routes, the homepage rail and the judge details
   panel. `challengeId` is always a positive integer; an invalid value never
   reaches the network.
   ========================================================================== */

import { ApiError, request } from "./client";

/** Coerces a route/API value to a positive integer id, or null. */
export function parseChallengeId(value) {
  if (typeof value !== "string" && typeof value !== "number") {
    return null;
  }

  const text = String(value).trim();
  if (!/^[1-9]\d*$/.test(text)) {
    return null;
  }

  const numeric = Number(text);
  return Number.isSafeInteger(numeric) && numeric > 0 ? numeric : null;
}

export function fetchChallenges({ signal } = {}) {
  return request("/challenges", { signal });
}

export function fetchChallenge(challengeId, { signal } = {}) {
  const id = parseChallengeId(challengeId);

  if (id === null) {
    return Promise.reject(
      new ApiError("Challenge was not found.", {
        status: 404,
        code: "challenge.not_found",
      }),
    );
  }

  return request(`/challenges/${id}`, { signal });
}
