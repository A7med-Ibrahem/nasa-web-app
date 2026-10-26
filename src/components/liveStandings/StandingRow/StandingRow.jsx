import "./StandingRow.css";

import { standingsIcons } from "../../common/Icons/iconRegistry";

const CrownIcon = standingsIcons.crown;

function formatValue(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "—";
  }

  return Number.isInteger(number)
    ? number.toLocaleString("en-US")
    : number.toLocaleString("en-US", { maximumFractionDigits: 1 });
}

function formatPercentage(value) {
  const number = Number(value);

  return Number.isFinite(number) ? `${number.toFixed(1)}%` : "—";
}

function getInitials(name) {
  if (typeof name !== "string") {
    return "?";
  }

  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "?";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

/**
 * One standings row: rank, team, achieved / available score, percentage and the
 * number of judges counted.
 *
 * The rank is rendered exactly as the backend supplied it. `null` means the team
 * has no ranking yet and is shown as "—", never as a calculated position.
 */
export default function StandingRow({ entry }) {
  const hasRank = Number.isFinite(entry.rank);
  const isLeader = entry.rank === 1;

  return (
    <tr
      className="standing-row"
      data-standing-rank={hasRank ? entry.rank : undefined}
      data-standing-unranked={hasRank ? undefined : "true"}
    >
      <td className="standing-cell standing-cell--rank">
        <span className="standing-rank">
          {isLeader ? (
            <span className="standing-rank-crown" aria-hidden="true">
              <CrownIcon />
            </span>
          ) : null}
          <span className="standing-rank-value">
            {hasRank ? entry.rank : "—"}
          </span>
          {!hasRank ? <span className="visually-hidden">Unranked</span> : null}
          {entry.isTied ? (
            <span className="standing-tie">
              <span aria-hidden="true">T</span>
              <span className="visually-hidden">Tied rank</span>
            </span>
          ) : null}
        </span>
      </td>

      <td className="standing-cell standing-cell--team">
        <span className="standing-team">
          <span className="standing-avatar" aria-hidden="true">
            {getInitials(entry.teamName)}
          </span>

          <span className="standing-team-text">
            <span className="standing-team-name" title={entry.teamName}>
              {entry.teamName}
            </span>
          </span>
        </span>
      </td>

      <td className="standing-cell standing-cell--score">
        <span className="standing-score">
          {formatValue(entry.achievedScore)}
          <span className="standing-score-total">
            {" / "}
            {formatValue(entry.availableScore)}
          </span>
        </span>
      </td>

      <td className="standing-cell standing-cell--percentage">
        <span className="standing-percentage">
          {formatPercentage(entry.percentage)}
        </span>
      </td>

      <td className="standing-cell standing-cell--judges">
        <span className="standing-judges">{formatValue(entry.judgesCounted)}</span>
      </td>
    </tr>
  );
}
