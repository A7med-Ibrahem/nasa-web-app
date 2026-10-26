import "./StandingsSidebar.css";

import ChallengeStatsCard from "../ChallengeStatsCard/ChallengeStatsCard";
import CurrentChallengeCard from "../CurrentChallengeCard/CurrentChallengeCard";
import QuickStatsCard from "../QuickStatsCard/QuickStatsCard";

function buildQuickStatItems(standings) {
  const ranked = standings.filter((entry) => Number.isFinite(entry.rank)).length;
  const total = standings.length;

  return [
    {
      id: "teams",
      value: String(total),
      label: "Total Teams",
      icon: "team",
      format: "count",
    },
    {
      id: "ranked",
      value: String(ranked),
      label: "Ranked Teams",
      icon: "chart",
      format: "count",
    },
    {
      id: "unranked",
      value: String(total - ranked),
      label: "Unranked Teams",
      icon: "users",
      format: "count",
    },
  ];
}

/**
 * Right-hand sidebar for the standings dashboard.
 *
 * Owns the shared card surface (`.sidebar-card`) and its heading, because all
 * three cards present the same object. Each card keeps its own stylesheet for
 * its own internals, so this file is layout plus surface and nothing else.
 *
 * Only the quick stats are derived from the live feed (team and rank counts).
 * Challenge cards deliberately stay unavailable because the endpoint provides no
 * challenge association.
 */
export default function StandingsSidebar({ standings }) {
  const quickStatItems = Array.isArray(standings)
    ? buildQuickStatItems(standings)
    : undefined;

  return (
    <aside
      className="standings-sidebar"
      aria-label="Standings summary"
      data-reveal-item
      data-reveal-variant="right"
    >
      <CurrentChallengeCard />
      <QuickStatsCard items={quickStatItems} />
      <ChallengeStatsCard />
    </aside>
  );
}
