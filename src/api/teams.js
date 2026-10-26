/* ==========================================================================
   Team endpoints
   --------------------------------------------------------------------------
   GET /api/v1/teams?search={term}      search by the backend's team search
   GET /api/v1/teams/{teamId}           staff only (Judge is a staff role)
   GET /api/v1/teams/{teamId}/students  staff only

   The detail response is the only team payload that carries `challengeId`,
   which is what the details panel uses to resolve challenge information.
   ========================================================================== */

import { request } from "./client";

function toChallengeId(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const numeric = Number(value);
  return Number.isInteger(numeric) && numeric > 0 ? numeric : null;
}

/**
 * Returns the team's challenge id from the shape the detail endpoint returns.
 *
 * `team.challenge.challengeId` is authoritative. A root-level `challengeId`
 * is only used when the detail payload has no nested `challenge` object at
 * all. If the nested challenge exists but is malformed, or if its id disagrees
 * with the root-level link, the team is treated as having no usable challenge
 * so the caller cannot silently request another challenge's criteria.
 */
export function getTeamChallengeId(team) {
  if (!team || typeof team !== "object") {
    return null;
  }

  const nested =
    team.challenge && typeof team.challenge === "object" ? team.challenge : null;
  const rootId = toChallengeId(team.challengeId);

  if (nested) {
    const nestedId = toChallengeId(nested.challengeId);

    if (nestedId === null) {
      return null;
    }

    if (rootId !== null && rootId !== nestedId) {
      return null;
    }

    return nestedId;
  }

  return rootId;
}

export function searchTeams(search, { signal } = {}) {
  const term = String(search ?? "").trim();
  const query = term ? `?search=${encodeURIComponent(term)}` : "";

  return request(`/teams${query}`, { signal });
}

export function fetchTeam(teamId, { signal } = {}) {
  return request(`/teams/${teamId}`, { signal, auth: true });
}

export function fetchTeamStudents(teamId, { signal } = {}) {
  return request(`/teams/${teamId}/students`, { signal, auth: true });
}
