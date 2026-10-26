import "./TeamRosterList.css";

import { staffData } from "../../../data/staffData";

import DataState from "../../common/DataState/DataState";
import StatusBadge from "../StatusBadge/StatusBadge";

/**
 * Master list of the roster page.
 *
 * Presentational only: the page owns the server search, the selection and all
 * failures. Each row is a real button so the list is reachable by keyboard and
 * the selected team is exposed through `aria-current`.
 */
export default function TeamRosterList({
  teams,
  status,
  error,
  selectedTeamId,
  onSelect,
  onRetry,
}) {
  const copy = staffData.teams;
  const isLoading = status === "loading";
  const showList = teams.length > 0;

  return (
    <section
      className="staff-roster-list"
      aria-labelledby="staff-roster-list-title"
      aria-busy={isLoading ? "true" : undefined}
    >
      <div className="staff-roster-list-head">
        <h3 className="staff-roster-list-title" id="staff-roster-list-title">
          {copy.listTitle}
        </h3>
        {status === "ready" ? (
          <span className="staff-roster-list-count">
            {copy.resultLabel(teams.length)}
          </span>
        ) : null}
      </div>

      {status === "loading" && !showList ? (
        <DataState
          status="loading"
          title={copy.list.loading}
          tone="dark"
          compact
        />
      ) : null}

      {status === "error" ? (
        <DataState
          status="error"
          title={copy.list.errorTitle}
          message={error}
          retryLabel={staffData.common.retry}
          onRetry={onRetry}
          tone="dark"
          compact
        />
      ) : null}

      {status === "ready" && teams.length === 0 ? (
        <DataState
          status="ready"
          title={copy.list.empty}
          tone="dark"
          compact
        />
      ) : null}

      {showList ? (
        <ul className="staff-roster-list-items">
          {teams.map((team) => {
            const teamId = team?.teamId;
            const name = team?.name?.trim() || copy.list.fallbackName;
            const username = team?.username?.trim() || copy.list.fallbackUsername;
            const isSelected = teamId === selectedTeamId;

            return (
              <li key={teamId}>
                <button
                  type="button"
                  className={`staff-roster-list-item${
                    isSelected ? " is-selected" : ""
                  }`}
                  onClick={() => onSelect(teamId)}
                  aria-current={isSelected ? "true" : undefined}
                  aria-label={copy.list.selectLabel(name)}
                >
                  <span className="staff-roster-list-avatar" aria-hidden="true">
                    {name.slice(0, 1).toUpperCase()}
                  </span>
                  <span className="staff-roster-list-body">
                    <span className="staff-roster-list-name">{name}</span>
                    <span className="staff-roster-list-username">
                      {team?.username ? `@${team.username.trim()}` : username}
                    </span>
                  </span>
                  <StatusBadge status={team?.status} />
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}

      {status === "loading" && showList ? (
        <p className="staff-roster-list-loading" role="status" aria-live="polite">
          {copy.list.loading}
        </p>
      ) : null}
    </section>
  );
}
