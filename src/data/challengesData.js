/* ==========================================================================
   Challenges content — single source of truth for /challenges and
   /challenges/:slug
   --------------------------------------------------------------------------
   Mirrors how site.js, homepageData.js and liveStandingsData.js feed the
   shared chrome, the homepage and the Live Standings page.

   ------------------------------------------------------------------------
   DEMO CONTENT NOTICE
   ------------------------------------------------------------------------
   The challenge descriptions, `longDescription` paragraphs, `sections` copy
   and metadata below are local frontend fixtures written to exercise this
   UI. They are NOT official NASA challenge statements — official Space Apps
   challenge text is published on the global Space Apps site, which is what
   the `resources` and registration links point at. Swap this module for an
   API response of identical shape and nothing in the presentation layer
   changes.

   ------------------------------------------------------------------------
   BACKEND BOUNDARY
   ------------------------------------------------------------------------
   There is no backend yet, so everything below is static fixture data. The
   records are shaped deliberately like a REST payload instead of like JSX
   helpers, which is what makes the swap a one-line change later:

       import { staticChallenges } from "../services/challengesService";

   Three rules keep that promise:

     1. Components are presentational. The listing page derives its filtered
        list from `staticChallenges`, and ChallengeCard / ChallengeDetails
        render whatever record they are given through props — no card or page
        JSX is written per challenge.
     2. Stable identifiers (`id`, `slug`, `category`, `difficulty`) are plain
        enum-like values, so they can later come straight from an API and
        drive routes such as /challenges/:slug without renaming anything.
     3. Detail lookup is done by slug — exactly how a future
        `GET /api/challenges/:slug` would be called — see
        pages/ChallengeDetails/ChallengeDetails.jsx.

   `categoryIcon` is the icon-registry key for badges, so an API response
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
   Shared external destinations
   --------------------------------------------------------------------------
   Both URLs are live, official NASA / Space Apps properties (verified when
   written): no placeholder or invented links appear anywhere in this file.
   -------------------------------------------------------------------------- */

