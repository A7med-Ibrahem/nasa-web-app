import "./ChallengeStatsCard.css";

import { challengeStats } from "../../../data/liveStandingsData";

/**
 * Sidebar card: team count per challenge.
 *
 * The standings response has no challengeId, so a per-challenge breakdown cannot
 * be derived without inventing the association. The card keeps its place in the
 * dashboard and states that limitation instead of showing fixture counts.
 */
export default function ChallengeStatsCard() {
  return (
    <article className="sidebar-card challenge-stats" data-reveal-item>
      <h3 className="sidebar-card-title">{challengeStats.title}</h3>

      <p className="challenge-stat-empty">{challengeStats.unavailable}</p>
    </article>
  );
}
