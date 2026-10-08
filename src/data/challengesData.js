/* ==========================================================================
   Challenges page content
   --------------------------------------------------------------------------
   Single source of truth for /challenges, mirroring how site.js,
   homepageData.js and liveStandingsData.js feed the shared chrome, the
   homepage and the Live Standings page.

   ------------------------------------------------------------------------
   BACKEND BOUNDARY
   ------------------------------------------------------------------------
   There is no backend yet, so everything below is static fixture data. The
   records are shaped deliberately like a REST payload instead of like JSX
   helpers, which is what makes the swap a one-line change later:

       import { staticChallenges } from "../services/challengesService";

   Two rules keep that promise:

     1. Components are presentational. The page derives its filtered list from
        `staticChallenges`, and ChallengeCard renders whatever record it is
        given through props — no card JSX is written per challenge.
     2. Stable identifiers (`id`, `slug`, `category`, `difficulty`) are plain
        enum-like values, so they can later come straight from an API and can
        eventually drive URL state such as /challenges/:slug or
        /challenges?category=technology without renaming anything.

    `categoryIcon` is the icon-registry key for the badge, so an API response
    only has to echo the category id and the icon mapping stays in the UI.

    Nothing here performs a request, and there is no mock server.
   ========================================================================== */

import heroEarthImage from "../assets/images/hero-earth.jpeg";
import earthClimateImage from "../assets/images/earth-climate.jpeg";
import spaceExplorationImage from "../assets/images/space-exploration.jpeg";
import technologyImage from "../assets/images/technology.jpeg";
import sustainabilityImage from "../assets/images/sustainability.jpeg";
import aboutSpaceImage from "../assets/images/about-space.jpeg";

/* --------------------------------------------------------------------------
   Hero
   -------------------------------------------------------------------------- */

export const challengesHero = {
  eyebrow: "NASA SPACE APPS CAIRO",
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
   Categories
   --------------------------------------------------------------------------
   `id` is the stable value stored on each challenge and the value the filter
   compares against; `label` and `icon` are presentation.
   -------------------------------------------------------------------------- */

export const challengeCategories = [
  { id: "all", label: "All Challenges", icon: "grid" },
  { id: "earth-climate", label: "Earth & Climate", icon: "leaf" },
  { id: "space-exploration", label: "Space Exploration", icon: "planet" },
  { id: "technology", label: "Technology", icon: "gear" },
  { id: "health-humanity", label: "Health & Humanity", icon: "heart" },
];

/* --------------------------------------------------------------------------
   Challenges
   --------------------------------------------------------------------------
   Fixed display strings a payload would ship with live here rather than in
   the card, so a future API can populate every field without the component
   changing. Images reuse the existing project assets: no challenge points at
   a file that is not already part of the build.
   -------------------------------------------------------------------------- */

export const staticChallenges = [
  {
    id: "climate-resilience",
    slug: "climate-resilience",
    title: "Climate Resilience",
    category: "earth-climate",
    categoryLabel: "Earth & Climate",
    categoryIcon: "leaf",
    description:
      "Develop innovative solutions to help communities adapt to and recover from the impacts of climate change, including extreme weather, rising sea levels, and more.",
    image: earthClimateImage,
    imageAlt: "Earth seen from space showing swirling cloud systems",
    organizer: "NASA",
    season: "2025 Season",
    difficulty: "medium",
  },
  {
    id: "mars-data-challenge",
    slug: "mars-data-challenge",
    title: "Mars Data Challenge",
    category: "space-exploration",
    categoryLabel: "Space Exploration",
    categoryIcon: "planet",
    description:
      "Use real Mars data to uncover insights, create visualizations, or build tools that support future exploration and colonization efforts.",
    image: spaceExplorationImage,
    imageAlt: "Spacecraft exploring a distant planet",
    organizer: "NASA",
    season: "2025 Season",
    difficulty: "hard",
  },
  {
    id: "ocean-health",
    slug: "ocean-health",
    title: "Ocean Health",
    category: "earth-climate",
    categoryLabel: "Earth & Climate",
    categoryIcon: "leaf",
    description:
      "Build solutions to monitor, protect, and restore ocean ecosystems, from coral reefs to marine biodiversity.",
    /* The blue-marble artwork is the closest existing asset to an ocean
       challenge; no new image is downloaded for it. */
    image: heroEarthImage,
    imageAlt: "The blue Earth seen from space with oceans and clouds",
    organizer: "NASA",
    season: "2025 Season",
    difficulty: "medium",
  },
  {
    id: "space-tech-for-a-better-earth",
    slug: "space-tech-for-a-better-earth",
    title: "Space Tech for a Better Earth",
    category: "technology",
    categoryLabel: "Technology",
    categoryIcon: "gear",
    description:
      "Leverage space technology and data to solve challenges on Earth, from agriculture to disaster response.",
    image: aboutSpaceImage,
    imageAlt: "Satellite orbiting above the Earth",
    organizer: "NASA",
    season: "2025 Season",
    difficulty: "medium",
  },
  {
    id: "global-health",
    slug: "global-health",
    title: "Global Health",
    category: "health-humanity",
    categoryLabel: "Health & Humanity",
    categoryIcon: "heart",
    description:
      "Create solutions to improve access to healthcare, track disease outbreaks, or support mental and physical well-being around the world.",
    /* No health-specific art exists in the project, so the closest existing
       asset is reused rather than downloading something new. */
    image: technologyImage,
    imageAlt: "A satellite in orbit above the Earth",
    organizer: "NASA",
    season: "2025 Season",
    difficulty: "easy",
  },
  {
    id: "a-brighter-future",
    slug: "a-brighter-future",
    title: "A Brighter Future",
    category: "technology",
    categoryLabel: "Technology",
    categoryIcon: "gear",
    description:
      "Imagine and build solutions that use space data, AI, and technology to create a more sustainable, inclusive, and resilient future.",
    image: sustainabilityImage,
    imageAlt: "Green Earth seen from space",
    organizer: "NASA",
    season: "2025 Season",
    difficulty: "medium",
  },
];

/* Difficulty is stored as an enum (`easy` | `medium` | `hard`) so an API can
   send a machine value; the display string lives here as data. */
export const difficultyLabels = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

/* --------------------------------------------------------------------------
   Page composition
   --------------------------------------------------------------------------
   Grouped so the page component reads as one import and so a future response
   can be delivered as a single object.
   -------------------------------------------------------------------------- */

export const challengesPage = {
  hero: challengesHero,
  categories: challengeCategories,
  challenges: staticChallenges,
  search: {
    label: "Search challenges",
    placeholder: "Search challenges...",
  },
  emptyState: {
    title: "No challenges found",
    description: "Try changing your search or category filter.",
  },
};
