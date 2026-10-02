/* ==========================================================================
   Live Standings page content
   --------------------------------------------------------------------------
   Single source of truth for /live-standings, mirroring how site.js and
   homepageData.js feed the shared chrome and the homepage.

   ------------------------------------------------------------------------
   BACKEND BOUNDARY
   ------------------------------------------------------------------------
   There is no backend yet, so everything below is static fixture data. It is
   shaped deliberately like a REST payload instead of like JSX helpers, which is
   what makes the swap a one-line change later:

       import { liveStandings } from "../services/liveStandingsService";

   Nothing else in the app needs to move. Two rules keep that promise:

     1. Components are presentational. They read these objects and render them;
        none of them compute a score, a rank or a movement value.
     2. UI-only concerns that a payload could never know about (the exact copy
        strings, the button label) live here as data, not inside the components.

   The one derived value in the UI is a team's initials block for its avatar,
   and even that is exposed through `initials` below rather than computed in the
   row component.

   Nothing here performs a request, and there is no mock server.
   ========================================================================== */

import earthClimateImage from "../assets/images/earth-climate.jpeg";
import heroEarthImage from "../assets/images/hero-earth.jpeg";

/* --------------------------------------------------------------------------
   Hero
   -------------------------------------------------------------------------- */

export const liveStandingsHero = {
  id: "live-standings-hero",
  badge: {
    label: "LIVE",
    detail: "REAL-TIME UPDATES",
  },
  title: "Live Standings",
  description:
    "Follow the latest rankings and see how teams are performing in real-time. Scores update automatically as judges submit their evaluations.",
  /* Reuses the homepage Earth artwork rather than shipping a second copy of the
     same file: Vite emits one hashed asset for both pages. */
  image: {
    src: heroEarthImage,
    alt: "",
  },
};

/* --------------------------------------------------------------------------
   Overall standings
   -------------------------------------------------------------------------- */

export const overallStandings = {
  id: "overall-standings",
  title: "Overall Standings",
  description: "Top teams competing in NASA Space Apps Hurghada 2026.",
  /*
   * Placeholder UI state, deliberately not a live reading. When a backend
   * exists this becomes whatever the API reports, and the timestamp is
   * rendered from it rather than from the browser clock — the point is that the
   * page never implies a freshness it cannot actually guarantee.
   */
  status: {
    label: "Last updated",
    timestamp: "Apr 26, 2026 · 14:32",
    isoTimestamp: "2026-04-26T14:32:00Z",
  },
  columns: ["#", "Team", "Challenge", "Total score", "Movement"],
  teams: [
    {
      id: "nova-terra",
      rank: 1,
      name: "Nova Terra",
      challenge: "Climate Resilience",
      challengeId: "climate-resilience",
      score: 956,
      movement: "up",
      movementBy: 2,
      initials: "NT",
    },
    {
      id: "astro-guardians",
      rank: 2,
      name: "AstroGuardians",
      challenge: "Space Exploration",
      challengeId: "future-of-exploration",
      score: 942,
      movement: "up",
      movementBy: 1,
      initials: "AG",
    },
    {
      id: "pixel-planet",
      rank: 3,
      name: "Pixel Planet",
      challenge: "Sustainable Future",
      challengeId: "sustainable-future",
      score: 928,
      movement: "down",
      movementBy: 1,
      initials: "PP",
    },
    {
      id: "green-orbit",
      rank: 4,
      name: "Green Orbit",
      challenge: "Climate Resilience",
      challengeId: "climate-resilience",
      score: 912,
      movement: "none",
      initials: "GO",
    },
    {
      id: "quantum-leap",
      rank: 5,
      name: "Quantum Leap",
      challenge: "Open Innovation",
      challengeId: "open-innovation",
      score: 896,
      movement: "up",
      movementBy: 2,
      initials: "QL",
    },
    {
      id: "solar-flare",
      rank: 6,
      name: "Solar Flare",
      challenge: "Space Exploration",
      challengeId: "future-of-exploration",
      score: 883,
      movement: "down",
      movementBy: 1,
      initials: "SF",
    },
    {
      id: "skyline",
      rank: 7,
      name: "Skyline",
      challenge: "Sustainable Future",
      challengeId: "sustainable-future",
      score: 871,
      movement: "up",
      movementBy: 3,
      initials: "SL",
    },
    {
      id: "terraform",
      rank: 8,
      name: "TerraForm",
      challenge: "Climate Resilience",
      challengeId: "climate-resilience",
      score: 854,
      movement: "down",
      movementBy: 1,
      initials: "TF",
    },
    {
      id: "stellar-minds",
      rank: 9,
      name: "Stellar Minds",
      challenge: "Open Innovation",
      challengeId: "open-innovation",
      score: 838,
      movement: "up",
      movementBy: 1,
      initials: "SM",
    },
    {
      id: "orbitals",
      rank: 10,
      name: "Orbitals",
      challenge: "Space Exploration",
      challengeId: "future-of-exploration",
      score: 821,
      movement: "none",
      initials: "OR",
    },
  ],
};

/* --------------------------------------------------------------------------
   Sidebar — current challenge
   -------------------------------------------------------------------------- */

export const currentChallenge = {
  id: "climate-resilience",
  label: "CURRENT CHALLENGE",
  title: "Climate Resilience",
  description:
    "Build solutions to help communities adapt to climate change and natural disasters.",
  /* Reuses the same climate image the homepage challenge card already loads. */
  image: {
    src: earthClimateImage,
    alt: "Earth seen from space showing cloud systems",
  },
  action: {
    label: "View Challenge",
    href: "/challenges",
  },
};

/* --------------------------------------------------------------------------
   Sidebar — quick stats
   --------------------------------------------------------------------------
   `value` is a display string ("1,248") rather than a number, so the rendered
   text is identical whatever produces it and no component has to decide how to
   format it. `format: "count"` marks the fields that should count up when they
   scroll into view.
   -------------------------------------------------------------------------- */

export const quickStats = {
  id: "quick-stats",
  title: "Quick Stats",
  items: [
    { id: "teams", value: "120", label: "Total Teams", icon: "team", format: "count" },
    { id: "participants", value: "1,248", label: "Total Participants", icon: "users", format: "count" },
    { id: "challenges", value: "4", label: "Active Challenges", icon: "rocket", format: "count" },
  ],
};

/* --------------------------------------------------------------------------
   Sidebar — standings by challenge
   --------------------------------------------------------------------------
   `tone` selects an indicator from the three blues that already exist in
   variables.css. No new colour is introduced, and the same challenge always
   gets the same tone because the value is fixed data rather than something
   derived from array position.
   -------------------------------------------------------------------------- */

export const challengeStats = {
  id: "standings-by-challenge",
  title: "Standings by Challenge",
  items: [
    { id: "climate-resilience", name: "Climate Resilience", teams: 32, tone: "blue-strong" },
    { id: "future-of-exploration", name: "Space Exploration", teams: 28, tone: "blue" },
    { id: "open-innovation", name: "Technology", teams: 24, tone: "blue-deep" },
    { id: "sustainable-future", name: "Sustainability", teams: 21, tone: "blue-strong" },
  ],
};

/* --------------------------------------------------------------------------
   Page composition
   --------------------------------------------------------------------------
   Grouped so the page component reads as one import and so a future response
   can be delivered as a single object.
   -------------------------------------------------------------------------- */

export const liveStandings = {
  hero: liveStandingsHero,
  overall: overallStandings,
  sidebar: {
    currentChallenge,
    quickStats,
    challengeStats,
  },
};