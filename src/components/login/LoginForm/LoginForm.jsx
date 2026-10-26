import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./LoginForm.css";

import {
  ArrowLeftIcon,
  ArrowRightIcon,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  MailIcon,
  UsersIcon,
} from "../../common/Icons/Icons";
import { ApiError } from "../../../api/client";
import { useAuth } from "../../../auth/useAuth";
import { loginPage } from "../../../data/loginData";
import { site } from "../../../data/site";

/**
 * Sign-in card for the Organizer & Judge portal (`/login`, right column).
 *
 * State is a single object shaped `{ identifier, password, rememberMe }` —
 * exactly the `POST /api/v1/auth/login/staff` request body. The field names
 * the backend expects and the names the form uses are identical, so no
 * translation layer is needed.
 *
 * Behaviour:
 *   - client-side required-field validation runs first, then one real request
 *   - duplicate submits are blocked while a request is in flight
 *   - failures (invalid credentials, 403, offline) render as an alert inside
 *     the form; nothing is stored and no navigation happens
 *   - only a server-issued access token creates a session, after which the
 *     visitor is sent to the route they originally asked for (or the Judge
 *     Dashboard for judges, the homepage otherwise)
 *
 * Validation messages are rendered inside the field's `aria-describedby`
 * chain with `role="alert"`, and the first invalid control receives focus.
 */
