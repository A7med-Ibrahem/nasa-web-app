/* ==========================================================================
   Staff attendance endpoints
   --------------------------------------------------------------------------
   Kept in one module so the staff pages never hand-build query strings:

   - GET  /requests?teamId=&type=&status=   (StaffOnly, all filter optional)
   - PATCH /requests/{id} { status }         (StaffOnly)
   - DELETE /requests/{id}                  (StaffOnly for any request)
   - GET  /attendance?teamId=&eventDate=&status=  (StaffOnly)
   - GET  /attendance/teams?search=&eventDate=    (CoreTeamOnly)
   - POST /attendance { eventDate, entries }      (CoreTeamOnly)
   ========================================================================== */

import { request } from "./client";

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

export function fetchStaffRequests({ teamId, type, status, signal } = {}) {
  return request(withQuery("/requests", { teamId, type, status }), {
    method: "GET",
    auth: true,
    signal,
  });
}

export function updateRequestStatus(requestId, status) {
  return request(`/requests/${requestId}`, {
    method: "PATCH",
    auth: true,
    body: { status },
  });
}

export function deleteStaffRequest(requestId) {
  return request(`/requests/${requestId}`, {
    method: "DELETE",
    auth: true,
  });
}

export function fetchAttendanceRecords(
  { teamId, eventDate, status, signal } = {},
) {
  return request(withQuery("/attendance", { teamId, eventDate, status }), {
    method: "GET",
    auth: true,
    signal,
  });
}

export function fetchAttendanceTeams({ search, eventDate, signal } = {}) {
  return request(withQuery("/attendance/teams", { search, eventDate }), {
    method: "GET",
    auth: true,
    signal,
  });
}

export function saveAttendance({ eventDate, entries }) {
  return request("/attendance", {
    method: "POST",
    auth: true,
    body: { eventDate, entries },
  });
}