/* Where "Join" CTAs point. The project ships no registration endpoint yet,
   and global Space Apps registration runs on the official site; pointing
   both CTAs at this one value means the local Hurghada form can replace it
   later without touching a single component. */
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
   the card or the details page, so a future API can populate every field
   without a component changing. Images reuse the existing project assets: no
   challenge points at a file that is not already part of the build.

   Shape (details-only fields marked):
     id, slug, title, category, categoryLabel, categoryIcon, description,
     image, imageAlt, organizer, season, difficulty,
     longDescription[]  — paragraphs for "About this challenge"
     sections[]         — { id, title, content } rendered in data order;
                          `content` is a string or an array of paragraphs,
                          so section count and length vary per challenge
     resources[]        — { title, url }; empty hides the whole section
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
    longDescription: [
      "Climate Resilience is about helping communities read the signals that come from Earth — weather, water, land, and sea — and act on them before a hazard becomes a disaster.",
      "Teams work with open Earth observation data and turn raw measurements into something a local decision-maker, a farmer, or a family can actually use: a clearer picture of risk, and more time to respond.",
    ],
    sections: [
      {
        id: "challenge",
        title: "The Challenge",
        content:
          "Communities around the world face heat waves, floods, droughts, and rising seas. The data describing these risks is openly available, but it rarely reaches the people making everyday decisions in the places where the impact is felt first.",
      },
      {
        id: "what-to-do",
        title: "What You Need To Do",
        content:
          "Choose a climate or Earth-observation dataset, decide who you are building for, and ship a working prototype that turns that data into one clear, useful answer. Document where your numbers come from and be ready to demo your solution at the end of the weekend.",
      },
      {
        id: "impact",
        title: "Why It Matters",
        content:
          "Resilience is not about predicting the future perfectly — it is about giving people enough warning and enough understanding to act. A good solution buys a community time it would not otherwise have.",
      },
    ],
    resources: [
      { title: "NASA Open Data Portal", url: "https://data.nasa.gov/" },
      { title: "NASA Space Apps Challenge", url: REGISTER_URL },
    ],
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
    longDescription: [
      "Mars Data Challenge invites teams to work with real information returned by missions to the Red Planet — imagery, terrain, atmospheric readings, and mission timelines.",
      "The goal is not to plan a mission, but to make Mars easier to understand: visualise something hidden in the raw data, or build a tool that helps the next team ask better questions.",
    ],
    sections: [
      {
        id: "challenge",
        title: "The Challenge",
        content:
          "Decades of Mars exploration have produced an enormous public archive. It is rich, messy, and scattered — which means most of it is never seen by anyone outside the teams that generated it.",
      },
      {
        id: "what-to-do",
        title: "What You Need To Do",
        content: [
          "Pick one Martian dataset your team is curious about, clean it, and build something with it: an interactive visualisation, a comparison tool, a story told through the numbers, or a small model.",
          "Be ready to explain the science you relied on and where a viewer can verify it.",
        ],
      },
      {
        id: "impact",
        title: "Why It Matters",
        content:
          "Every future mission is planned on top of the data already collected. Making that data legible today shortens the distance between a question and an answer — on Mars and on Earth.",
      },
    ],
    resources: [{ title: "NASA Open Data Portal", url: "https://data.nasa.gov/" }],
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
    longDescription: [
      "Ocean Health focuses on the part of the planet that covers most of it: coral reefs, marine biodiversity, fisheries, and the changing chemistry of seawater.",
      "Teams translate ocean datasets into tools that make the state of the sea visible — and into actions that help the people who depend on it most.",
    ],
    sections: [
      {
        id: "challenge",
        title: "The Challenge",
        content:
          "Ocean systems are under pressure from warming, acidification, pollution, and overfishing. The signals exist in open datasets, but they are hard to see at the scale of a single reef, coastline, or fishing community.",
      },
      {
        id: "what-to-do",
        title: "What You Need To Do",
        content:
          "Select an ocean or Earth-observation dataset, choose a place or a problem to focus on, and build a prototype that monitors, explains, or flags change. A dashboard, an alert, a map, or a story are all valid outcomes.",
      },
      {
        id: "impact",
        title: "Why It Matters",
        content:
          "Billions of people rely on healthy oceans for food and livelihoods. What gets measured and understood gets protected — and the earlier a change is noticed, the cheaper it is to respond to.",
      },
    ],
    /* Deliberately empty: proves the Resources section is optional in the
       UI without shipping a fake link. */
    resources: [],
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
    longDescription: [
      "Space Tech for a Better Earth asks a simple question: which technologies built for space already make life on the ground better?",
      "From satellite imagery to sensor hardware, teams apply space-derived tools to everyday problems — agriculture, disaster response, transport, or energy.",
    ],
    sections: [
      {
        id: "challenge",
        title: "The Challenge",
        content:
          "Satellites, sensors, and communication systems designed for space routinely generate value on Earth, yet many communities and industries never use them. The gap is rarely the technology itself — it is the packaging.",
      },
      {
        id: "what-to-do",
        title: "What You Need To Do",
        content:
          "Take one space technology or dataset and apply it to a concrete Earth problem. Build a working demonstration of the idea, explain the pipeline from space to user, and be honest about what your prototype does not yet do.",
      },
      {
        id: "impact",
        title: "Why It Matters",
        content:
          "The return on space investment is measured on the ground: earlier disaster warnings, healthier crops, smarter logistics. Somebody has to build that bridge — this weekend, it is your team.",
      },
    ],
    resources: [
      { title: "NASA Open Data Portal", url: "https://data.nasa.gov/" },
      { title: "NASA Open APIs", url: "https://api.nasa.gov/" },
    ],
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
    longDescription: [
      "Global Health invites participants to use open data to improve how people access care, how outbreaks are tracked, and how wellbeing is supported.",
      "No medical background is required — clear thinking and honest data handling matter more than specialist knowledge.",
    ],
    /* Two sections instead of three: the details page renders whatever the
       record contains, with no fixed section list. */
    sections: [
      {
        id: "challenge",
        title: "The Challenge",
        content:
          "Health data is unevenly distributed and hard to combine. A signal that an outbreak is starting, or that a community is being missed by existing services, is often buried across several sources that were never designed to work together.",
      },
      {
        id: "what-to-do",
        title: "What You Need To Do",
        content:
          "Find two open sources that can be combined responsibly, define the question you want to answer, and build a small working tool around it. Handle sensitive data carefully and state your assumptions plainly.",
      },
    ],
    resources: [],
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
    longDescription: [
      "A Brighter Future is the open-ended challenge: imagine how space data, AI, and thoughtful design can make the next decade more sustainable, inclusive, and resilient.",
      "It rewards teams that start from a real human need and use technology as the means, not the point.",
    ],
    /* Four sections: section count, titles and length all vary per record,
       and the page never hardcodes any of them. */
    sections: [
      {
        id: "challenge",
        title: "The Challenge",
        content:
          "The tools that shape the future — open data, machine learning, low-cost sensing — are more accessible than ever, and more unevenly distributed. The question is which problems they get pointed at.",
      },
      {
        id: "what-to-do",
        title: "What You Need To Do",
        content:
          "Start from a need you have seen up close, then work backwards to the data and technology that could address it. Ship something functional, however small, and show who benefits from it.",
      },
      {
        id: "grounded",
        title: "Keep It Grounded",
        content:
          "A convincing pitch is not a working product. Choose scope you can finish, measure your impact honestly, and say clearly what you would build next with more time.",
      },
      {
        id: "impact",
        title: "Why It Matters",
        content:
          "Sustainable and inclusive progress is built from many small, workable ideas. The prototype you finish this weekend can be the first version of something a community keeps using.",
      },
    ],
    resources: [{ title: "NASA Space Apps Challenge", url: REGISTER_URL }],
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
   Challenge details page copy (/challenges/:slug)
   --------------------------------------------------------------------------
   Static chrome for the details route: everything the page says that is not
   part of an individual challenge record. Grouped so the page reads as one
   import and so a future response can deliver it as a single object.
   -------------------------------------------------------------------------- */

export const challengeDetailsPage = {
  hero: {
    eyebrow: "NASA SPACE APPS HURGHADA",
    breadcrumbLabel: "Breadcrumb",
    parent: { label: "Challenges", href: "/challenges" },
  },
  aboutTitle: "About this challenge",
  /* Sidebar card. Row order and icons are presentational (they live in
     ChallengeInfo); these are the strings and the record fields behind them. */
  info: {
    title: "Challenge Info",
    labels: {
      category: "Category",
      difficulty: "Difficulty",
      season: "Season",
      organizer: "Organizer",
    },
  },
  /* Both CTAs point at the same destination — see REGISTER_URL above. */
  join: {
    label: "Join the Event",
    href: REGISTER_URL,
  },
  resources: {
    title: "Resources",
  },
  /* Screen-reader note appended to every link that opens a new tab (the new
     tab itself is a behavioural change screen readers cannot perceive). */
  newTabHint: "(opens in a new tab)",
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
   Page composition
   --------------------------------------------------------------------------
   Grouped so the listing page component reads as one import.
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
