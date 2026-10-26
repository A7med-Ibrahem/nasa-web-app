/* ==========================================================================
   Admin sponsor and tier endpoints
   --------------------------------------------------------------------------
   Reads are public on the server, but the admin always asks for inactive
   sponsors and sends the bearer token like every other admin call.
   ========================================================================== */

import { request } from "../client";

export function fetchSponsorsAdmin({ includeInactive = true, signal } = {}) {
  const flag = includeInactive ? "true" : "false";
  return request(`/sponsors?includeInactive=${flag}`, {
    method: "GET",
    auth: true,
    signal,
  });
}

export function fetchSponsorTiersAdmin({ signal } = {}) {
  return request("/sponsors/tiers", {
    method: "GET",
    auth: true,
    signal,
  });
}

export function createSponsor(payload) {
  return request("/sponsors", {
    method: "POST",
    auth: true,
    body: payload,
  });
}

export function updateSponsor(sponsorId, payload) {
  return request(`/sponsors/${encodeURIComponent(String(sponsorId))}`, {
    method: "PUT",
    auth: true,
    body: payload,
  });
}

export function deleteSponsor(sponsorId) {
  return request(`/sponsors/${encodeURIComponent(String(sponsorId))}`, {
    method: "DELETE",
    auth: true,
  });
}

export function createSponsorTier(payload) {
  return request("/sponsors/tiers", {
    method: "POST",
    auth: true,
    body: payload,
  });
}

export function updateSponsorTier(tierId, payload) {
  return request(`/sponsors/tiers/${encodeURIComponent(String(tierId))}`, {
    method: "PUT",
    auth: true,
    body: payload,
  });
}

export function deleteSponsorTier(tierId) {
  return request(`/sponsors/tiers/${encodeURIComponent(String(tierId))}`, {
    method: "DELETE",
    auth: true,
  });
}
