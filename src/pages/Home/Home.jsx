import About from "../../components/home/About/About";
import CoreTeam from "../../components/home/CoreTeam/CoreTeam";
import CurrentEvent from "../../components/home/CurrentEvent/CurrentEvent";
import Hero from "../../components/home/Hero/Hero";
import PreviousEvents from "../../components/home/PreviousEvents/PreviousEvents";
import Sponsors from "../../components/home/Sponsors/Sponsors";
import TopChallenges from "../../components/home/TopChallenges/TopChallenges";

/**
 * Home page.
 *
 * Composition only: this file decides which sections appear and in which
 * order, while each section owns its own markup and styling, and all copy
 * comes from data/homepageData.js.
 *
 * There is deliberately no Home.css — the page adds no wrapper of its own, so
 * it has nothing to style.
 */
export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <CurrentEvent />
      <TopChallenges />
      <PreviousEvents />
      <CoreTeam />
      <Sponsors />
    </>
  );
}