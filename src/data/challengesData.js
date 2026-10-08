/* ==========================================================================
   Challenges content — single source of truth for /challenges and
   /challenges/:slug
   --------------------------------------------------------------------------
   Mirrors how site.js, homepageData.js and liveStandingsData.js feed the
   shared chrome, the homepage and the Live Standings page.

   The homepage "Top Challenges" rail (data/homepageData.js) and both
   challenge routes read this one module, so a challenge has exactly one
   definition everywhere it appears.

   ------------------------------------------------------------------------
   2026 CHALLENGES
   ------------------------------------------------------------------------
   The records below describe the official NASA Space Apps 2026 challenges.
   Titles, slugs, categories, short descriptions, main objectives and
   recommended content come from the 2026 Challenges document.

   The document does not establish a difficulty rating, deadlines, prizes,
   locations or statistics for these challenges, so no such values are
   invented here. Fields the document does not cover ship empty (`[]` / `null`)
   and the details page simply omits those blocks.

   ------------------------------------------------------------------------
   BACKEND BOUNDARY
   ------------------------------------------------------------------------
   There is no backend yet, so everything below is static data. The records
   are shaped deliberately like a REST payload instead of like JSX helpers,
   which is what makes the swap a one-line change later:

       import { staticChallenges } from "../services/challengesService";

   Two rules keep that promise:

     1. Components are presentational. The listing page derives its filtered
        list from `staticChallenges`, and ChallengeCard / ChallengeDetails
        render whatever record they are given through props — no card or page
        JSX is written per challenge.
     2. Detail lookup is done by slug — exactly how a future
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
   This is a live, official Space Apps property (verified when written): no
   placeholder or invented link appears anywhere in this file.
   -------------------------------------------------------------------------- */

/* Where "Join" CTAs point. The project ships no registration endpoint yet,
   and global Space Apps registration runs on the official site; pointing
   both CTAs at this one value means the local Hurghada form can replace it
   later without touching a single component. */
const REGISTER_URL = "https://www.spaceappschallenge.org/";

/* The 2026 edition this site is built for. Kept as constants so the season
   string has a single definition across every challenge record. */
const SEASON = "2026";
const ORGANIZER = "NASA Space Apps";

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

   The 2026 challenge document supports Earth & Climate, Space Exploration
   and Health & Humanity for the listed challenges; Technology stays available
   as a filter but no artificial technology-only challenge is created.
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
     id, slug, title, category, categoryLabel, categoryIcon,
     shortDescription, description, image, imageAlt, season, organizer,
     overview            — one framing paragraph for "Challenge Overview"
     mainObjective       — the challenge's stated objective
     targetAudience      — who the challenge is for (null when unspecified)
     keyInsights[]       — headline takeaways
     identifiedChallenges[] — the main problems to address
     recommendations[]   — suggested solution directions (not requirements)
     successMetrics[]    — how a strong solution could be judged
     domains[]           — relevant technical / topical tags (searchable)
   -------------------------------------------------------------------------- */

