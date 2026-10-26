/* ==========================================================================
   Admin judging criteria endpoints
   --------------------------------------------------------------------------
   Criteria reads can be unscoped or scoped to one challenge. Writes use the
   server's replace-the-whole-question-list semantics; the page always sends
   the complete list in display order.

   Publication calls accept an optional judgeId. When it is omitted the
   server targets every judge who has scored the criterion.
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

export function fetchCriteriaAdmin({ challengeId, signal } = {}) {
  return request(withQuery("/judging/criteria", { challengeId }), {
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

export function publishCriterionAdmin(criterionId, { judgeId } = {}) {
  return request(
    withQuery(`${criterionPath(criterionId)}/publish`, { judgeId }),
    {
      method: "POST",
      auth: true,
    },
  );
}

export function unpublishCriterionAdmin(criterionId, { judgeId } = {}) {
  return request(
    withQuery(`${criterionPath(criterionId)}/unpublish`, { judgeId }),
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
