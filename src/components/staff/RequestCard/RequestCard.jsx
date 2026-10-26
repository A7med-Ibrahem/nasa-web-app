import "./RequestCard.css";

import { staffData } from "../../../data/staffData";
import { formatDateTime } from "../../../utils/dates";
import { canonicalRequestStatus } from "../../../utils/staffStatus";
import StatusBadge from "../StatusBadge/StatusBadge";

/**
 * One request row/card. Presentational only: the page owns the request,
 * per-row in-flight state and error text.
 */
export default function RequestCard({
  request,
  teamName,
  busyAction,
  error,
  isNew,
  onAction,
  onDelete,
}) {
  const copy = staffData.requests;
  const current = canonicalRequestStatus(request.status);
  const busy = Boolean(busyAction);

  const statusActions = [
    { key: "progress", label: copy.actions.inProgress, value: "In Progress" },
    { key: "resolve", label: copy.actions.resolve, value: "Resolved" },
    { key: "reject", label: copy.actions.reject, value: "Rejected" },
  ].filter((action) => current !== action.value);

  const classes = ["staff-request-card", isNew ? "is-new" : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <li className={classes}>
      <div className="staff-request-head">
        <div className="staff-request-identity">
          <p className="staff-request-team">{teamName}</p>
          <p className="staff-request-meta">
            <span className="staff-request-type">
              {request.type || staffData.common.dash}
            </span>
            <span>{copy.card.requestId(request.requestId)}</span>
          </p>
        </div>
        <StatusBadge status={request.status} />
      </div>

      <p className="staff-request-message">
        {request.message || copy.card.messageFallback}
      </p>

      <dl className="staff-request-times">
        <div>
          <dt>{copy.card.createdAt}</dt>
          <dd>{formatDateTime(request.createdAt)}</dd>
        </div>
        {request.resolvedAt ? (
          <div>
            <dt>{copy.card.resolvedAt}</dt>
            <dd>{formatDateTime(request.resolvedAt)}</dd>
          </div>
        ) : null}
      </dl>

      {isNew ? (
        <span className="visually-hidden">{copy.states.newRow}</span>
      ) : null}

      <div
        className="staff-request-actions"
        aria-label={copy.card.actionsLabel}
      >
        {statusActions.map((action) => (
          <button
            key={action.key}
            type="button"
            className="btn btn--ghost-dark staff-request-action"
            onClick={() => onAction(request, action.value)}
            disabled={busy}
          >
            {action.label}
          </button>
        ))}
        <button
          type="button"
          className="btn staff-request-action staff-request-action--danger"
          onClick={() => onDelete(request)}
          disabled={busy}
        >
          {busyAction === "delete" ? copy.actions.deleting : copy.actions.remove}
        </button>
      </div>

      {error ? (
        <p className="staff-request-error" role="alert">
          {error}
        </p>
      ) : null}
    </li>
  );
}