export const staticChallenges = [
  {
    id: "abandoned-but-not-forgotten",
    slug: "abandoned-but-not-forgotten",
    title:
      "Abandoned but not Forgotten: Storytelling about NASA's Discarded Equipment on the Moon and Mars",
    category: "space-exploration",
    categoryLabel: "Space Exploration",
    categoryIcon: "planet",
    shortDescription:
      "Tell the story of NASA hardware left on the Moon, Mars, and in deep space, exploring its original purpose, mission history, and scientific contributions.",
    description:
      "Tell the story of NASA hardware left on the Moon, Mars, and in deep space, exploring its original purpose, mission history, and scientific contributions.",
    image: spaceExplorationImage,
    imageAlt: "Spacecraft exploring a distant planet",
    season: SEASON,
    organizer: ORGANIZER,
    overview:
      "NASA has left equipment across the Moon, Mars and deep space — landers, rovers, instruments and other hardware that finished their missions but remain part of exploration history. This challenge asks teams to bring those discarded artifacts back into view, explaining what each object was designed to do, what it accomplished and what it still teaches us.",
    mainObjective:
      "Make the history and scientific impact of NASA's discarded exploration hardware accessible through engaging educational storytelling.",
    targetAudience: null,
    keyInsights: [],
    identifiedChallenges: [],
    recommendations: [
      "Interactive timelines",
      "Maps and imagery",
      "3D models",
      "Simplified hardware explanations",
      "Scientific discoveries enabled by each piece of equipment",
    ],
    successMetrics: [],
    domains: [
      "Space History",
      "Science Communication",
      "3D Visualization",
      "Interactive Timelines",
    ],
  },
  {
    id: "earth-system-trend-detective",
    slug: "earth-system-trend-detective",
    title: "Be An Earth System Trend Detective!",
    category: "earth-climate",
    categoryLabel: "Earth & Climate",
    categoryIcon: "leaf",
    shortDescription:
      "Explore NASA environmental data to discover how Earth system variables change over time and across different regions.",
    description:
      "Explore NASA environmental data to discover how Earth system variables change over time and across different regions.",
    image: earthClimateImage,
    imageAlt: "Earth seen from space showing swirling cloud systems",
    season: SEASON,
    organizer: ORGANIZER,
    overview:
      "Earth's land, oceans, atmosphere and ice are always changing, and NASA missions record those changes in enormous open datasets. This challenge asks teams to dig into that data, identify how environmental variables shift over time and across regions, and communicate what they find clearly.",
    mainObjective:
      "Analyze NASA mission measurements and model outputs, identify trends, measure their magnitude, and assess statistical significance.",
    targetAudience: null,
    keyInsights: [],
    identifiedChallenges: [],
    recommendations: [
      "Time-series analysis",
      "Statistical testing",
      "Geospatial analysis",
      "Interactive charts and maps",
    ],
    successMetrics: [],
    domains: [
      "Earth Observation",
      "Time-Series Analysis",
      "Statistical Testing",
      "Geospatial Analysis",
    ],
  },
  {
    id: "junior-astronaut-mission-trainer",
    slug: "junior-astronaut-mission-trainer",
    title: "Build a Junior Astronaut Mission Trainer",
    category: "space-exploration",
    categoryLabel: "Space Exploration",
    categoryIcon: "planet",
    shortDescription:
      "Create an interactive educational experience where students manage a lunar or Martian outpost and make mission-critical engineering decisions.",
    description:
      "Create an interactive educational experience where students manage a lunar or Martian outpost and make mission-critical engineering decisions.",
    image: spaceExplorationImage,
    imageAlt: "Spacecraft exploring a distant planet",
    season: SEASON,
    organizer: ORGANIZER,
    overview:
      "Long-duration missions to the Moon and Mars will depend on crews making sound engineering decisions under tight resource constraints. This challenge asks teams to build an interactive training experience in which students run a lunar or Martian outpost and learn how life support, power, food and other systems fit together.",
    mainObjective:
      "Teach STEM, resource management, systems engineering, and problem-solving through an engaging space mission simulation.",
    targetAudience: "Students",
    keyInsights: [],
    identifiedChallenges: [],
    recommendations: [
      "Resource constraints",
      "Life support",
      "Radiation shielding",
      "Power",
      "Food production",
      "Random events",
      "Missions",
      "Mission success and failure scenarios",
    ],
    successMetrics: [],
    domains: [
      "STEM Education",
      "Systems Engineering",
      "Resource Management",
      "Simulation",
    ],
  },
  {
    id: "clps-lunar-mission-browser",
    slug: "clps-lunar-mission-browser",
    title: "CLPS Lunar Mission Browser",
    category: "space-exploration",
    categoryLabel: "Space Exploration",
    categoryIcon: "planet",
    shortDescription:
      "Explore lunar landing locations and dates by visualizing the positions of the Sun and Earth relative to the lunar horizon.",
    description:
      "Explore lunar landing locations and dates by visualizing the positions of the Sun and Earth relative to the lunar horizon.",
    image: aboutSpaceImage,
    imageAlt: "Satellite orbiting above the Earth",
    season: SEASON,
    organizer: ORGANIZER,
    overview:
      "The Commercial Lunar Payload Services (CLPS) program is delivering landers to many different locations on the Moon, and local conditions such as sunlight and Earth visibility vary widely from site to site. This challenge asks teams to visualise lunar landing sites together with the astronomical conditions that affect them.",
    mainObjective:
      "Make lunar landing-site comparisons and astronomical conditions easier to understand for mission planners, educators, and the public.",
    targetAudience: null,
    keyInsights: [],
    identifiedChallenges: [],
    recommendations: [
      "An interactive lunar map",
      "Landing-site selection",
      "Date selection",
      "Illumination conditions",
      "Solar power potential",
      "Communication windows",
    ],
    successMetrics: [],
    domains: [
      "Lunar Exploration",
      "Geospatial Visualization",
      "Mission Planning",
      "Solar Illumination",
    ],
  },
  {
    id: "astronaut-health-monitoring-software",
    slug: "astronaut-health-monitoring-software",
    title: "Create Health Monitoring Software for Astronauts on Space Missions",
    category: "health-humanity",
    categoryLabel: "Health & Humanity",
    categoryIcon: "heart",
    shortDescription:
      "Design software that helps astronauts monitor health indicators and understand health trends during long-duration space missions.",
    description:
      "Design software that helps astronauts monitor health indicators and understand health trends during long-duration space missions.",
    image: technologyImage,
    imageAlt: "A satellite in orbit above the Earth",
    season: SEASON,
    organizer: ORGANIZER,
    overview:
      "Astronauts on long-duration space missions must keep track of their health with limited access to ground-based medical support. This challenge asks teams to design software that helps crews monitor health indicators, spot concerning trends and manage their own wellbeing during a mission.",
    mainObjective:
      "Support health monitoring, early identification of potential problems, and health self-management during missions.",
    targetAudience: null,
    keyInsights: [],
    identifiedChallenges: [],
    recommendations: [
      "An astronaut health dashboard",
      "Health indicator tracking",
      "Historical trends",
      "Abnormal-pattern alerts",
      "Clear health information",
    ],
    successMetrics: [],
    domains: [
      "Space Health",
      "Health Data Visualization",
      "Trend Analysis",
      "Astronaut Wellbeing",
    ],
  },
  {
    id: "dancing-with-the-sars",
    slug: "dancing-with-the-sars",
    title: "Dancing with the SARs",
    category: "earth-climate",
    categoryLabel: "Earth & Climate",
    categoryIcon: "leaf",
    shortDescription:
      "Use NASA-ISRO Synthetic Aperture Radar (NISAR) mission data to explore and visualize changes on Earth's surface.",
    description:
      "Use NASA-ISRO Synthetic Aperture Radar (NISAR) mission data to explore and visualize changes on Earth's surface.",
    image: heroEarthImage,
    imageAlt: "The blue Earth seen from space with oceans and clouds",
    season: SEASON,
    organizer: ORGANIZER,
    overview:
      "The NASA-ISRO Synthetic Aperture Radar (NISAR) mission observes Earth's surface with radar that can see through clouds and darkness. This challenge asks teams to turn that data into tools that make surface changes — from earthquakes to glacier movement — easier to see and understand.",
    mainObjective:
      "Make satellite radar observations more understandable and useful for identifying environmental and surface changes.",
    targetAudience: null,
    keyInsights: [],
    identifiedChallenges: [],
    recommendations: [
      "Interactive maps",
      "Location and time selection",
      "Radar observation comparisons",
      "Exploration of events such as earthquakes, wildfires, wetland loss, agricultural changes, and glacier movement",
    ],
    successMetrics: [],
    domains: [
      "Synthetic Aperture Radar",
      "Earth Observation",
      "Change Detection",
      "Data Visualization",
    ],
  },
  {
    id: "field-shift-adapting-farms",
    slug: "field-shift-adapting-farms",
    title: "Field Shift: Adapting Farms with NASA Data",
    category: "earth-climate",
    categoryLabel: "Earth & Climate",
    categoryIcon: "leaf",
    shortDescription:
      "Combine NASA Earth observations, soil information, crop characteristics, and farmer priorities to explore more resilient crop-rotation strategies.",
    description:
      "Combine NASA Earth observations, soil information, crop characteristics, and farmer priorities to explore more resilient crop-rotation strategies.",
    image: sustainabilityImage,
    imageAlt: "Green Earth seen from space",
    season: SEASON,
    organizer: ORGANIZER,
    overview:
      "Farmers must decide what to plant and how to rotate crops in the face of changing soil, water and climate conditions. This challenge asks teams to combine NASA Earth observations with soil data, crop information and farmer priorities to explore more resilient crop-rotation strategies.",
    mainObjective:
      "Support agricultural decisions that improve soil health, optimize water use, and help farms adapt to environmental change.",
    targetAudience: null,
    keyInsights: [],
    identifiedChallenges: [],
    recommendations: [
      "Farm location",
      "Soil characteristics",
      "Crop selection",
      "Farmer priorities",
      "Comparisons of crop-rotation strategies",
    ],
    successMetrics: [],
    domains: ["Agriculture", "Earth Observation", "Soil Health", "Water Management"],
  },
  {
    id: "flame-in-freefall",
    slug: "flame-in-freefall",
    title:
      "Flame in Freefall: AI-Powered Fire Safety Insights from Microgravity Combustion Data",
    category: "space-exploration",
    categoryLabel: "Space Exploration",
    categoryIcon: "planet",
    shortDescription:
      "Explore NASA microgravity combustion experiments through an AI-powered research dashboard designed to surface useful fire-safety insights.",
    description:
      "Explore NASA microgravity combustion experiments through an AI-powered research dashboard designed to surface useful fire-safety insights.",
    image: spaceExplorationImage,
    imageAlt: "Spacecraft exploring a distant planet",
    season: SEASON,
    organizer: ORGANIZER,
    overview:
      "Studying how fire behaves in microgravity helps researchers design safer spacecraft and habitats. This challenge asks teams to build an AI-powered research dashboard that makes NASA's microgravity combustion experiments easier to search, compare and interpret for fire-safety research.",
    mainObjective:
      "Make combustion research easier to search, compare, and interpret to support fire-safety research and future human space missions.",
    targetAudience: null,
    keyInsights: [],
    identifiedChallenges: [],
    recommendations: [
      "Experiment search",
      "Research summaries",
      "Comparisons of combustion conditions",
      "Relevant study rankings",
      "Pattern exploration",
      "Explanations of potential fire-safety implications",
    ],
    successMetrics: [],
    domains: [
      "Microgravity Combustion",
      "Fire Safety",
      "Research Tools",
      "Data Search",
    ],
  },
  {
    id: "modis-viirs-hotspots-harmonization",
    slug: "modis-viirs-hotspots-harmonization",
    title: "Harmonization of MODIS and VIIRS Hot Spots",
    category: "earth-climate",
    categoryLabel: "Earth & Climate",
    categoryIcon: "leaf",
    shortDescription:
      "Combine MODIS and VIIRS active-fire hotspot records into a consistent calendar for exploring when and where burning has occurred.",
    description:
      "Combine MODIS and VIIRS active-fire hotspot records into a consistent calendar for exploring when and where burning has occurred.",
    image: earthClimateImage,
    imageAlt: "Earth seen from space showing swirling cloud systems",
    season: SEASON,
    organizer: ORGANIZER,
    overview:
      "MODIS and VIIRS are two NASA instruments that detect active fires, but their records are not directly consistent with each other. This challenge asks teams to harmonise those hotspot datasets into a single comparable record that makes historical fire activity easier to explore.",
    mainObjective:
      "Improve the consistency of historical fire monitoring and support analysis, early warning, and emergency-response planning.",
    targetAudience: null,
    keyInsights: [],
    identifiedChallenges: [],
    recommendations: [
      "Standardized hotspot data",
      "Interactive maps",
      "Historical calendars",
      "Geographic filtering",
      "Date selection",
      "Fire-activity exploration",
    ],
    successMetrics: [],
    domains: [
      "Active Fire Data",
      "Earth Observation",
      "Data Harmonization",
      "Historical Analysis",
    ],
  },
  {
    id: "earth-analogs-for-moon-and-mars",
    slug: "earth-analogs-for-moon-and-mars",
    title:
      "Identify Earth Locations that Analog the Permanent Moon Base Locations and Mars",
    category: "space-exploration",
    categoryLabel: "Space Exploration",
    categoryIcon: "planet",
    shortDescription:
      "Find locations on Earth whose geological, environmental, or physical characteristics resemble potential lunar or Martian landing sites and base locations.",
    description:
      "Find locations on Earth whose geological, environmental, or physical characteristics resemble potential lunar or Martian landing sites and base locations.",
    image: aboutSpaceImage,
    imageAlt: "Satellite orbiting above the Earth",
    season: SEASON,
    organizer: ORGANIZER,
    overview:
      "Testing equipment and procedures for the Moon and Mars is difficult, so researchers rely on places on Earth that resemble those destinations. This challenge asks teams to find and compare terrestrial analog sites whose geology, environment and physical conditions make them useful stand-ins for lunar or Martian locations.",
    mainObjective:
      "Help researchers and mission teams identify terrestrial analog environments for testing equipment, technologies, and operational procedures.",
    targetAudience: null,
    keyInsights: [],
    identifiedChallenges: [],
    recommendations: [
      "Earth-location comparisons",
      "Terrain and geology analysis",
      "Temperature",
      "Elevation",
      "Surface composition",
      "Environmental conditions",
      "Transparent similarity rankings",
    ],
    successMetrics: [],
    domains: [
      "Terrestrial Analogs",
      "Geology",
      "Site Comparison",
      "Similarity Ranking",
    ],
  },
  {
    id: "interplanetary-survival-guide-martian-map",
    slug: "interplanetary-survival-guide-martian-map",
    title: "Interplanetary Survival Guide: Martian Map",
    category: "space-exploration",
    categoryLabel: "Space Exploration",
    categoryIcon: "planet",
    shortDescription:
      "Combine NASA Mars datasets into an integrated map that helps future astronauts understand terrain, routes, destinations, and environmental conditions.",
    description:
      "Combine NASA Mars datasets into an integrated map that helps future astronauts understand terrain, routes, destinations, and environmental conditions.",
    image: spaceExplorationImage,
    imageAlt: "Spacecraft exploring a distant planet",
    season: SEASON,
    organizer: ORGANIZER,
    overview:
      "Planning a Marswalk means bringing together terrain, hazards, scientific targets and rover observations into one coherent picture. This challenge asks teams to combine NASA Mars datasets into an integrated map that helps future astronauts understand where they can go and what they will face.",
    mainObjective:
      "Support Marswalk planning by making relevant Martian information easier to access and explore.",
    targetAudience: null,
    keyInsights: [],
    identifiedChallenges: [],
    recommendations: [
      "Layered maps",
      "Terrain and elevation",
      "Geological features",
      "Hazards",
      "Scientific targets",
      "Rover data",
      "Route-planning concepts",
    ],
    successMetrics: [],
    domains: [
      "Mars Mapping",
      "Geospatial Data",
      "Route Planning",
      "Environmental Hazards",
    ],
  },
  {
    id: "planet-x-and-spherex",
    slug: "planet-x-and-spherex",
    title: "Planet X and SPHEREx",
    category: "space-exploration",
    categoryLabel: "Space Exploration",
    categoryIcon: "planet",
    shortDescription:
      "Build a public-facing sky viewer that uses NASA SPHEREx imagery to compare observations over time and help identify objects that appear to move.",
    description:
      "Build a public-facing sky viewer that uses NASA SPHEREx imagery to compare observations over time and help identify objects that appear to move.",
    image: aboutSpaceImage,
    imageAlt: "Satellite orbiting above the Earth",
    season: SEASON,
    organizer: ORGANIZER,
    overview:
      "The SPHEREx mission is surveying the sky in infrared, producing imagery that the public can explore. This challenge asks teams to build a public-facing sky viewer that compares observations over time and helps users spot objects that appear to move.",
    mainObjective:
      "Make astronomical observations accessible and support the exploration of moving celestial objects.",
    targetAudience: null,
    keyInsights: [],
    identifiedChallenges: [],
    recommendations: [
      "Sky imagery",
      "Before-and-after comparisons",
      "Time controls",
      "Zooming",
      "Filtering",
      "Object tracking",
      "Highlighting potential movement",
    ],
    successMetrics: [],
    domains: [
      "Astronomy",
      "Sky Imagery",
      "Time-Series Comparison",
      "Object Tracking",
    ],
  },
  {
    id: "space-mission-design-game",
    slug: "space-mission-design-game",
    title: "Space Mission Design Game",
    category: "space-exploration",
    categoryLabel: "Space Exploration",
    categoryIcon: "planet",
    shortDescription:
      "Create an interactive game where students design and simulate a space mission while exploring engineering decisions and mission trade-offs.",
    description:
      "Create an interactive game where students design and simulate a space mission while exploring engineering decisions and mission trade-offs.",
    image: technologyImage,
    imageAlt: "A satellite in orbit above the Earth",
    season: SEASON,
    organizer: ORGANIZER,
    overview:
      "Designing a space mission means balancing objectives, budgets, hardware and physics, and every choice has trade-offs. This challenge asks teams to build an interactive game in which students design and simulate a mission and see how their engineering decisions play out.",
    mainObjective:
      "Make space engineering, systems engineering, and resource management more accessible through educational gameplay.",
    targetAudience: "Students",
    keyInsights: [],
    identifiedChallenges: [],
    recommendations: [
      "Mission objectives",
      "Budgets",
      "Spacecraft components",
      "Launch vehicles",
      "Scientific instruments",
      "Power",
      "Mass",
      "Communications",
      "Orbital choices",
      "Mission-performance feedback",
    ],
    successMetrics: [],
    domains: [
      "Space Engineering",
      "Systems Engineering",
      "Game Design",
      "Resource Management",
    ],
  },
  {
    id: "earth-information-jukebox",
    slug: "earth-information-jukebox",
    title: "The Earth Information Jukebox",
    category: "earth-climate",
    categoryLabel: "Earth & Climate",
    categoryIcon: "leaf",
    shortDescription:
      "Transform NASA Earth Information Center visualizations into dynamic sounds so people can experience changes on Earth through sight and sound.",
    description:
      "Transform NASA Earth Information Center visualizations into dynamic sounds so people can experience changes on Earth through sight and sound.",
    image: heroEarthImage,
    imageAlt: "The blue Earth seen from space with oceans and clouds",
    season: SEASON,
    organizer: ORGANIZER,
    overview:
      "The NASA Earth Information Center turns Earth data into striking visualizations, but those stories are mostly visual. This challenge asks teams to transform that data into sound so people can experience changes on Earth through both sight and hearing.",
    mainObjective:
      "Make Earth science more engaging and accessible through data sonification and multisensory experiences.",
    targetAudience: null,
    keyInsights: [],
    identifiedChallenges: [],
    recommendations: [
      "Visualization selection",
      "Sound generation",
      "Adjustable audio parameters",
      "Scientific explanations of sound mappings",
      "Accessible interaction controls",
    ],
    successMetrics: [],
    domains: [
      "Data Sonification",
      "Earth Science",
      "Accessibility",
      "Multisensory Visualization",
    ],
  },
];

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
  /* Heading for the challenge's overview paragraph. */
  overviewTitle: "Challenge Overview",
  /* Headings for the structured detail fields. A field with no data is simply
     not rendered, so these strings never label an empty block. */
  sectionTitles: {
    objective: "Main Objective",
    audience: "Target Audience",
    keyInsights: "Key Insights",
    identifiedChallenges: "Main Challenges to Address",
    recommendations: "Suggested Solution Directions",
    successMetrics: "Success Metrics",
    domains: "Relevant Domains",
  },
  /* Recommendations are challenge context, not mandatory submission criteria. */
  recommendationsNote:
    "These are suggested directions from the challenge brief — treat them as context, not mandatory requirements.",
  /* Sidebar card: labelled values, all sourced from the record. */
  info: {
    title: "Challenge Info",
    labels: {
      category: "Category",
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
