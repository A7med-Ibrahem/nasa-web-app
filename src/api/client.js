/* ==========================================================================
   HTTP client
   --------------------------------------------------------------------------
   The one place that talks to the backend over `fetch`:

   - JSON request bodies and JSON responses (204 / empty bodies -> `null`)
   - Bearer-token authorization read from the shared token store
   - the backend's documented error envelope,
       { "error": { "code": "...", "message": "..." } }
     which the server may also wrap in an array, plus ASP.NET's
     ProblemDetails and plain `{ message }` shapes as defensive fallbacks
   - network failures surfaced as an ApiError with `status: 0` so callers can
     tell "the server said no" apart from "the request never arrived"

   Nothing here ever fabricates a response: a failed request throws.
   ========================================================================== */

import { buildApiUrl } from "./config";
import { getStoredToken } from "../auth/tokenStorage";

/** Dispatched whenever the server rejects the stored token (HTTP 401). */
export const UNAUTHORIZED_EVENT = "spaceapps:unauthorized";

export class ApiError extends Error {
  constructor(message, { status = 0, code = "", payload = null } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.payload = payload;
  }

  /** The token is missing, expired or malformed. */
  get isUnauthorized() {
    return this.status === 401;
  }

  /** Authenticated, but the role is not allowed to perform this call. */
  get isForbidden() {
    return this.status === 403;
  }

  /** The request never reached the server (offline, DNS, CORS, timeout). */
  get isNetworkError() {
    return this.status === 0;
  }
}

/* The server may return the envelope directly or wrapped in an array; both
   shapes have been observed from the deployed service. */
function readErrorEnvelope(payload) {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const record = Array.isArray(payload) ? payload[0] : payload;
  if (!record || typeof record !== "object") {
    return null;
  }

  if (record.error && typeof record.error === "object") {
    return {
      code: record.error.code ?? "",
      message: record.error.message ?? "",
    };
  }

  if (typeof record.message === "string" && record.message) {
    return { code: record.code ?? "", message: record.message };
  }

  /* ASP.NET ProblemDetails: { title, detail, errors: { field: [...] } }. */
  if (record.title || record.detail) {
    const fieldErrors = record.errors
      ? Object.values(record.errors).flat().filter(Boolean).join(" ")
      : "";

    return {
      code: record.code ?? "",
      message: record.detail || record.title || fieldErrors,
    };
  }

  return null;
}

function statusFallbackMessage(status) {
  if (status === 401) {
    return "Your session is no longer valid. Please sign in again.";
  }
  if (status === 403) {
    return "You do not have permission to perform this action.";
  }
  if (status === 404) {
    return "The requested resource was not found.";
  }
  if (status === 429) {
    return "Too many requests. Please wait a moment and try again.";
  }
  if (status >= 500) {
    return "The server encountered an error. Please try again.";
  }
  return "The request could not be completed.";
}

function announceUnauthorized() {
  if (typeof window !== "undefined" && typeof window.dispatchEvent === "function") {
    window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT));
  }
}

/**
 * Performs one API request.
 *
 * @param {string} path  endpoint path relative to the configured base,
 *                       e.g. `/teams?search=atlas`
 * @param {object} options
 * @param {string} [options.method]
 * @param {any}    [options.body]        serialised as JSON when defined
 * @param {AbortSignal} [options.signal] cancellation for stale responses
 * @param {boolean} [options.auth=false]  require a token; fails fast when absent
 * @returns {Promise<any>} parsed JSON, or `null` for an empty response
 * @throws {ApiError}
 */
export async function request(path, options = {}) {
  const { method = "GET", body, signal, auth = false, headers = {} } = options;

  const token = getStoredToken();

  if (auth && !token) {
    throw new ApiError("You need to sign in to continue.", {
      status: 401,
      code: "auth.missing_token",
    });
  }

  const finalHeaders = { Accept: "application/json", ...headers };

  if (body !== undefined && body !== null) {
    finalHeaders["Content-Type"] = "application/json";
  }

  if (token) {
    finalHeaders.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(buildApiUrl(path), {
      method,
      headers: finalHeaders,
      body: body !== undefined && body !== null ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (error) {
    /* A deliberate abort is re-thrown untouched so callers can drop the
       response silently; everything else is a connectivity failure. */
    if (error && (error.name === "AbortError" || error.code === 20)) {
      throw error;
    }

    throw new ApiError(
      "Could not reach the server. Check your connection and try again.",
      { status: 0, code: "network.unreachable" },
    );
  }

  const text = await response.text().catch(() => "");

  let payload = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      if (response.ok) {
        throw new ApiError("The server returned an unreadable response.", {
          status: response.status,
          code: "response.invalid",
        });
      }
    }
  }

  if (!response.ok) {
    const envelope = readErrorEnvelope(payload);
    const message = envelope?.message || statusFallbackMessage(response.status);

    if (response.status === 401) {
      announceUnauthorized();
    }

    throw new ApiError(message, {
      status: response.status,
      code: envelope?.code || "",
      payload,
    });
  }

  return payload;
}

export const http = {
  get: (path, options) => request(path, { ...options, method: "GET" }),
  post: (path, body, options) => request(path, { ...options, method: "POST", body }),
};
