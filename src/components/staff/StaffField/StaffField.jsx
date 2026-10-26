import "./StaffField.css";

/**
 * One labelled filter control. The page supplies the <input>, <select> or
 * checkbox itself; this wrapper only owns the label, hint and error spacing.
 */
export default function StaffField({
  id,
  label,
  hint,
  error,
  className = "",
  children,
}) {
  const classes = ["staff-field", className].filter(Boolean).join(" ");

  return (
    <div className={classes}>
      <label className="staff-field-label" htmlFor={id}>
        {label}
      </label>
      {children}
      {hint ? <p className="staff-field-hint">{hint}</p> : null}
      {error ? (
        <p className="staff-field-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
