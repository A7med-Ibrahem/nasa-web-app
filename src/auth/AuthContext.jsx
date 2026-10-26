/* ==========================================================================
   Authentication context
   --------------------------------------------------------------------------
   The application's single authentication state:

   - `login()`      posts credentials to POST /auth/login/staff, then stores
                    the returned access token using the remember-me scope
   - `logout()`     clears the token and the in-memory session
   - boot restore   if a token exists, verifies it against GET /auth/me and
                    adopts the identity the server reports

   Status values:

   - "restoring"  a stored token is being verified with /auth/me
   - "online"     a verified session exists (`user` is populated)
   - "offline"    a token exists but /auth/me could not be reached — a
                  temporary connectivity failure, NOT proof the session is
                  invalid, so the token is kept and a retry is offered
   - "anonymous"  no usable session; protected routes redirect to /login

   The backend is the only authority for identity and role: `user` is built
   exclusively from server responses, never from anything the visitor typed.
   ========================================================================== */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { fetchCurrentUser, loginParticipant, loginStaff } from "../api/auth";
import { ApiError, UNAUTHORIZED_EVENT } from "../api/client";
import { clearStoredToken, getStoredToken, storeToken } from "./tokenStorage";
import { AuthContext } from "./useAuth";

/** Accepts both the login payload (`name`) and the staff payload (`fullName`). */
function normaliseUser(payload) {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const role = payload.role ?? null;

  const base = {
    role,
    name: payload.name || payload.fullName || "",
    username: payload.username ?? "",
    email: payload.email ?? "",
    staffId: payload.staffId ?? null,
    judgeId: payload.judgeId ?? null,
  };

  if (role === "Participant") {
    base.teamId = payload.teamId ?? null;
    base.team =
      payload.team && typeof payload.team === "object" ? payload.team : null;
    base.challenge =
      payload.challenge && typeof payload.challenge === "object"
        ? payload.challenge
        : null;
    base.students = Array.isArray(payload.students) ? payload.students : [];
  }

  return base;
}

// eslint-disable-next-line react-refresh/only-export-components
export { homeForRole } from "./authHome";

export function AuthProvider({ children }) {  const [status, setStatus] = useState(() =>
    getStoredToken() ? "restoring" : "anonymous",
  );
  const [user, setUser] = useState(null);
  const [sessionError, setSessionError] = useState("");

  /* React 18/19 StrictMode mounts effects twice in development; one restore
     per page load is enough. */
  const restoreStarted = useRef(false);

  const clearSession = useCallback(() => {
    clearStoredToken();
    setUser(null);
    setSessionError("");
    setStatus("anonymous");
  }, []);

  const restore = useCallback(async () => {
    const token = getStoredToken();
    if (!token) {
      setUser(null);
      setSessionError("");
      setStatus("anonymous");
      return;
    }

    setStatus("restoring");
    setSessionError("");

    try {
      const me = await fetchCurrentUser();
      const nextUser = normaliseUser(me);

      if (!nextUser || !nextUser.role) {
        /* A 200 that carries no identity cannot be trusted as a session. */
        clearSession();
        return;
      }

      setUser(nextUser);
      setStatus("online");
    } catch (error) {
      if (error instanceof ApiError && (error.isUnauthorized || error.isForbidden)) {
        /* The server rejected the token: drop it and start over at /login. */
        clearSession();
        return;
      }

      if (error instanceof ApiError && error.isNetworkError) {
        /* Connectivity problem — keep the token, offer a retry. */
        setUser(null);
        setSessionError(error.message);
        setStatus("offline");
        return;
      }

      /* Unexpected server-side failure: same treatment as connectivity. */
      setUser(null);
      setSessionError(
        error instanceof ApiError ? error.message : "Could not verify your session.",
      );
      setStatus("offline");
    }
  }, [clearSession]);

  useEffect(() => {
    if (restoreStarted.current) {
      return undefined;
    }
    restoreStarted.current = true;
    restore();
  }, [restore]);

  /* Any protected request that comes back 401 invalidates the whole session. */
  useEffect(() => {
    function handleUnauthorized() {
      clearStoredToken();
      setUser(null);
      setSessionError("");
      setStatus("anonymous");
    }

    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
  }, []);

  const login = useCallback(
    async (args = {}) => {
      const {
        mode = "staff",
        identifier,
        username,
        password,
        rememberMe = false,
      } = args;

      let response;
      if (mode === "participant") {
        response = await loginParticipant({
          username,
          password,
          rememberMe: Boolean(rememberMe),
        });
      } else {
        response = await loginStaff({
          identifier,
          password,
          rememberMe: Boolean(rememberMe),
        });
      }

      const token =
        response && typeof response === "object" ? response.accessToken : null;

      if (!token) {
        /* Never simulate a session: a successful HTTP call without a token is
           treated as a failure the form can report. */
        throw new ApiError("The server did not return an access token.", {
          status: 502,
          code: "auth.missing_token",
        });
      }

      const nextUser = normaliseUser(response);
      if (!nextUser || !nextUser.role) {
        throw new ApiError("The server returned an incomplete account.", {
          status: 502,
          code: "auth.incomplete_profile",
        });
      }

      storeToken(token, { remember: Boolean(rememberMe) });
      setUser(nextUser);
      setSessionError("");
      setStatus("online");

      return nextUser;
    },
    [],
  );

  const logout = useCallback(() => {
    clearSession();
  }, [clearSession]);

  const value = useMemo(
    () => ({
      status,
      user,
      sessionError,
      isAuthenticated: status === "online" && Boolean(user),
      login,
      logout,
      retrySession: restore,
    }),
    [status, user, sessionError, login, logout, restore],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
