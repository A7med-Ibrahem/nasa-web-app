import "./StandingsSidebar.css";

import ChallengeStatsCard from "../ChallengeStatsCard/ChallengeStatsCard";
import CurrentChallengeCard from "../CurrentChallengeCard/CurrentChallengeCard";
import QuickStatsCard from "../QuickStatsCard/QuickStatsCard";

/**
 * Right-hand sidebar for the standings dashboard.
 *
 * Owns the shared card surface (`.sidebar-card`) and its heading, because all
 * three cards present the same object. Each card keeps its own stylesheet for
 * its own internals, so this file is layout plus surface and nothing else.
 *
 * Its top aligns with the "Overall Standings" heading in the main column, so the
 * sidebar is marked `align-self: stretch`-free and the grid's `align-items: start`
 * keeps it top-aligned with the header rather than centred against the table.
 *
 * Below 768px the grid collapses to a single column and this stack simply follows
 * the table — the cards stay in the document, in reading order.
 */
export default function StandingsSidebar() {
  return (
    <aside
      className="standings-sidebar"
      aria-label="Standings summary"
      data-reveal-item
      data-reveal-variant="right"
    >
      <CurrentChallengeCard />
      <QuickStatsCard />
      <ChallengeStatsCard />
    </aside>
  );
}