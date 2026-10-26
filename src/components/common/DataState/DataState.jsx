import "./DataState.css";

/**
 * Shared loading / error / empty block for API-backed sections.
 *
 * Presentational only: the page supplies copy, the error message and the retry
 * handler. `tone` picks the dark or light palette; `compact` is for a block
 * inside a home section rather than a whole page.
 */
export default function DataState({
  status,
  title,
  message,
  retryLabel,
  onRetry,
  tone = "dark",
  compact = false,
  className = "",
}) {
  const classes = [
    "data-state",
    `data-state--${tone}`,
    compact ? "data-state--compact" : "",
    status === "error" ? "data-state--error" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (status === "loading") {
    return (
      <div className={classes} role="status" aria-live="polite">
        <span className="data-state-spinner" aria-hidden="true" />
        {title ? <p className="data-state-title">{title}</p> : null}
        {message ? <p className="data-state-text">{message}</p> : null}
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className={classes} role="alert">
        {title ? <p className="data-state-title">{title}</p> : null}
        {message ? <p className="data-state-text">{message}</p> : null}
        {onRetry && retryLabel ? (
          <button
            type="button"
            className={`btn ${
              tone === "light" ? "btn--ghost-light" : "btn--ghost-dark"
            }`}
            onClick={onRetry}
          >
            {retryLabel}
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div className={classes} role="status">
      {title ? <p className="data-state-title">{title}</p> : null}
      {message ? <p className="data-state-text">{message}</p> : null}
    </div>
  );
}
