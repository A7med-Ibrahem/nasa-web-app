/* ==========================================================================
   Public pages copy — /teams, /teams/:teamId, /sponsors, /season-media,
   /leaderboard/game
   --------------------------------------------------------------------------
   UI chrome only. Every team, sponsor, media item and leaderboard row comes
   from the public API; nothing here is a record or a stand-in for one.
   ========================================================================== */

/* --------------------------------------------------------------------------
   Teams list (/teams)
   -------------------------------------------------------------------------- */

export const teamsPage = {
  hero: {
    eyebrow: "NASA SPACE APPS HURGHADA",
    title: "Teams",
    description:
      "Meet the teams taking on this year's challenges. Search by name to find a team and open its project.",
  },
  search: {
    label: "Search teams",
    placeholder: "Search teams...",
  },
  results: {
    label: "Teams",
    of: "of",
    noun: "teams",
  },
  loadMore: "Load more teams",
  states: {
    loading: "Loading teams...",
    errorTitle: "Couldn't load teams",
    retry: "Retry",
  },
  empty: {
    title: "No teams yet",
    description:
      "Registered teams will appear here once the organizers publish them.",
  },
  noResults: {
    title: "No matching teams",
    description: "Try a different team name.",
  },
};

/* --------------------------------------------------------------------------
   Team details (/teams/:teamId)
   -------------------------------------------------------------------------- */

export const teamDetailsPage = {
  eyebrow: "TEAM PROFILE",
  sections: {
    challenge: "Challenge",
    project: "Project",
    members: "Team Members",
  },
  labels: {
    source: "Source",
    season: "Season",
    repository: "Repository",
    demo: "Live Demo",
    memberStatus: "Status",
  },
  newTabHint: "(opens in a new tab)",
  states: {
    loading: "Loading team...",
    errorTitle: "Couldn't load this team",
    retry: "Retry",
  },
  notFound: {
    title: "Team not found",
    description:
      "The team you're looking for doesn't exist or may no longer be available.",
    action: { label: "Back to Teams", href: "/teams" },
  },
};

/* --------------------------------------------------------------------------
   Sponsors (/sponsors)
   -------------------------------------------------------------------------- */

export const sponsorsPage = {
  hero: {
    eyebrow: "OUR PARTNERS",
    title: "Sponsors",
    description:
      "The organizations and supporters who help make NASA Space Apps Hurghada possible.",
  },
  section: {
    eyebrow: "WITH THANKS",
    title: "Our sponsors and partners",
    description:
      "We're grateful to the partners supporting this edition of the hackathon.",
  },
  newTabHint: "(opens in a new tab)",
  states: {
    loading: "Loading sponsors...",
    errorTitle: "Couldn't load sponsors",
    retry: "Retry",
  },
  empty: {
    title: "No sponsors yet",
    description: "Sponsors will appear here once they are published.",
  },
};

/* --------------------------------------------------------------------------
   Season media (/season-media)
   -------------------------------------------------------------------------- */

export const seasonMediaPage = {
  hero: {
    eyebrow: "PREVIOUS EDITIONS",
    title: "Season Media",
    description:
      "Photos, videos and highlights from previous NASA Space Apps Hurghada editions, grouped by season.",
  },
  section: {
    title: "Highlights by season",
    description:
      "Browse the archive one edition at a time. Newer seasons appear first.",
  },
  filters: {
    label: "Filter media by season",
    all: "All seasons",
  },
  otherSeason: "Other",
  linkLabel: "View media",
  newTabHint: "(opens in a new tab)",
  states: {
    loading: "Loading season media...",
    errorTitle: "Couldn't load season media",
    retry: "Retry",
  },
  empty: {
    title: "No season media yet",
    description: "Photos and highlights will appear here once they are published.",
  },
};

/* --------------------------------------------------------------------------
   Game leaderboard (/leaderboard/game)
   -------------------------------------------------------------------------- */

export const gameLeaderboardPage = {
  hero: {
    eyebrow: "NASA SPACE APPS HURGHADA",
    title: "Game Leaderboard",
    description:
      "Correct answers and points for every team that has submitted an answer.",
  },
  table: {
    caption: "Game leaderboard",
    columns: {
      rank: "Rank",
      team: "Team",
      correct: "Correct Answers",
      points: "Points",
    },
    tied: "Tied",
    ownTeam: "Your team",
  },
  refresh: "Refresh",
  refreshing: "Refreshing...",
  lastUpdated: "Last updated",
  pollingNote:
    "Refreshes every 20 seconds while this tab is visible. No realtime connection is used.",
  staleError: "Couldn't refresh the leaderboard. Showing the last successful update.",
  states: {
    loading: "Loading leaderboard...",
    errorTitle: "Couldn't load the leaderboard",
    retry: "Retry",
  },
  empty: {
    title: "No answers submitted yet",
    description: "Teams will appear here after they submit their first answer.",
  },
};
