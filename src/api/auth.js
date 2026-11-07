/* ==========================================================================
   Auth endpoints
   --------------------------------------------------------------------------
   Mirrors the documented Auth surface of the deployed backend:

   - POST /api/v1/auth/login/staff      { identifier, password, rememberMe }
   - POST /api/v1/auth/login/participant { username, password, rememberMe }
   - POST /api/v1/auth/change-password  { currentPassword, newPassword }
   - GET  /api/v1/auth/me               Bearer token required

   `/auth/me` never returns a usable access token (its `accessToken` field is
   an empty string), so session restoration always reuses the stored token.
   ========================================================================== */

import { request } from "./client";

export function loginStaff({ identifier, password, rememberMe = false }) {
  return request("/auth/login/staff", {
    method: "POST",
    body: {
      identifier,
      password,
      rememberMe: Boolean(rememberMe),
    },
  });
}

export function loginParticipant({ username, password, rememberMe = false }) {
  return request("/auth/login/participant", {
    method: "POST",
    body: {
      username,
      password,
      rememberMe: Boolean(rememberMe),
    },
  });
}

export function fetchCurrentUser() {
  return request("/auth/me", { method: "GET", auth: true });
}

/**
 * Changes the password for the signed-in staff or participant account.
 *
 * The shared client adds the stored bearer token; the backend keeps the
 * existing session valid after a successful change.
 */
export function changePassword({ currentPassword, newPassword }) {
  return request("/auth/change-password", {
    method: "POST",
    auth: true,
    body: {
      currentPassword,
      newPassword,
    },
  });
}
