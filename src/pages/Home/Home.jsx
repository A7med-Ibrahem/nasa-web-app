import { useMemo } from "react";

import About from "../../components/home/About/About";
import CoreTeam from "../../components/home/CoreTeam/CoreTeam";
import CurrentEvent from "../../components/home/CurrentEvent/CurrentEvent";
import Hero from "../../components/home/Hero/Hero";
import PreviousEvents from "../../components/home/PreviousEvents/PreviousEvents";
import Sponsors from "../../components/home/Sponsors/Sponsors";
import { fetchCoreTeam } from "../../api/coreTeam";
import { fetchSeasonMedia } from "../../api/seasonMedia";
import { fetchSponsors } from "../../api/sponsors";
import useApiResource from "../../hooks/useApiResource";
import {
  groupSponsorsByTier,
  normaliseCoreTeamMembers,
  orderSeasonMedia,
} from "../../utils/apiContent";

/**
 * Home page.
 *
 * Hero, About and Current Event are static copy. Previous Events, Core Team
 * and Sponsors each own a request, so one failing endpoint never hides the
 * others: the page passes loading/error/ready state down and the sections stay
 * presentational. Challenges live on their own page (/challenges) and are not
 * shown here.
 *
 * There is deliberately no Home.css — the page adds no wrapper of its own, so
 * it has nothing to style.
 */
export default function Home() {
  const mediaResource = useApiResource(fetchSeasonMedia);
  const coreTeamResource = useApiResource(fetchCoreTeam);
  const sponsorsResource = useApiResource(fetchSponsors);

  const eventItems = useMemo(
    () => orderSeasonMedia(mediaResource.data),
    [mediaResource.data],
  );
  const teamMembers = useMemo(
    () => normaliseCoreTeamMembers(coreTeamResource.data),
    [coreTeamResource.data],
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
      <CoreTeam
        status={coreTeamResource.status}
        members={teamMembers}
        error={coreTeamResource.error}
        onRetry={coreTeamResource.retry}
      />
      <Sponsors
        status={sponsorsResource.status}
        tiers={sponsorTiers}
        error={sponsorsResource.error}
        onRetry={sponsorsResource.retry}
      />
    </>
  );
}
