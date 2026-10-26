/* ==========================================================================
   Admin staff endpoints
   --------------------------------------------------------------------------
   All staff-management calls are AdminOnly. `request()` owns the base URL,
   bearer token and error envelope; this module only builds paths.
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

export function fetchStaff({ role, memberType, search, signal } = {}) {
  return request(withQuery("/staff", { role, memberType, search }), {
    method: "GET",
    auth: true,
    signal,
  });
}

export function fetchStaffMember(staffId, { signal } = {}) {
  return request(`/staff/${encodeURIComponent(String(staffId))}`, {
    method: "GET",
    auth: true,
    signal,
  });
}

export function fetchStaffMemberTypes({ signal } = {}) {
  return request("/staff/member-types", {
    method: "GET",
    auth: true,
    signal,
  });
}

export function createStaff(payload) {
  return request("/staff", {
    method: "POST",
    auth: true,
    body: payload,
  });
}

export function updateStaff(staffId, payload) {
  return request(`/staff/${encodeURIComponent(String(staffId))}`, {
    method: "PUT",
    auth: true,
    body: payload,
  });
}

export function setStaffActive(staffId, active) {
  const action = active ? "activate" : "deactivate";
  return request(`/staff/${encodeURIComponent(String(staffId))}/${action}`, {
    method: "PATCH",
    auth: true,
  });
}

export function deleteStaff(staffId) {
  return request(`/staff/${encodeURIComponent(String(staffId))}`, {
    method: "DELETE",
    auth: true,
  });
}
