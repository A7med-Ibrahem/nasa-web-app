import "./StandingsTable.css";

import { overallStandings } from "../../../data/liveStandingsData";
import StandingRow from "../StandingRow/StandingRow";

function TableState({ title, description, action, tone = "status" }) {
  return (
    <div className="standings-state" role={tone === "alert" ? "alert" : "status"}>
      <p className="standings-state-title">{title}</p>
      <p className="standings-state-description">{description}</p>

      {action ? (
        <button
          type="button"
          className="btn btn--ghost-dark standings-state-action"
          onClick={action.onClick}
        >
          {action.label}
        </button>
      ) : null}
    </div>
  );
}

/**
 * Overall standings table card.
 *
 * Two nested boxes on purpose:
 *
 * 1. `.standings-table-card` is the *surface* — border, radius, background and
 *    the generous internal padding, so the table never sits flush against the
 *    card edge.
 * 2. `.standings-table-wrapper` is the only horizontal scroll container on the
 *    page. It is sized by the grid column it sits in (`min-width: 0` on the
 *    parent), so a dense table scrolls *inside* the card and can never widen the
 *    document.
 *
 * The table renders the backend's order and values verbatim. A team with a null
 * rank stays unranked rather than being given a calculated position.
 */
export default function StandingsTable({ standings, phase, error, onRetry }) {
  const { columns, empty, error: errorCopy, loading } = overallStandings;
  const hasStandings = Array.isArray(standings);
  const hasRows = hasStandings && standings.length > 0;
  const showInitialError = phase === "error" && !hasStandings;
  const showInitialLoading = phase === "loading" && !hasStandings;

  return (
    <div className="standings-table-card" data-reveal-item>
      {showInitialLoading ? (
        <TableState title={loading} description={overallStandings.description} />
      ) : null}

      {showInitialError ? (
        <TableState
          title={errorCopy.title}
          description={error?.message || errorCopy.description}
          tone="alert"
          action={onRetry ? { label: errorCopy.retry, onClick: onRetry } : null}
        />
      ) : null}

      {!showInitialLoading && !showInitialError && hasStandings && !hasRows ? (
        <TableState title={empty.title} description={empty.description} />
      ) : null}

      {hasRows ? (
        <>
          {error ? (
            <div className="standings-table-notice" role="status">
              <span>{errorCopy.stale}</span>
              {onRetry ? (
                <button
                  type="button"
                  className="standings-table-notice-action"
                  onClick={onRetry}
                >
                  {errorCopy.retry}
                </button>
              ) : null}
            </div>
          ) : null}

          <div
            className="standings-table-wrapper"
            tabIndex={0}
            role="region"
            aria-label={`${overallStandings.title} table`}
          >
            <table className="standings-table">
              <caption className="visually-hidden">
                {overallStandings.title} — {overallStandings.description}
              </caption>

              <thead>
                <tr>
                  <th scope="col" className="standings-table-col-rank">
                    {columns[0]}
                  </th>
                  <th scope="col" className="standings-table-col-team">
                    {columns[1]}
                  </th>
                  <th scope="col" className="standings-table-col-score">
                    {columns[2]}
                  </th>
                  <th scope="col" className="standings-table-col-percentage">
                    {columns[3]}
                  </th>
                  <th scope="col" className="standings-table-col-judges">
                    {columns[4]}
                  </th>
                </tr>
              </thead>

              <tbody>
                {standings.map((entry) => (
                  <StandingRow key={entry.teamId} entry={entry} />
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : null}
    </div>
  );
}
