import { request } from "./client";

export function fetchRequests({ signal } = {}) {
  return request("/requests", { method: "GET", auth: true, signal });
}

export function createRequest({ type, message }) {
  return request("/requests", {
    method: "POST",
    auth: true,
    body: { type, message },
  });
}

export function deleteRequest(id) {
  return request(`/requests/${id}`, {
    method: "DELETE",
    auth: true,
  });
}
