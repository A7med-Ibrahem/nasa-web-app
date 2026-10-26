/* ==========================================================================
   Admin quiz question endpoints
   --------------------------------------------------------------------------
   `options` is a JSON-encoded string on the wire, not an array. The page
   serialises the list with JSON.stringify and parses it defensively on edit.

   DELETE is a soft delete: the row stays in the database but is hidden from
   the admin list and from participants. It cannot be restored from this UI.
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

function questionPath(questionId) {
  return `/questions/${encodeURIComponent(String(questionId))}`;
}

export function fetchQuestionsAdmin({ challengeId, signal } = {}) {
  return request(withQuery("/questions", { challengeId }), {
    method: "GET",
    auth: true,
    signal,
  });
}

export function createQuestion(payload) {
  return request("/questions", {
    method: "POST",
    auth: true,
    body: payload,
  });
}

export function updateQuestion(questionId, payload) {
  return request(questionPath(questionId), {
    method: "PUT",
    auth: true,
    body: payload,
  });
}

export function deleteQuestion(questionId) {
  return request(questionPath(questionId), {
    method: "DELETE",
    auth: true,
  });
}

export function publishQuestion(questionId) {
  return request(`${questionPath(questionId)}/publish`, {
    method: "POST",
    auth: true,
  });
}

export function unpublishQuestion(questionId) {
  return request(`${questionPath(questionId)}/unpublish`, {
    method: "POST",
    auth: true,
  });
}
