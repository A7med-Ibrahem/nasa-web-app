import "./StandingRow.css";

import { movementIcons, standingsIcons } from "../../common/Icons/iconRegistry";

const MovementIcon = movementIcons.up;
const DownIcon = movementIcons.down;
const CrownIcon = standingsIcons.crown;

/*
 * Movement is one of three states. The icon carries the direction and the
 * number carries the size, so the state is never conveyed by colour alone.
 * Each variant keeps a visually-hidden label too, because "up 2" is more useful
 * to a screen reader than an arrow glyph and a bare number.
 */
function Movement({ movement, movementBy }) {
  if (movement === "up") {
    return (
      <span className="standing-movement standing-movement--up">
        <MovementIcon />
        <span className="standing-movement-value">{movementBy}</span>
        <span className="visually-hidden">up {movementBy} places</span>
      </span>
    );
  }

  if (movement === "down") {
    return (
      <span className="standing-movement standing-movement--down">
        <DownIcon />
        <span className="standing-movement-value">{movementBy}</span>
        <span className="visually-hidden">down {movementBy} places</span>
      </span>
    );
  }

  return (
    <span className="standing-movement standing-movement--none">
      <span aria-hidden="true">&mdash;</span>
      <span className="visually-hidden">no change</span>
    </span>
  );
}

/**
 * One standings row: rank, team, challenge, total score, movement.
 *
 * Renders a single <tr>. The first-place treatment is expressed with the
 * existing card/border tokens rather than a new colour, and the crown is
 * decorative — the rank number in the first cell is the accessible version.
 */
export default function StandingRow({ team }) {
  const isLeader = team.rank === 1;

  return (
    <tr className="standing-row" data-standing-rank={team.rank}>
      <td className="standing-cell standing-cell--rank">
        <span className="standing-rank">
          {isLeader ? (
            <span className="standing-rank-crown" aria-hidden="true">
              <CrownIcon />
            </span>
          ) : null}
          <span className="standing-rank-value">{team.rank}</span>
        </span>
      </td>

      <td className="standing-cell standing-cell--team">
        <span className="standing-team">
          {/*
            Placeholder team mark: initials in a circle, built from the same
            tokens as the core-team avatar on the homepage. No external image URL
            is involved, so nothing to break when a team uploads a real logo —
            swap the <span> for an <img> and keep the box.
          */}
          <span className="standing-avatar" aria-hidden="true">
            {team.initials}
          </span>

          <span className="standing-team-text">
            <span className="standing-team-name">{team.name}</span>
          </span>
        </span>
      </td>

      <td className="standing-cell standing-cell--challenge">
        <span className="standing-challenge">{team.challenge}</span>
      </td>

      <td className="standing-cell standing-cell--score">
        <span className="standing-score">{team.score}</span>
      </td>

      <td className="standing-cell standing-cell--movement">
        <Movement movement={team.movement} movementBy={team.movementBy} />
      </td>
    </tr>
  );
}