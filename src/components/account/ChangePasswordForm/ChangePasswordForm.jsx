import { useRef, useState } from "react";
import "./ChangePasswordForm.css";

import { changePassword } from "../../../api/auth";
import { accountData } from "../../../data/accountData";
import { changePasswordErrorMessage } from "../../../utils/accountErrors";
import { EyeIcon, EyeOffIcon, LockIcon } from "../../common/Icons/Icons";

function PasswordField({
  id,
  label,
  value,
  placeholder,
  hint,
  error,
  autoComplete,
  disabled,
  inputRef,
  onChange,
}) {
  const [visible, setVisible] = useState(false);
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy =
    [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="account-field">
      <label className="account-field-label" htmlFor={id}>
        {label}
      </label>

      <div className="account-field-control">
        <span className="account-field-icon" aria-hidden="true">
          <LockIcon size={17} />
        </span>

        <input
          id={id}
          ref={inputRef}
          className="account-input account-input--password"
          type={visible ? "text" : "password"}
          name={id}
          autoComplete={autoComplete}
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
        />

        <button
          type="button"
          className="account-password-toggle"
          onClick={() => setVisible((current) => !current)}
          aria-label={
            visible
              ? accountData.changePassword.hidePassword
              : accountData.changePassword.showPassword
          }
          aria-pressed={visible}
          disabled={disabled}
        >
          {visible ? <EyeOffIcon size={17} /> : <EyeIcon size={17} />}
        </button>
      </div>

      {hint ? (
        <p className="account-field-hint" id={hintId}>
          {hint}
        </p>
      ) : null}

      {error ? (
        <p className="account-field-error" id={errorId} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/**
 * Change-password form (POST /auth/change-password).
 *
 * The shared API client adds the bearer token and parses the backend error
 * envelope; this form only owns client-side validation, the in-flight guard and
 * the success/error presentation. A successful change keeps the existing
 * session and clears every password field.
 */
export default function ChangePasswordForm() {
  const t = accountData.changePassword;
  const fields = t.fields;

  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentPasswordRef = useRef(null);
  const newPasswordRef = useRef(null);
  const confirmPasswordRef = useRef(null);

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
    setSubmitError("");
    setSuccessMessage("");
  }

  function validate() {
    const nextErrors = {};

    if (!form.currentPassword) {
      nextErrors.currentPassword = fields.currentPassword.required;
    }

    if (!form.newPassword) {
      nextErrors.newPassword = fields.newPassword.required;
    } else if (form.newPassword.length < 6) {
      nextErrors.newPassword = fields.newPassword.minLength;
    } else if (form.newPassword === form.currentPassword) {
      nextErrors.newPassword = fields.newPassword.unchanged;
    }

    if (!form.confirmPassword) {
      nextErrors.confirmPassword = fields.confirmPassword.required;
    } else if (form.confirmPassword !== form.newPassword) {
      nextErrors.confirmPassword = fields.confirmPassword.mismatch;
    }

    return nextErrors;
  }

  function focusFirstError(nextErrors) {
    if (nextErrors.currentPassword) {
      currentPasswordRef.current?.focus();
    } else if (nextErrors.newPassword) {
      newPasswordRef.current?.focus();
    } else if (nextErrors.confirmPassword) {
      confirmPasswordRef.current?.focus();
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    /* Duplicate-submit guard: the button is disabled too, but Enter can race
       the re-render. */
    if (isSubmitting) {
      return;
    }

    const nextErrors = validate();
    setErrors(nextErrors);
    setSubmitError("");
    setSuccessMessage("");

    if (Object.keys(nextErrors).length > 0) {
      focusFirstError(nextErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });

      setForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setErrors({});
      setSuccessMessage(
        result &&
          typeof result === "object" &&
          typeof result.message === "string" &&
          result.message.trim()
          ? result.message
          : t.success,
      );
    } catch (error) {
      setSubmitError(changePasswordErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section
      className="account-card"
      aria-labelledby="change-password-card-title"
    >
      <header className="account-card-header">
        <span className="account-card-badge" aria-hidden="true">
          <LockIcon size={22} />
        </span>
        <h2 className="account-card-title" id="change-password-card-title">
          {t.card.title}
        </h2>
        <p className="account-card-description">{t.card.description}</p>
      </header>

      <form className="account-form" onSubmit={handleSubmit} noValidate>
        <PasswordField
          id="current-password"
          label={fields.currentPassword.label}
          placeholder={fields.currentPassword.placeholder}
          autoComplete="current-password"
          value={form.currentPassword}
          error={errors.currentPassword}
          disabled={isSubmitting}
          inputRef={currentPasswordRef}
          onChange={(value) => updateField("currentPassword", value)}
        />

        <PasswordField
          id="new-password"
          label={fields.newPassword.label}
          placeholder={fields.newPassword.placeholder}
          hint={fields.newPassword.hint}
          autoComplete="new-password"
          value={form.newPassword}
          error={errors.newPassword}
          disabled={isSubmitting}
          inputRef={newPasswordRef}
          onChange={(value) => updateField("newPassword", value)}
        />

        <PasswordField
          id="confirm-password"
          label={fields.confirmPassword.label}
          placeholder={fields.confirmPassword.placeholder}
          autoComplete="new-password"
          value={form.confirmPassword}
          error={errors.confirmPassword}
          disabled={isSubmitting}
          inputRef={confirmPasswordRef}
          onChange={(value) => updateField("confirmPassword", value)}
        />

        <button
          type="submit"
          className="btn account-submit"
          disabled={isSubmitting}
          aria-busy={isSubmitting}
        >
          {isSubmitting ? t.submitting : t.submit}
        </button>

        {submitError ? (
          <p className="account-form-status account-form-status--error" role="alert">
            {submitError}
          </p>
        ) : null}

        {successMessage ? (
          <p
            className="account-form-status account-form-status--success"
            role="status"
            aria-live="polite"
          >
            {successMessage}
          </p>
        ) : null}
      </form>
    </section>
  );
}
