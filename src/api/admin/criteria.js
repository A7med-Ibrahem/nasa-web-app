/* ==========================================================================
   Admin judging criteria endpoints
   --------------------------------------------------------------------------
   Criteria are global: the server exposes one five-criterion catalogue and
   ignores challenge scoping. Writes use the server's replace-the-whole-
   question-list semantics; questions are reference prompts, never scored.

   Publication calls accept an optional judgeId and teamId. When both are
   omitted the server targets every scored judge/team pair. Supplying either
   one narrows the change to that judge, that team, or the exact pair.
   ========================================================================== */

import { request } from "../client";

function withQuery(path, params) {
  const entries = Object.entries(params).filter(
    ([, value]) => value !== null && value !== undefined && value !== "",
  );

  if (entries.length === 0) {
    return path;
  }

  const query = entries
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`,
    )
    .join("&");

  return `${path}?${query}`;
}

function criterionPath(criterionId) {
  return `/judging/criteria/${encodeURIComponent(String(criterionId))}`;
}

export function fetchCriteriaAdmin({ teamId, signal } = {}) {
  return request(withQuery("/judging/criteria", { teamId }), {
    method: "GET",
    auth: true,
    signal,
  });
}

export function createCriterion(payload) {
  return request("/judging/criteria", {
    method: "POST",
    auth: true,
    body: payload,
  });
}

export function updateCriterion(criterionId, payload) {
  return request(criterionPath(criterionId), {
    method: "PUT",
    auth: true,
    body: payload,
  });
}

export function deleteCriterion(criterionId) {
  return request(criterionPath(criterionId), {
    method: "DELETE",
    auth: true,
  });
}

export function publishCriterionAdmin(
  criterionId,
  { judgeId, teamId } = {},
) {
  return request(
    withQuery(`${criterionPath(criterionId)}/publish`, { judgeId, teamId }),
    {
      method: "POST",
      auth: true,
    },
  );
}

export function unpublishCriterionAdmin(
  criterionId,
  { judgeId, teamId } = {},
) {
  return request(
    withQuery(`${criterionPath(criterionId)}/unpublish`, { judgeId, teamId }),
    {
      method: "POST",
      auth: true,
    },
  );
}

/* Publishing needs the judgeId of each staff account, not the staffId. */
export function fetchJudgingJudges({ signal } = {}) {
  return request("/staff?role=Judge", {
    method: "GET",
    auth: true,
    signal,
  });
}
