/* ==========================================================================
   Account error helpers
   --------------------------------------------------------------------------
   Maps the documented change-password error codes to user-facing copy. The
   server's own message is used only when no code-specific wording exists, so
   an empty 401/403 body never renders an empty string.
   ========================================================================== */

import { ApiError } from "../api/client";
import { accountData } from "../data/accountData";

const copy = accountData.changePassword.errors;

/* Documented endpoint codes take precedence over HTTP-status fallbacks: the
   server may return one of these with a 401 or 403, and the specific reason is
   more useful than "permission denied". */
const codeMessages = {
  "auth.invalid_current_password": copy["auth.invalid_current_password"],
  "auth.weak_password": copy["auth.weak_password"],
  "auth.password_unchanged": copy["auth.password_unchanged"],
  "auth.account_inactive": copy["auth.account_inactive"],
  "user.unauthenticated": copy["user.unauthenticated"],
};

export function changePasswordErrorMessage(error) {
  if (!(error instanceof ApiError)) {
    return copy.generic;
  }

  /* The deployed server mixes dotted and underscore spellings. */
  const key = String(error.code || "").replace(/_/g, ".");
  if (codeMessages[key]) {
    return codeMessages[key];
  }

  if (error.isUnauthorized) {
    return error.message || copy["user.unauthenticated"];
  }
  if (error.isForbidden) {
    return error.message || copy.forbidden;
  }
  if (error.isNetworkError) {
    return error.message || copy.network;
  }

  if (error.status >= 500) {
    return copy.generic;
  }

  return error.message || copy.generic;
}
