/* ==========================================================================
   Live Standings page content
   --------------------------------------------------------------------------
   Copy and UI strings for /live-standings. Standings values themselves come
   from GET /api/v1/judging/standings and the judging SignalR hub; no team,
   rank, score or judge count is stored here.

   The standings response does not identify which challenge a team belongs to,
   so the challenge cards below deliberately show an unavailable state instead
   of inventing that relationship.
   ========================================================================== */

import heroEarthImage from "../assets/images/hero-earth.jpeg";

/* --------------------------------------------------------------------------
   Hero
   -------------------------------------------------------------------------- */

export const liveStandingsHero = {
  id: "live-standings-hero",
  badge: {
    states: {
      connected: { label: "LIVE", detail: "REAL-TIME UPDATES" },
      connecting: { label: "CONNECTING", detail: "REAL-TIME UPDATES" },
      reconnecting: { label: "RECONNECTING", detail: "UPDATES PAUSED" },
      disconnected: { label: "OFFLINE", detail: "UPDATES PAUSED" },
    },
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
  columns: ["#", "Team", "Score", "Percentage", "Judges"],
  status: {
    connected: "Live",
    connecting: "Connecting",
    reconnecting: "Reconnecting",
    disconnected: "Offline",
    lastUpdated: "Last updated",
    waiting: "Waiting for first update",
  },
  loading: "Loading standings…",
  empty: {
    title: "No standings yet",
    description: "Standings will appear here once judges submit their scores.",
  },
  error: {
    title: "Standings unavailable",
    description: "The live standings could not be loaded.",
    stale: "Could not refresh the standings. Showing the last successful update.",
    retry: "Try again",
  },
  refresh: {
    idle: "Refresh",
    busy: "Refreshing…",
  },
};

/* --------------------------------------------------------------------------
   Sidebar — current challenge
   --------------------------------------------------------------------------
   The standings payload has no challengeId, so this card must not imply a
   challenge was derived from the leaderboard.
   -------------------------------------------------------------------------- */

export const currentChallenge = {
  id: "current-challenge",
  label: "CURRENT CHALLENGE",
  title: "Challenge details unavailable",
  description:
    "The live standings feed does not include challenge information. Browse the challenges page for the full programme.",
  action: {
    label: "View Challenges",
    href: "/challenges",
  },
};

/* --------------------------------------------------------------------------
   Sidebar — quick stats
   --------------------------------------------------------------------------
   Labels and icons only. Counts are derived from the standings response by
   the sidebar; `value` is a neutral placeholder used before the first read.
   -------------------------------------------------------------------------- */

export const quickStats = {
  id: "quick-stats",
  title: "Quick Stats",
  items: [
    { id: "teams", value: "—", label: "Total Teams", icon: "team", format: "count" },
    { id: "ranked", value: "—", label: "Ranked Teams", icon: "chart", format: "count" },
    { id: "unranked", value: "—", label: "Unranked Teams", icon: "users", format: "count" },
  ],
};

/* --------------------------------------------------------------------------
   Sidebar — standings by challenge
   -------------------------------------------------------------------------- */

export const challengeStats = {
  id: "standings-by-challenge",
  title: "Standings by Challenge",
  unavailable:
    "Challenge breakdown is not available from the live standings feed.",
};

/* --------------------------------------------------------------------------
   Page composition
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
