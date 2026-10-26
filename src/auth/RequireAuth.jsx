import { Link, Navigate, useLocation } from "react-router-dom";
import "./RequireAuth.css";

import { useAuth } from "./useAuth";
import { ArrowLeftIcon, LockIcon } from "../components/common/Icons/Icons";

/**
 * Role gate for protected routes.
 *
 * The backend is the authority: this component only ever looks at the session
 * that `/auth/login/staff` + `/auth/me` produced, never at anything the user
 * typed or at a locally stored role.
 *
 * Three distinct outcomes, deliberately not collapsed into one redirect:
 *
 * - verifying / offline  -> the token exists but is still being checked, or
 *                          the check could not reach the server. A network
 *                          failure is never treated as "you are signed out",
 *                          so a retry panel is shown instead of a redirect.
 * - anonymous           -> redirect to /login, remembering where the visitor
 *                          was headed so they land there after signing in.
 * - wrong role          -> an access-denied panel: authenticated staff without
 *                          the required role never see the protected UI.
 */
export default function RequireAuth({ children, requiredRole }) {
  const { status, user, sessionError, retrySession } = useAuth();
  const location = useLocation();

  if (status === "restoring") {
    return (
      <div className="auth-gate" role="status" aria-live="polite">
        <span className="auth-gate-spinner" aria-hidden="true" />
        <p className="auth-gate-text">Verifying your session…</p>
      </div>
    );
  }

  if (status === "offline") {
    return (
      <div className="auth-gate auth-gate--panel" role="alert">
        <span className="auth-gate-icon" aria-hidden="true">
          <LockIcon size={22} />
        </span>
        <h2 className="auth-gate-title">Cannot verify your session</h2>
        <p className="auth-gate-text">
          {sessionError ||
            "The server is unreachable, so your sign-in could not be confirmed."}
        </p>
        <p className="auth-gate-note">
          Your session has been kept. Check your connection and try again.
        </p>
        <button type="button" className="btn auth-gate-action" onClick={retrySession}>
          Try again
        </button>
      </div>
    );
  }

  if (status !== "online" || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return (
      <div className="auth-gate auth-gate--panel" role="alert">
        <span className="auth-gate-icon" aria-hidden="true">
          <LockIcon size={22} />
        </span>
        <h2 className="auth-gate-title">You do not have access to this page</h2>
        <p className="auth-gate-text">
          This area is limited to the <strong>{requiredRole}</strong> role. Your
          account is signed in as <strong>{user.role || "staff"}</strong>.
        </p>
        <Link className="btn auth-gate-action" to="/">
          <ArrowLeftIcon size={16} />
          Back to homepage
        </Link>
      </div>
    );
  }

  return children;
}
