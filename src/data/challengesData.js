/* ==========================================================================
   Challenges UI copy — /challenges and /challenges/:challengeId
   --------------------------------------------------------------------------
   The API is the only source of challenge records; this module holds the
   page chrome (titles, labels, state messages) exactly as homepageData.js
   holds the marketing copy. Nothing here fabricates a challenge.

   Endpoint:
     GET /api/v1/challenges
     GET /api/v1/challenges/{challengeId}
   ========================================================================== */

import heroEarthImage from "../assets/images/hero-earth.jpeg";

/* Where the closing "Join" CTA points. This is a real, official Space Apps
   property, not placeholder content. */
const REGISTER_URL = "https://www.spaceappschallenge.org/";

/* --------------------------------------------------------------------------
   Hero
   -------------------------------------------------------------------------- */

export const challengesHero = {
  eyebrow: "NASA SPACE APPS HURGHADA",
  title: "Challenges",
  description:
    "Explore the real-world challenges created by NASA and its partners. Find the one that inspires you, gather your team, and build solutions for a better tomorrow.",
  /* Decorative background art: the message is carried by the copy beside it,
     so it renders with an empty alt inside an aria-hidden wrapper. */
  image: {
    src: heroEarthImage,
    alt: "",
  },
};

/* --------------------------------------------------------------------------
   Challenge details page copy (/challenges/:challengeId)
   -------------------------------------------------------------------------- */

export const challengeDetailsPage = {
  hero: {
    eyebrow: "NASA SPACE APPS HURGHADA",
    breadcrumbLabel: "Breadcrumb",
    parent: { label: "Challenges", href: "/challenges" },
    labels: {
      home: "Home",
    },
    back: { label: "Back to all challenges", href: "/challenges" },
  },
  sectionTitles: {
    description: "Challenge Description",
  },
  /* Sidebar card: only values the API actually returns. */
  info: {
    title: "Challenge Info",
    labels: {
      source: "Source",
      season: "Season",
    },
  },
  states: {
    loading: "Loading challenge...",
    errorTitle: "Couldn't load this challenge",
    retry: "Retry",
  },
  /* Screen-reader note appended to every link that opens a new tab. */
  newTabHint: "(opens in a new tab)",
  /* Closing band: one real, official Space Apps destination. */
  cta: {
    title: "READY TO TAKE ON THE CHALLENGE?",
    lines: ["Gather your team.", "Build something that matters."],
    action: { label: "Join NASA Space Apps Hurghada", href: REGISTER_URL },
  },
  notFound: {
    title: "Challenge not found",
    description:
      "The challenge you're looking for doesn't exist or may no longer be available.",
    action: { label: "Back to Challenges", href: "/challenges" },
  },
};

/* --------------------------------------------------------------------------
   Listing page copy (/challenges)
   -------------------------------------------------------------------------- */

export const challengesPage = {
  hero: challengesHero,
  filtersLabel: "Challenge filters",
  search: {
    label: "Search challenges",
    placeholder: "Search challenges...",
  },
  sourceFilter: {
    label: "Source",
    ariaLabel: "Filter challenges by source",
    all: "All Sources",
  },
  results: {
    heading: "Challenge results",
    label: "Results",
    of: "of",
    noun: "challenges",
  },
  emptyState: {
    title: "No challenges yet",
    description: "Challenges will appear here once they are published.",
  },
  noResults: {
    title: "No matching challenges",
    description: "Try a different search term or choose another source.",
    resetLabel: "Clear filters",
  },
  states: {
    loading: "Loading challenges...",
    errorTitle: "Couldn't load challenges",
    retry: "Retry",
  },
};