export default function LoginForm() {
  const [form, setForm] = useState({
    identifier: "",
    password: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const identifierRef = useRef(null);
  const passwordRef = useRef(null);

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const t = loginPage.form;
  const redirectTo = location.state?.from?.pathname || null;

  /* Already signed in (restored session or a fresh one): there is nothing to
     fill in here, so go straight to the area the visitor asked for. */
  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }
    navigate(redirectTo ?? "/", { replace: true });
  }, [isAuthenticated, navigate, redirectTo]);

  function updateField(field, value) {
    setForm((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => {
      if (!previous[field]) {
        return previous;
      }
      const next = { ...previous };
      delete next[field];
      return next;
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    /* Duplicate-submit guard: the button is disabled too, but an Enter key
       press can race the re-render. */
    if (isSubmitting) {
      return;
    }

    const nextErrors = {};
    if (!form.identifier.trim()) {
      nextErrors.identifier = t.identifierError;
    }
    if (!form.password) {
      nextErrors.password = t.passwordError;
    }

    setErrors(nextErrors);
    setSubmitError("");

    if (Object.keys(nextErrors).length > 0) {
      if (nextErrors.identifier) {
        identifierRef.current?.focus();
      } else {
        passwordRef.current?.focus();
      }
      return;
    }

    setIsSubmitting(true);

    try {
      const user = await login({
        identifier: form.identifier.trim(),
        password: form.password,
        rememberMe: form.rememberMe,
      });

      /* Reached only after the server issued a token. */
      const destination =
        redirectTo ?? (user.role === "Judge" ? "/judge" : "/");
      navigate(destination, { replace: true });
    } catch (error) {
      if (error instanceof ApiError && error.isUnauthorized) {
        /* The backend's own wording ("Invalid email/username or password.")
           is the clearest message available for this case. */
        setSubmitError(error.message || t.invalidCredentials);
      } else if (error instanceof ApiError && error.isForbidden) {
        setSubmitError(error.message || t.forbidden);
      } else if (error instanceof ApiError && error.isNetworkError) {
        setSubmitError(error.message || t.networkError);
      } else {
        setSubmitError(
          error instanceof ApiError && error.message ? error.message : t.genericError,
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const identifierInvalid = Boolean(errors.identifier);
  const passwordInvalid = Boolean(errors.password);

  return (
    <section
      className="login-card"
      aria-labelledby="login-card-title"
      data-reveal-item
      data-reveal-variant="scale"
    >
      <div className="login-card-brand">
        <span className="logo-frame login-card-logo-frame">
          <img
            src={site.logo}
            alt={site.logoAlt}
            className="login-card-logo"
          />
        </span>
        <span className="login-card-badge">
          <UsersIcon size={24} />
        </span>
      </div>

      <h2 className="login-card-title" id="login-card-title">
        {loginPage.card.title}
      </h2>
      <p className="login-card-subtitle">{loginPage.card.subtitle}</p>

      <form className="login-form" onSubmit={handleSubmit} noValidate>
        {/* ---------- Email or username ---------- */}
        <div className="login-field">
          <label className="login-field-label" htmlFor="login-identifier">
            {t.identifierLabel}
          </label>
          <div className="login-field-control">
            <span className="login-field-icon">
              <MailIcon size={17} />
            </span>
            <input
              id="login-identifier"
              ref={identifierRef}
              className="login-input"
              type="text"
              name="identifier"
              autoComplete="username"
              placeholder={t.identifierPlaceholder}
              value={form.identifier}
              onChange={(event) => updateField("identifier", event.target.value)}
              disabled={isSubmitting}
              aria-invalid={identifierInvalid}
              aria-describedby={
                identifierInvalid ? "login-identifier-error" : undefined
              }
            />
          </div>
          {identifierInvalid && (
            <p className="login-field-error" id="login-identifier-error" role="alert">
              {errors.identifier}
            </p>
          )}
        </div>

        {/* ---------- Password ---------- */}
        <div className="login-field">
          <label className="login-field-label" htmlFor="login-password">
            {t.passwordLabel}
          </label>
          <div className="login-field-control">
            <span className="login-field-icon">
              <LockIcon size={17} />
            </span>
            <input
              id="login-password"
              ref={passwordRef}
              className="login-input login-input--password"
              type={showPassword ? "text" : "password"}
              name="password"
              autoComplete="current-password"
              placeholder={t.passwordPlaceholder}
              value={form.password}
              onChange={(event) => updateField("password", event.target.value)}
              disabled={isSubmitting}
              aria-invalid={passwordInvalid}
              aria-describedby={
                passwordInvalid ? "login-password-error" : undefined
              }
            />
            <button
              type="button"
              className="login-password-toggle"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? t.hidePassword : t.showPassword}
            >
              {showPassword ? <EyeOffIcon size={17} /> : <EyeIcon size={17} />}
            </button>
          </div>
          {passwordInvalid && (
            <p className="login-field-error" id="login-password-error" role="alert">
              {errors.password}
            </p>
          )}
        </div>

        {/* ---------- Remember me / forgot password ---------- */}
        <div className="login-form-row">
          <span className="login-form-remember">
            <input
              id="login-remember"
              type="checkbox"
              checked={form.rememberMe}
              disabled={isSubmitting}
              onChange={(event) =>
                updateField("rememberMe", event.target.checked)
              }
            />
            <label htmlFor="login-remember">{t.rememberMe}</label>
          </span>

          {/* Not wired to anything yet: disabled rather than clickable so no
              control ever pretends a reset flow exists. */}
          <button type="button" className="login-form-forgot" disabled>
            {t.forgotPassword}
            <span className="visually-hidden"> — {t.forgotPasswordNote}</span>
          </button>
        </div>

        {/* ---------- Sign in ---------- */}
        <button
          type="submit"
          className="btn login-submit"
          disabled={isSubmitting}
          aria-busy={isSubmitting}
        >
          {isSubmitting ? t.submitting : t.submit}
          {!isSubmitting && <ArrowRightIcon size={17} />}
        </button>

        {submitError && (
          <p className="login-form-status login-form-status--error" role="alert">
            {submitError}
          </p>
        )}

        {/* ---------- OR ---------- */}
        <div className="login-form-divider">
          <span className="login-form-divider-line" aria-hidden="true" />
          <span className="login-form-divider-text">{t.or}</span>
          <span className="login-form-divider-line" aria-hidden="true" />
        </div>

        <Link to={t.back.href} className="login-form-back">
          <ArrowLeftIcon size={16} />
          {t.back.label}
        </Link>
      </form>
    </section>
  );
}
