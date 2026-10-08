import { useRef, useState } from "react";
import { Link } from "react-router-dom";
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
import { loginPage } from "../../../data/loginData";
import { site } from "../../../data/site";

/**
 * Sign-in card for the Organizer & Judge portal (`/login`, right column).
 *
 * State is a single object shaped `{ identifier, password, rememberMe }` —
 * exactly the payload a future `POST /auth/login` will need. There is no
 * backend in this project: submit only runs client-side required-field
 * validation and, when both fields are filled, moves the form to a clearly
 * labelled "ready" state. No fetch, no fake session, no stored credentials,
 * no navigation to a dashboard that does not exist yet.
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
  const [status, setStatus] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const identifierRef = useRef(null);
  const passwordRef = useRef(null);

  const t = loginPage.form;

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

  function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = {};
    if (!form.identifier.trim()) {
      nextErrors.identifier = t.identifierError;
    }
    if (!form.password) {
      nextErrors.password = t.passwordError;
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setStatus(null);
      if (nextErrors.identifier) {
        identifierRef.current?.focus();
      } else {
        passwordRef.current?.focus();
      }
      return;
    }

    /* Both fields are filled — as far as this project goes, that is the
       whole sign-in. The message below says so plainly instead of pretending
       anyone has been authenticated. */
    setStatus("ready");
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
        <button type="submit" className="btn login-submit">
          {t.submit}
          <ArrowRightIcon size={17} />
        </button>

        {status === "ready" && (
          <p className="login-form-status" role="status">
            {t.readyMessage}
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
