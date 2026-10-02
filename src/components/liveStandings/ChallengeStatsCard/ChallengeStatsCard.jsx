import "./ChallengeStatsCard.css";

import { challengeStats } from "../../../data/liveStandingsData";

/**
 * Sidebar card: team count per challenge.
 *
 * The bar length is derived from the counts so the list reads as a comparison,
 * not just a list. It is expressed as a width percentage, so it animates nothing
 * and cannot affect layout height.
 */
export default function ChallengeStatsCard() {
  const maxTeams = Math.max(...challengeStats.items.map((item) => item.teams));

  return (
    <article className="sidebar-card challenge-stats" data-reveal-item>
      <h3 className="sidebar-card-title">{challengeStats.title}</h3>

      <ul className="challenge-stat-list">
        {challengeStats.items.map((item) => (
          <li className="challenge-stat" key={item.id}>
            <span className="challenge-stat-head">
              <span className="challenge-stat-name">{item.name}</span>
              <span className="challenge-stat-teams">{item.teams} teams</span>
            </span>

            <span className="challenge-stat-track" aria-hidden="true">
              <span
                className="challenge-stat-bar"
                data-tone={item.tone}
                style={{ width: `${(item.teams / maxTeams) * 100}%` }}
              />
            </span>
          </li>
        ))}
      </ul>
    </article>
  );
}