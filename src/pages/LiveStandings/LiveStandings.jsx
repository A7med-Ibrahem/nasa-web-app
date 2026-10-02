import { useEffect } from "react";

import LiveStandingsHero from "../../components/liveStandings/LiveStandingsHero/LiveStandingsHero";
import StandingsSection from "../../components/liveStandings/StandingsSection/StandingsSection";
import { liveStandings } from "../../data/liveStandingsData";

/**
 * Live Standings page (`/live-standings`).
 *
 * Composition only, exactly like pages/Home/Home.jsx: this file decides which
 * blocks appear and in which order, every block owns its own markup and styling,
 * and all copy comes from data/liveStandingsData.js. It renders no Navbar or
 * Footer — those come from MainLayout, so they are mounted once and survive every
 * navigation.
 *
 * There is deliberately no LiveStandings.css, for the same reason Home has none:
 * the page adds no wrapper of its own, so it has nothing to style.
 *
 * `liveStandings.overall.title` doubles as the document title, which is the only
 * page-level side effect here. A future backend replaces the import in
 * data/liveStandingsData.js and nothing in this file changes.
 */
export default function LiveStandings() {
  useEffect(() => {
    document.title = `${liveStandings.overall.title} — NASA Space Apps Hurghada`;
  }, []);

  return (
    <>
      <LiveStandingsHero />
      <StandingsSection />
    </>
  );
}