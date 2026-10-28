/* ==========================================================================
   Admin challenges endpoints
   --------------------------------------------------------------------------
   Only image updates are supported via PATCH /challenges/{challengeId}/image.
   ========================================================================== */

import { request } from "../client";

function challengeImagePath(challengeId) {
  return `/challenges/${encodeURIComponent(String(challengeId))}/image`;
}

export function updateChallengeImage(challengeId, image) {
  return request(challengeImagePath(challengeId), {
    method: "PATCH",
    auth: true,
    body: { image },
  });
}
