import { ArrowRightIcon, SearchIcon } from "../../common/Icons/Icons";
import "./TeamTable.css";

import { judgeDashboard } from "../../../data/judgeDashboard";

/**
 * Team results table.
 *
 * Every column maps to a field the summary endpoint actually returns
 * (`teamId`, `name`, `username`, `status`, `logo`); nothing here invents a
 * challenge, submission time or judging state. Rows are button-driven rather
 * than links because selecting a team is an in-page action, not a route
 * change — which also keeps keyboard activation and `aria-pressed` semantics
 * honest.
 *
 * The wrapper is the only horizontal scroll container: on narrow screens the
 * table keeps a minimum width and scrolls inside the card, so the document
 * never widens.
 */
export default function TeamTable({
  teams,
  status,
  error,
  selectedTeamId,
  onSelect,
  caption,
}) {
  const { table, search } = judgeDashboard;

  if (status === "loading") {
    return (
      <div className="team-table-card" data-reveal-item data-reveal-variant="up">
        <div className="team-state" role="status" aria-live="polite">
          <span className="team-state-spinner" aria-hidden="true" />
          <p className="team-state-text">{search.initialLoading}</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="team-table-card" data-reveal-item data-reveal-variant="up">
        <div className="team-state team-state--error" role="alert">
          <p className="team-state-title">{search.errorTitle}</p>
          <p className="team-state-text">{error}</p>
        </div>
      </div>
    );
  }

  if (teams.length === 0) {
    return (
      <div className="team-table-card" data-reveal-item data-reveal-variant="up">
        <div className="team-state" role="status">
          <span className="team-state-icon" aria-hidden="true">
            <SearchIcon size={20} />
          </span>
          <p className="team-state-title">{search.emptyTitle}</p>
          <p className="team-state-text">{search.emptyText}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="team-table-card" data-reveal-item data-reveal-variant="up">
      <div
        className="team-table-wrapper"
        tabIndex={0}
        role="region"
        aria-label={caption}
      >
        <table className="team-table">
          <caption className="visually-hidden">{caption}</caption>

          <thead>
            <tr>
              <th scope="col" className="team-table-col-index">
                {table.columns.index}
              </th>
              <th scope="col" className="team-table-col-team">
                {table.columns.team}
              </th>
              <th scope="col" className="team-table-col-id">
                {table.columns.teamId}
              </th>
              <th scope="col" className="team-table-col-username">
                {table.columns.username}
              </th>
              <th scope="col" className="team-table-col-status">
                {table.columns.status}
              </th>
              <th scope="col" className="team-table-col-action">
                {table.columns.action}
              </th>
            </tr>
          </thead>

          <tbody>
            {teams.map((team, index) => {
              const isSelected = team?.teamId === selectedTeamId;
              const name = team?.name?.trim() || table.fallbackName;

              return (
                <tr
                  key={team?.teamId ?? index}
                  className={isSelected ? "team-table-row team-table-row--selected" : "team-table-row"}
                >
                  <td className="team-table-cell-index">{index + 1}</td>

                  <td className="team-table-cell-team">
                    <span className="team-table-team">
                      <span className="team-table-avatar" aria-hidden="true">
                        {name.slice(0, 1).toUpperCase()}
                      </span>
                      <span className="team-table-team-name">{name}</span>
                    </span>
                  </td>

                  <td className="team-table-cell-id">#{team?.teamId ?? "—"}</td>

                  <td className="team-table-cell-username">
                    {team?.username?.trim() || table.fallbackUsername}
                  </td>

                  <td className="team-table-cell-status">
                    {team?.status ? (
                      <span className="team-table-status">{team.status}</span>
                    ) : (
                      "—"
                    )}
                  </td>

                  <td className="team-table-cell-action">
                    <button
                      type="button"
                      className="team-table-view"
                      aria-pressed={isSelected}
                      aria-label={table.viewLabel(name)}
                      onClick={() => onSelect(team.teamId)}
                      disabled={team?.teamId === undefined || team?.teamId === null}
                    >
                      {table.view}
                      <ArrowRightIcon size={15} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
