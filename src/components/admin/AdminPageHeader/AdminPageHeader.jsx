import "./AdminPageHeader.css";

/**
 * Heading block for an admin page. The layout owns the area title; the page
 * owns its own heading, description and one primary action.
 */
export default function AdminPageHeader({
  eyebrow,
  title,
  description,
  titleId = "admin-page-title",
  actionLabel,
  onAction,
  actionDisabled = false,
  actionBusy = false,
  actionBusyLabel,
  children,
}) {
  const hasAction = Boolean(actionLabel && onAction);

  return (
    <header className="admin-page-header">
      <div className="admin-page-header-copy">
        {eyebrow ? <p className="eyebrow admin-page-header-eyebrow">{eyebrow}</p> : null}
        <h2 className="admin-page-header-title" id={titleId}>
          {title}
        </h2>
        {description ? (
          <p className="admin-page-header-description">{description}</p>
        ) : null}
      </div>

      {hasAction || children ? (
        <div className="admin-page-header-actions">
          {hasAction ? (
            <button
              type="button"
              className="btn btn--primary admin-page-header-action"
              onClick={onAction}
              disabled={actionDisabled || actionBusy}
              aria-busy={actionBusy || undefined}
            >
              {actionBusy ? actionBusyLabel || actionLabel : actionLabel}
            </button>
          ) : null}
          {children}
        </div>
      ) : null}
    </header>
  );
}
