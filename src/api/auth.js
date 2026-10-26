/* ==========================================================================
   Auth endpoints
   --------------------------------------------------------------------------
   Mirrors the documented Auth surface of the deployed backend:

   - POST /api/v1/auth/login/staff   { identifier, password, rememberMe }
   - GET  /api/v1/auth/me            Bearer token required

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

export function fetchCurrentUser() {
  return request("/auth/me", { method: "GET", auth: true });
}
