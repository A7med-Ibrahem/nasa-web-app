import { useEffect } from "react";

import LiveStandingsHero from "../../components/liveStandings/LiveStandingsHero/LiveStandingsHero";
import StandingsSection from "../../components/liveStandings/StandingsSection/StandingsSection";
import { liveStandings } from "../../data/liveStandingsData";
import useLiveStandings from "../../hooks/useLiveStandings";

/**
 * Live Standings page (`/live-standings`).
 *
 * Composition only: the feed lives in useLiveStandings so both the hero's live
 * badge and the dashboard read the same connection state. The hero needs it so
 * "LIVE" is never shown while the SignalR connection is down.
 */
export default function LiveStandings() {
  const liveStandingsState = useLiveStandings();

  useEffect(() => {
    document.title = `${liveStandings.overall.title} — NASA Space Apps Hurghada`;
  }, []);

  return (
    <>
      <LiveStandingsHero connectionState={liveStandingsState.connectionState} />
      <StandingsSection {...liveStandingsState} />
    </>
  );
}
