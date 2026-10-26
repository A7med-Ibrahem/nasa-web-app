import "./StaffSummary.css";

/**
 * Small count strip. Every number is derived by the page from the rows it has
 * already loaded; no count is fetched from a separate endpoint.
 */
export default function StaffSummary({ items, label, ariaLabel, className = "" }) {
  const classes = ["staff-summary", className].filter(Boolean).join(" ");

  return (
    <section className={classes} aria-label={ariaLabel || label}>
      {label ? <p className="staff-summary-label">{label}</p> : null}
      <dl className="staff-summary-list">
        {items.map((item) => (
          <div
            className={`staff-summary-item${
              item.tone ? ` staff-summary-item--${item.tone}` : ""
            }`}
            key={item.key ?? item.label}
          >
            <dt>{item.label}</dt>
            <dd>{item.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
