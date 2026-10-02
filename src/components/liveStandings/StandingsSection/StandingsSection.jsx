import { useRef } from "react";
import "./StandingsSection.css";

import { useRevealGroup } from "../../../hooks/useReveal";
import StandingsHeader from "../StandingsHeader/StandingsHeader";
import StandingsSidebar from "../StandingsSidebar/StandingsSidebar";
import StandingsTable from "../StandingsTable/StandingsTable";

/**
 * The standings dashboard: main table column and sidebar.
 *
 * Owns the two-column grid. The grid starts at the top of the dashboard — the
 * "Overall Standings" heading is the first thing in the left column — so it
 * aligns with the first sidebar card and the table begins directly beneath it.
 *
 * `minmax(0, 1fr)` on the main column is what keeps the table from forcing the
 * grid wider than the viewport; the table's own scroll container then handles any
 * remaining density itself.
 */
export default function StandingsSection() {
  const sectionRef = useRef(null);

  useRevealGroup(sectionRef, { stagger: 110 });

  return (
    <section
      className="section section--dark standings-section"
      ref={sectionRef}
      aria-labelledby="overall-standings-title"
    >
      <div className="container standings-grid">
        <div className="standings-main">
          <StandingsHeader />
          <StandingsTable />
        </div>

        <StandingsSidebar />
      </div>
    </section>
  );
}