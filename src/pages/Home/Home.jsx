import { useMemo } from "react";

import About from "../../components/home/About/About";
import CoreTeam from "../../components/home/CoreTeam/CoreTeam";
import CurrentEvent from "../../components/home/CurrentEvent/CurrentEvent";
import Hero from "../../components/home/Hero/Hero";
import PreviousEvents from "../../components/home/PreviousEvents/PreviousEvents";
import Sponsors from "../../components/home/Sponsors/Sponsors";
import { fetchSeasonMedia } from "../../api/seasonMedia";
import { fetchSponsors } from "../../api/sponsors";
import { SHOW_CORE_TEAM } from "../../data/homepageData";
import useApiResource from "../../hooks/useApiResource";
import { groupSponsorsByTier, orderSeasonMedia } from "../../utils/apiContent";

/**
 * Home page.
 *
 * Hero, About and Current Event are static copy. Previous Events and Sponsors
 * each own a request, so one failing endpoint never hides the other: the page
 * passes loading/error/ready state down and the sections stay presentational.
 * Challenges live on their own page (/challenges) and are not shown here.
 *
 * Core Team has no public endpoint, so it is guarded off by SHOW_CORE_TEAM
 * (the component and fixture stay in the tree for when that changes).
 *
 * There is deliberately no Home.css — the page adds no wrapper of its own, so
 * it has nothing to style.
 */
export default function Home() {
  const mediaResource = useApiResource(fetchSeasonMedia);
  const sponsorsResource = useApiResource(fetchSponsors);

  const eventItems = useMemo(
    () => orderSeasonMedia(mediaResource.data),
    [mediaResource.data],
  );
  const sponsorTiers = useMemo(
    () => groupSponsorsByTier(sponsorsResource.data),
    [sponsorsResource.data],
  );

  return (
    <>
      <Hero />
      <About />
      <CurrentEvent />
      <PreviousEvents
        status={mediaResource.status}
        events={eventItems}
        error={mediaResource.error}
        onRetry={mediaResource.retry}
      />
      {SHOW_CORE_TEAM ? <CoreTeam /> : null}
      <Sponsors
        status={sponsorsResource.status}
        tiers={sponsorTiers}
        error={sponsorsResource.error}
        onRetry={sponsorsResource.retry}
      />
    </>
  );
}
