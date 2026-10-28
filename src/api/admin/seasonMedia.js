/* ==========================================================================
   Admin season media endpoints
   --------------------------------------------------------------------------
   CRUD for season media items.
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

function seasonMediaPath(mediaId) {
  return `/seasonmedia/${encodeURIComponent(String(mediaId))}`;
}

export function fetchSeasonMediaAdmin({ includeInactive = true, signal } = {}) {
  return request(withQuery("/seasonmedia", { includeInactive }), {
    method: "GET",
    auth: true,
    signal,
  });
}

export function fetchSeasonMediaItem(mediaId, { signal } = {}) {
  return request(seasonMediaPath(mediaId), {
    method: "GET",
    auth: true,
    signal,
  });
}

export function createSeasonMedia(payload) {
  return request("/seasonmedia", {
    method: "POST",
    auth: true,
    body: payload,
  });
}

export function updateSeasonMedia(mediaId, payload) {
  return request(seasonMediaPath(mediaId), {
    method: "PUT",
    auth: true,
    body: payload,
  });
}

export function deleteSeasonMedia(mediaId) {
  return request(seasonMediaPath(mediaId), {
    method: "DELETE",
    auth: true,
  });
}
