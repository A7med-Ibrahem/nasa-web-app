import { useState } from "react";
import "./Fields.css";

import { EyeIcon, EyeOffIcon } from "../../common/Icons/Icons";

function describedByFor(id, hint, error) {
  const ids = [];
  if (hint) {
    ids.push(`${id}-hint`);
  }
  if (error) {
    ids.push(`${id}-error`);
  }
  return ids.length ? ids.join(" ") : undefined;
}

function FieldShell({
  id,
  label,
  hint,
  error,
  required = false,
  className = "",
  children,
}) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className={`admin-field ${className}`.trim()}>
      <label className="admin-field-label" htmlFor={id}>
        {label}
        {required ? (
          <span className="admin-field-required" aria-hidden="true">
            *
          </span>
        ) : null}
      </label>
      {children({
        describedBy: [hintId, errorId].filter(Boolean).join(" ") || undefined,
        invalid: Boolean(error),
        required,
      })}
      {hint ? (
        <p className="admin-field-hint" id={hintId}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p className="admin-field-error" id={errorId} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function AdminTextField({
  id,
  label,
  hint,
  error,
  required = false,
  className = "",
  type = "text",
  ...props
}) {
  return (
    <FieldShell
      id={id}
      label={label}
      hint={hint}
      error={error}
      required={required}
      className={className}
    >
      {({ describedBy, invalid }) => (
        <input
          {...props}
          id={id}
          type={type}
          className="admin-input"
          required={required}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
        />
      )}
    </FieldShell>
  );
}

export function AdminPasswordField({
  id,
  label,
  hint,
  error,
  required = false,
  className = "",
  autoComplete = "new-password",
  ...props
}) {
  const [visible, setVisible] = useState(false);

  return (
    <FieldShell
      id={id}
      label={label}
      hint={hint}
      error={error}
      required={required}
      className={className}
    >
      {({ describedBy, invalid }) => (
        <span className="admin-field-control">
          <input
            {...props}
            id={id}
            type={visible ? "text" : "password"}
            className="admin-input admin-input--with-action"
            autoComplete={autoComplete}
            required={required}
            aria-invalid={invalid || undefined}
            aria-describedby={describedBy}
          />
          <button
            type="button"
            className="admin-input-action"
            onClick={() => setVisible((current) => !current)}
            aria-label={visible ? "Hide password" : "Show password"}
            aria-pressed={visible}
          >
            {visible ? <EyeOffIcon size={17} /> : <EyeIcon size={17} />}
          </button>
        </span>
      )}
    </FieldShell>
  );
}

export function AdminNumberField({
  id,
  label,
  hint,
  error,
  required = false,
  className = "",
  ...props
}) {
  return (
    <FieldShell
      id={id}
      label={label}
      hint={hint}
      error={error}
      required={required}
      className={className}
    >
      {({ describedBy, invalid }) => (
        <input
          {...props}
          id={id}
          type="number"
          className="admin-input"
          required={required}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
        />
      )}
    </FieldShell>
  );
}

export function AdminSelectField({
  id,
  label,
  hint,
  error,
  required = false,
  className = "",
  options = [],
  placeholder,
  children,
  ...props
}) {
  return (
    <FieldShell
      id={id}
      label={label}
      hint={hint}
      error={error}
      required={required}
      className={className}
    >
      {({ describedBy, invalid }) => (
        <select
          {...props}
          id={id}
          className="admin-input admin-select"
          required={required}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
        >
          {placeholder ? <option value="">{placeholder}</option> : null}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
          {children}
        </select>
      )}
    </FieldShell>
  );
}

export function AdminTextareaField({
  id,
  label,
  hint,
  error,
  required = false,
  className = "",
  rows = 4,
  ...props
}) {
  return (
    <FieldShell
      id={id}
      label={label}
      hint={hint}
      error={error}
      required={required}
      className={className}
    >
      {({ describedBy, invalid }) => (
        <textarea
          {...props}
          id={id}
          rows={rows}
          className="admin-input admin-textarea"
          required={required}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
        />
      )}
    </FieldShell>
  );
}

export function AdminCheckboxField({
  id,
  label,
  hint,
  error,
  className = "",
  ...props
}) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = describedByFor(id, hint, error);

  return (
    <div className={`admin-field admin-field--switch ${className}`.trim()}>
      <label className="admin-switch" htmlFor={id}>
        <input
          {...props}
          id={id}
          type="checkbox"
          className="admin-switch-input"
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
        />
        <span className="admin-switch-track" aria-hidden="true" />
        <span className="admin-switch-label">{label}</span>
      </label>
      {hint ? (
        <p className="admin-field-hint" id={hintId}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p className="admin-field-error" id={errorId} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
