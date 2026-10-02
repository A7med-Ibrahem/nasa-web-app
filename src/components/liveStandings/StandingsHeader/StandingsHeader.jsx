import "./StandingsHeader.css";

import { overallStandings } from "../../../data/liveStandingsData";

/**
 * Header of the left dashboard column: the "Overall Standings" heading, its
 * supporting line, and the small freshness block aligned to the right.
 *
 * This sits inside the left grid column rather than spanning both, so the top of
 * the heading lines up with the top of the "Current Challenge" card in the
 * sidebar and the table starts directly underneath it.
 */
export default function StandingsHeader() {
  const { status, title, description } = overallStandings;

  return (
    <header className="standings-header" data-reveal-item>
      <div className="standings-header-text">
        <h2 id="overall-standings-title" className="standings-header-title">
          {title}
        </h2>

        <p className="standings-header-description">{description}</p>
      </div>

      {/*
        Placeholder freshness indicator. The timestamp is static data, not a
        reading from the browser clock, because the page must not imply a live
        value it cannot actually guarantee. When a backend exists this block is
        the only thing that changes.
      */}
      <p className="standings-header-status">
        <span className="standings-header-status-dot" aria-hidden="true" />
        <span className="standings-header-status-label">{status.label}</span>
        <time
          className="standings-header-status-time"
          dateTime={status.isoTimestamp}
        >
          {status.timestamp}
        </time>
      </p>
    </header>
  );
}