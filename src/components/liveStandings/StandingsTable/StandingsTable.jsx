import "./StandingsTable.css";

import { overallStandings } from "../../../data/liveStandingsData";
import StandingRow from "../StandingRow/StandingRow";

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
 * A real <table> with a caption and scoped headers exposes the
 * rank / team / challenge / score / movement relationship to assistive technology
 * rather than implying it through visual alignment. Purely presentational: every
 * value comes from the data module.
 */
export default function StandingsTable() {
  const { columns, teams } = overallStandings;

  return (
    <div className="standings-table-card" data-reveal-item>
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
              <th scope="col" className="standings-table-col-challenge">
                {columns[2]}
              </th>
              <th scope="col" className="standings-table-col-score">
                {columns[3]}
              </th>
              <th scope="col" className="standings-table-col-movement">
                {columns[4]}
              </th>
            </tr>
          </thead>

          <tbody>
            {teams.map((team) => (
              <StandingRow key={team.id} team={team} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}