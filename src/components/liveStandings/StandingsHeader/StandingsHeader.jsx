import "./StandingsHeader.css";

import { overallStandings } from "../../../data/liveStandingsData";

function formatTimestamp(value) {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
}

/**
 * Header of the left dashboard column: the "Overall Standings" heading, its
 * supporting line, and the connection/freshness metadata aligned to the right.
 *
 * "Live" is only used while the SignalR connection is open; a dropped connection
 * keeps the last successful timestamp visible so the board never implies it is
 * still updating when it is not.
 */
export default function StandingsHeader({
  lastUpdated,
  connectionState = "connecting",
  isRefreshing = false,
  onRefresh,
}) {
  const { description, refresh, status, title } = overallStandings;
  const connectionLabel =
    status[connectionState] ?? status.connecting;
  const formattedTimestamp = formatTimestamp(lastUpdated);

  return (
    <header className="standings-header" data-reveal-item>
      <div className="standings-header-text">
        <h2 id="overall-standings-title" className="standings-header-title">
          {title}
        </h2>

        <p className="standings-header-description">{description}</p>
      </div>

      <div className="standings-header-meta">
        <p
          className="standings-header-status"
          data-state={connectionState}
          aria-live="polite"
        >
          <span className="standings-header-status-dot" aria-hidden="true" />
          <span className="standings-header-status-label">{connectionLabel}</span>

          {formattedTimestamp && lastUpdated ? (
            <>
              <span className="standings-header-status-separator" aria-hidden="true">
                ·
              </span>
              <span className="standings-header-status-label">
                {status.lastUpdated}
              </span>
              <time
                className="standings-header-status-time"
                dateTime={
                  lastUpdated instanceof Date
                    ? lastUpdated.toISOString()
                    : new Date(lastUpdated).toISOString()
                }
              >
                {formattedTimestamp}
              </time>
            </>
          ) : (
            <span className="standings-header-status-label">{status.waiting}</span>
          )}
        </p>

        <button
          type="button"
          className="standings-header-refresh"
          onClick={onRefresh}
          disabled={isRefreshing}
        >
          {isRefreshing ? refresh.busy : refresh.idle}
        </button>
      </div>
    </header>
  );
}
