/* ==========================================================================
   Staff error messages
   --------------------------------------------------------------------------
   Maps the documented backend codes and the empty 401/403 bodies to copy the
   page can show. ApiError's own message is used only when the server supplied
   one, so a policy failure never renders an empty string.
   ========================================================================== */

import { ApiError } from "../api/client";
import { staffData } from "../data/staffData";

function fallbackFor(error, fallback) {
  if (/not found/i.test(error?.message ?? "")) {
    return error.message;
  }
  return fallback;
}

function baseMessage(error, fallback) {
  if (!(error instanceof ApiError)) {
    return fallback;
  }
  if (error.isUnauthorized) {
    return error.message || staffData.common.unauthorized;
  }
  if (error.isForbidden) {
    return error.message || staffData.common.forbidden;
  }
  if (error.isNetworkError) {
    return error.message || staffData.common.network;
  }
  return error.message || fallback;
}

/** Error shown inside a request row after PATCH /requests/{id}. */
export function requestActionError(error) {
  if (error instanceof ApiError) {
    if (error.code === "request.not_found") {
      return staffData.requests.errors.request_not_found;
    }
    if (error.code === "request.invalid_status") {
      return staffData.requests.errors.request_invalid_status;
    }
  }
  return baseMessage(error, staffData.requests.errors.generic);
}

/** Error shown inside a request row after DELETE /requests/{id}. */
export function requestDeleteError(error) {
  return baseMessage(
    error,
    fallbackFor(error, staffData.requests.errors.genericDelete),
  );
}

/** Error shown by the check-in save bar after POST /attendance. */
export function attendanceSaveError(error) {
  if (error instanceof ApiError) {
    if (error.code === "attendance.empty") {
      return staffData.checkIn.errors.attendance_empty;
    }
    if (error.code === "attendance.invalid_status") {
      return staffData.checkIn.errors.attendance_invalid_status;
    }
    if (error.code === "attendance.students_not_found") {
      return staffData.checkIn.errors.attendance_students_not_found;
    }
  }
  return baseMessage(error, staffData.checkIn.errors.generic);
}

/** Error shown when a GET fails. */
export function loadError(error, fallback = staffData.common.loadError) {
  return baseMessage(error, fallback);
}
