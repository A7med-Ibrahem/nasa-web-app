import "./InlineNotice.css";

/**
 * One-line success / error / info message. aria-live="polite" so a save result
 * is announced without moving focus, and no toast library is involved.
 */
export default function InlineNotice({
  tone = "info",
  message,
  children,
  onDismiss,
  dismissLabel = "Dismiss",
}) {
  const text = message ?? children;

  if (!text) {
    return null;
  }

  return (
    <div className={`admin-notice admin-notice--${tone}`} role="status" aria-live="polite">
      <span className="admin-notice-text">{text}</span>
      {onDismiss ? (
        <button
          type="button"
          className="admin-notice-dismiss"
          onClick={onDismiss}
          aria-label={dismissLabel}
        >
          ×
        </button>
      ) : null}
    </div>
  );
}
