/* ==========================================================================
   Admin teams endpoints
   --------------------------------------------------------------------------
   Only logo updates are supported via PATCH /teams/{teamId}/logo.
   ========================================================================== */

import { request } from "../client";

function teamLogoPath(teamId) {
  return `/teams/${encodeURIComponent(String(teamId))}/logo`;
}

export function updateTeamLogo(teamId, image) {
  return request(teamLogoPath(teamId), {
    method: "PATCH",
    auth: true,
    body: { image },
  });
}
