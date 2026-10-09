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
   Every content field is transcribed from the official 2026 Challenges
   document without rewriting, shortening or translating it. The document
   does not establish a difficulty rating, deadlines, prizes, locations or
   quantitative targets for these challenges, so no such values are invented
   here.

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

   The 2026 challenge document supports Earth & Climate, Space Exploration,
   Health & Humanity and Technology for the listed challenges. Each challenge
   is mapped to one primary category based on its content and to one or more
   domain tags (see `domains`) for the finer-grained description.
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

   Shape:
     id, slug, title,
     category, categoryLabel, categoryIcon   — primary category (presentation)
     domains[]            — technical / business domain tags (searchable)
     mainObjective        — the challenge's stated objective (full text)
     businessObjectives   — the challenge's stated business objectives
     targetAudience       — who the challenge is for (full text)
     keyInsights          — Key Insights from the Data (full text)
     mainChallenges       — Main Challenges Identified (full text)
     recommendations      — Recommendations (full text)
     actionMarketingPlan  — Action / Marketing Plan (full text)
     kpis[]               — success metrics, as a list
     shortDescription     — card excerpt derived from the objective (does
                            not replace the full mainObjective)
     image, imageAlt      — existing project asset
     season, organizer    — shared event identity
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
    domains: [
      "Space Exploration",
      "Astrophysics",
      "Data Visualization",
      "STEM Education",
      "Digital Storytelling",
    ],
    mainObjective:
      "To tell the story of NASA's hardware left on the Moon, Mars, and in deep space, explaining what the equipment was designed to do and what scientific discoveries it helped make possible.",
    businessObjectives:
      "To make NASA's space exploration history more accessible, increase interest in STEM and space science, and transform complex scientific information into engaging educational content.",
    targetAudience:
      "School-age students, young space enthusiasts, educators, STEM communities, and the general public.",
    keyInsights:
      "NASA has left many different types of hardware across the solar system. Each piece has a unique purpose, mission history, location, and scientific contribution.",
    mainChallenges:
      "Large amounts of technical information, difficulty explaining complex hardware to young audiences, and the challenge of connecting each piece of equipment to the scientific results it enabled.",
    recommendations:
      "Build an interactive storytelling platform using timelines, maps, images, 3D models, and simplified explanations of each piece of hardware and its scientific contribution.",
    actionMarketingPlan:
      "Launch an interactive educational website and promote it through schools, STEM communities, social media, science clubs, and educational platforms.",
    kpis: [
      "Number of users",
      "engagement time",
      "number of hardware stories explored",
      "content completion rate",
      "social shares",
      "returning users",
      "schools reached",
      "user feedback",
    ],
    shortDescription:
      "Tell the story of NASA hardware left on the Moon, Mars, and in deep space — what it was built to do and what it discovered.",
    image: spaceExplorationImage,
    imageAlt: "Spacecraft exploring a distant planet",
    season: SEASON,
    organizer: ORGANIZER,
  },
  {
    id: "earth-system-trend-detective",
    slug: "earth-system-trend-detective",
    title: "Be An Earth System Trend Detective!",
    category: "earth-climate",
    categoryLabel: "Earth & Climate",
    categoryIcon: "leaf",
    domains: [
      "Earth Science",
      "Data Science",
      "Software Development",
      "Environmental Analysis",
      "Statistics",
      "Data Visualization",
    ],
    mainObjective:
      "To analyze variables measured by NASA missions or produced by NASA models, identify how they change over time, determine where changes occur, measure their magnitude, and determine whether the changes are statistically significant.",
    businessObjectives:
      "To transform large environmental datasets into useful insights, improve understanding of environmental changes, and support data-driven environmental research and decision-making.",
    targetAudience:
      "Scientists, environmental researchers, data scientists, students, educators, policymakers, and people interested in Earth science.",
    keyInsights:
      "Environmental variables can show different trends in different regions. The same environmental process may cause an increase in one location and a decrease in another.",
    mainChallenges:
      "Handling large datasets, detecting real trends among natural variations and noise, comparing different regions, measuring the magnitude of change, and determining statistical significance.",
    recommendations:
      "Use time-series analysis, statistical testing, geospatial analysis, and interactive visualization to identify and clearly communicate environmental trends.",
    actionMarketingPlan:
      "Develop an interactive Earth System Trend Dashboard that allows users to select variables, regions, and time periods and explore trends through maps and charts.",
    kpis: [
      "Number of datasets analyzed",
      "number of trends detected",
      "number of statistically significant trends",
      "geographic coverage",
      "dashboard users",
      "engagement time",
      "analysis completion rate",
      "user feedback",
    ],
    shortDescription:
      "Detect and explain how Earth system variables change over time and across regions using NASA mission data.",
    image: earthClimateImage,
    imageAlt: "Earth seen from space showing swirling cloud systems",
    season: SEASON,
    organizer: ORGANIZER,
  },
  {
    id: "junior-astronaut-mission-trainer",
    slug: "junior-astronaut-mission-trainer",
    title: "Build a Junior Astronaut Mission Trainer",
    category: "space-exploration",
    categoryLabel: "Space Exploration",
    categoryIcon: "planet",
    domains: [
      "Space Exploration",
      "Educational Games",
      "Software Development",
      "STEM Education",
      "Systems Engineering",
    ],
    mainObjective:
      "To design and build an interactive game or application where students manage a lunar or Martian outpost and experience the engineering trade-offs involved in keeping a mission alive.",
    businessObjectives:
      "To make STEM and space education more interactive, practical, and engaging, while helping students develop problem-solving, resource-management, and decision-making skills.",
    targetAudience:
      "Students, young learners, beginner space enthusiasts, educators, and STEM communities.",
    keyInsights:
      "A successful lunar or Martian outpost requires balancing multiple systems. Decisions about life support, radiation shielding, power, and food production are interconnected and can directly affect mission success.",
    mainChallenges:
      "Simplifying real engineering trade-offs without losing their educational value, keeping young users engaged, designing realistic resource limitations, and making the simulation easy to understand.",
    recommendations:
      "Create a simulation with limited resources, missions, random events, resource management, engineering decisions, consequences, and mission success/failure scenarios.",
    actionMarketingPlan:
      "Develop a web or mobile educational game, test it with students and educators, and promote it through schools, STEM clubs, educational platforms, social media, and space communities.",
    kpis: [
      "Number of players",
      "mission completion rate",
      "average play time",
      "number of missions completed",
      "user retention",
      "student engagement",
      "learning improvement",
      "user feedback",
    ],
    shortDescription:
      "Manage a lunar or Martian outpost and experience the engineering trade-offs that keep a mission alive.",
    image: spaceExplorationImage,
    imageAlt: "Spacecraft exploring a distant planet",
    season: SEASON,
    organizer: ORGANIZER,
  },
  {
    id: "clps-lunar-mission-browser",
    slug: "clps-lunar-mission-browser",
    title: "CLPS Lunar Mission Browser",
    category: "space-exploration",
    categoryLabel: "Space Exploration",
    categoryIcon: "planet",
    domains: [
      "Space Exploration",
      "Lunar Science",
      "Mission Planning",
      "Software Development",
      "Astronomy",
      "Data Visualization",
    ],
    mainObjective:
      "To create an intuitive tool or application that allows mission planners, educators, and the public to quickly compare lunar landing sites and dates by visualizing the positions of the Sun and Earth relative to the lunar horizon.",
    businessObjectives:
      "To simplify lunar mission planning, reduce the time needed to evaluate potential landing sites, make complex astronomical information easier to understand, and support coordination between science and engineering teams.",
    targetAudience:
      "Mission planners, scientists, engineers, educators, researchers, students, and the general public interested in lunar exploration.",
    keyInsights:
      "The positions of the Sun and Earth vary depending on the lunar location, date, and time. These conditions affect solar power generation and Direct-to-Earth communication windows, especially near the lunar South Pole.",
    mainChallenges:
      "Existing tools may have complex interfaces, making it difficult to quickly compare landing sites and dates. Lunar South Pole missions also face challenging lighting and communication conditions.",
    recommendations:
      "Build an interactive lunar map where users can select a landing site and date and visualize the Sun position, Earth position, illumination conditions, power-generation potential, and communication windows.",
    actionMarketingPlan:
      "Develop a user-friendly web application, test it with mission-planning and educational users, and promote it through NASA Space Apps, universities, STEM communities, and social media.",
    kpis: [
      "Number of users",
      "number of landing sites compared",
      "number of dates analyzed",
      "average analysis time",
      "task completion rate",
      "user engagement",
      "user feedback",
    ],
    shortDescription:
      "Compare lunar landing sites and dates by visualizing the Sun and Earth relative to the lunar horizon.",
    image: aboutSpaceImage,
    imageAlt: "Satellite orbiting above the Earth",
    season: SEASON,
    organizer: ORGANIZER,
  },
  {
    id: "astronaut-health-monitoring-software",
    slug: "astronaut-health-monitoring-software",
    title:
      "Create Health Monitoring Software for Astronauts on Space Missions",
    category: "health-humanity",
    categoryLabel: "Health & Humanity",
    categoryIcon: "heart",
    domains: [
      "Human Exploration",
      "Space Medicine",
      "Software Development",
      "Health Monitoring",
      "Data Analysis",
      "Space Exploration",
    ],
    mainObjective:
      "To build health monitoring software that collects and analyzes astronauts' health indicators and helps them evaluate their health status and take appropriate actions during long-duration space missions.",
    businessObjectives:
      "To improve astronaut health monitoring and self-management, support early identification of potential health problems, reduce dependence on continuous ground support, and provide a practical digital health-management tool for future long-duration missions.",
    targetAudience:
      "Astronauts, space-mission medical teams, flight controllers, space agencies, researchers, and potentially mission planners.",
    keyInsights:
      "Long-duration space missions can expose astronauts to radiation, isolation and confinement, altered gravity, and closed environments. These conditions can be associated with changes in the immune system, bone health, cardiovascular health, and behavioral health.",
    mainChallenges:
      "Monitoring multiple health indicators continuously, identifying meaningful changes in health status, presenting medical information clearly to astronauts, operating with limited resources during long missions, and enabling astronauts to respond without always relying on Earth-based support.",
    recommendations:
      "Develop a centralized Astronaut Health Dashboard that collects health indicators, tracks changes over time, provides alerts for abnormal patterns, visualizes trends, and gives astronauts clear information about their current health status.",
    actionMarketingPlan:
      "Develop a functional prototype and test it using simulated astronaut health data. Demonstrate the system to space research communities, universities, healthcare researchers, and STEM organizations, and present it through NASA Space Apps and related educational/technical communities.",
    kpis: [
      "Number of health indicators monitored",
      "data-processing accuracy",
      "abnormal-condition detection rate",
      "alert response time",
      "dashboard usability",
      "user engagement",
      "system reliability",
      "user feedback",
    ],
    shortDescription:
      "Build software that tracks astronaut health indicators and supports health decisions on long-duration missions.",
    image: technologyImage,
    imageAlt: "A satellite in orbit above the Earth",
    season: SEASON,
    organizer: ORGANIZER,
  },
  {
    id: "dancing-with-the-sars",
    slug: "dancing-with-the-sars",
    title: "Dancing with the SARs",
    category: "earth-climate",
    categoryLabel: "Earth & Climate",
    categoryIcon: "leaf",
    domains: [
      "Earth Science",
      "Remote Sensing",
      "Satellite Data",
      "Geospatial Analysis",
      "Software Development",
      "Data Visualization",
    ],
    mainObjective:
      "To build an interactive application that uses radar remote sensing data from the NASA-ISRO Synthetic Aperture Radar (NISAR) mission to track and visualize changes on Earth's surface.",
    businessObjectives:
      "To make complex satellite radar data easier to understand and use, improve the visualization of environmental changes, and support researchers, educators, and the public in understanding how Earth's surface changes over time.",
    targetAudience:
      "Earth scientists, researchers, environmental organizations, educators, students, government agencies, and the general public interested in Earth observation.",
    keyInsights:
      "Earth's surface is constantly changing because of both natural processes and human activities. NISAR radar data can help observe changes such as wetland loss, forest wildfires, earthquakes, agricultural activities, and glacier movement.",
    mainChallenges:
      "Processing and interpreting large amounts of SAR/radar data, making complex remote-sensing information understandable, detecting meaningful surface changes, comparing locations over time, and presenting the results through an intuitive interface.",
    recommendations:
      "Develop an interactive global map where users can select a location and time period, compare radar observations, visualize surface changes, and explore different change categories such as earthquakes, wildfires, agriculture, wetlands, and glaciers.",
    actionMarketingPlan:
      "Develop a web-based prototype and demonstrate it using real NISAR datasets. Promote the application through universities, Earth-science communities, environmental organizations, STEM programs, and social media.",
    kpis: [
      "Number of locations analyzed",
      "number of datasets processed",
      "change events detected",
      "map interactions",
      "users",
      "average session time",
      "analysis completion rate",
      "visualization performance",
      "user feedback",
    ],
    shortDescription:
      "Use NISAR radar data to track and visualize changes on Earth's surface, from earthquakes to melting glaciers.",
    image: heroEarthImage,
    imageAlt: "The blue Earth seen from space with oceans and clouds",
    season: SEASON,
    organizer: ORGANIZER,
  },
  {
    id: "field-shift-adapting-farms",
    slug: "field-shift-adapting-farms",
    title: "Field Shift: Adapting Farms with NASA Data",
    category: "earth-climate",
    categoryLabel: "Earth & Climate",
    categoryIcon: "leaf",
    domains: [
      "Agricultural Technology (AgTech)",
      "Earth Science",
      "Software Development",
      "Data Science",
      "Remote Sensing",
      "Decision Support Systems",
    ],
    mainObjective:
      "To create a decision-support tool that combines NASA Earth observations with local soil data, crop characteristics, and farmer priorities to help farmers explore crop-rotation strategies that improve soil health and help farms adapt to changing environmental conditions.",
    businessObjectives:
      "To support better agricultural decision-making, improve long-term soil health, optimize water use, reduce risks from changing environmental conditions, and help farmers develop more resilient farming strategies.",
    targetAudience:
      "Farmers, agricultural consultants, agronomists, researchers, agricultural organizations, policymakers, and students working in agriculture and Earth science.",
    keyInsights:
      "Farmers are affected by changing temperatures, rainfall patterns, water availability, extreme weather, and declining soil health. Crop rotation strategies need to consider both environmental conditions and the specific characteristics and priorities of each farm.",
    mainChallenges:
      "Combining different data sources, translating satellite observations into useful agricultural insights, accounting for local soil and crop conditions, balancing competing farmer priorities, and presenting recommendations in a simple and practical way.",
    recommendations:
      "Build an interactive decision-support platform that allows farmers to enter their location, soil characteristics, available crops, and priorities, then compare different crop-rotation strategies based on environmental and agricultural data.",
    actionMarketingPlan:
      "Develop a prototype using NASA Earth observation data and test it with farmers, agricultural experts, universities, and agricultural organizations. Demonstrate real-world use cases and promote the tool through AgTech communities, agricultural institutions, STEM programs, and digital platforms.",
    kpis: [
      "Number of farms/users analyzed",
      "number of rotation strategies evaluated",
      "water-use improvement",
      "soil-health indicators",
      "user engagement",
      "decision-making time",
      "recommendation usefulness",
      "user feedback",
    ],
    shortDescription:
      "Combine NASA Earth observations with local soil and crop data to explore more resilient crop-rotation strategies.",
    image: sustainabilityImage,
    imageAlt: "Green Earth seen from space",
    season: SEASON,
    organizer: ORGANIZER,
  },
  {
    id: "flame-in-freefall",
    slug: "flame-in-freefall",
    title:
      "Flame in Freefall: AI-Powered Fire Safety Insights from Microgravity Combustion Data",
    category: "space-exploration",
    categoryLabel: "Space Exploration",
    categoryIcon: "planet",
    domains: [
      "Space Exploration",
      "Artificial Intelligence",
      "Data Science",
      "Fire Safety",
      "Microgravity Research",
      "Software Development",
    ],
    mainObjective:
      "To create an interactive AI-powered dashboard that organizes, summarizes, compares, and interprets NASA's microgravity combustion experiments to generate useful fire-safety insights for future human space missions.",
    businessObjectives:
      "To make NASA's large volume of combustion research easier to search and understand, support fire-safety research and mission planning, and help engineers and researchers identify useful findings for future lunar and Mars missions.",
    targetAudience:
      "Space engineers, fire-safety researchers, scientists, astronauts, mission planners, data scientists, educators, and students.",
    keyInsights:
      "Fire behaves differently in microgravity compared with Earth. NASA has accumulated decades of experimental results, but the large volume of data makes it difficult to efficiently find, compare, and interpret relevant findings.",
    mainChallenges:
      "The main challenges are the large volume of experimental results, difficulty finding relevant studies, comparing experiments with different conditions, extracting meaningful information, and translating research findings into practical fire-safety insights.",
    recommendations:
      "Build an AI-powered research dashboard that can search experiments, summarize findings, compare combustion conditions, rank relevant studies, identify patterns, and provide clear explanations of their potential fire-safety implications.",
    actionMarketingPlan:
      "Develop a working prototype using NASA combustion research data, demonstrate real research scenarios, and present the tool to space researchers, universities, fire-safety communities, aerospace organizations, and STEM communities.",
    kpis: [
      "Number of experiments indexed",
      "search accuracy",
      "relevance of retrieved studies",
      "number of comparisons performed",
      "AI summary accuracy",
      "dashboard users",
      "average research time saved",
      "user engagement",
      "expert/user feedback",
    ],
    shortDescription:
      "Turn NASA's microgravity combustion experiments into an AI-powered dashboard for fire-safety insights.",
    image: spaceExplorationImage,
    imageAlt: "Spacecraft exploring a distant planet",
    season: SEASON,
    organizer: ORGANIZER,
  },
  {
    id: "modis-viirs-hotspots-harmonization",
    slug: "modis-viirs-hotspots-harmonization",
    title: "Harmonization of MODIS and VIIRS Hot Spots",
    category: "earth-climate",
    categoryLabel: "Earth & Climate",
    categoryIcon: "leaf",
    domains: [
      "Earth Science",
      "Remote Sensing",
      "Satellite Data",
      "Software Development",
      "Data Integration",
      "Geospatial Analysis",
      "Fire Monitoring",
    ],
    mainObjective:
      "To build a web application that harmonizes active fire hotspot records from MODIS and VIIRS into a consistent burning activity calendar, allowing users to understand when and where burning has occurred.",
    businessObjectives:
      "To provide a more consistent historical view of fire activity, support early warning and emergency response, improve fire monitoring, and help scientists and land managers make better-informed decisions.",
    targetAudience:
      "Fire managers, emergency responders, scientists, environmental organizations, land managers, government agencies, and researchers.",
    keyInsights:
      "Satellite sensors have monitored active fire hotspots for more than two decades, but the records are divided between different sensors. Since the datasets cannot be directly compared, combining and harmonizing them can provide a more consistent picture of fire activity over time and across locations.",
    mainChallenges:
      "Harmonizing data from different satellite sensors, accounting for differences between MODIS and VIIRS, creating a consistent historical record, handling large geospatial datasets, and identifying unusual or critical periods of burning.",
    recommendations:
      "Develop a standardized data-processing pipeline that harmonizes MODIS and VIIRS hotspot records, followed by an interactive map and calendar that allow users to explore fire activity by location, date, intensity, and historical period.",
    actionMarketingPlan:
      "Build a web-based prototype focused on selected areas of interest, validate the results against historical fire events, and demonstrate the application to fire-management agencies, researchers, emergency-response organizations, and environmental communities.",
    kpis: [
      "Number of hotspots processed",
      "geographic coverage",
      "historical years covered",
      "data harmonization accuracy",
      "number of areas analyzed",
      "unusual events detected",
      "application users",
      "response time",
      "user feedback",
    ],
    shortDescription:
      "Harmonize MODIS and VIIRS fire hotspots into one consistent calendar of when and where burning occurred.",
    image: earthClimateImage,
    imageAlt: "Earth seen from space showing swirling cloud systems",
    season: SEASON,
    organizer: ORGANIZER,
  },
  {
    id: "earth-analogs-for-moon-and-mars",
    slug: "earth-analogs-for-moon-and-mars",
    title:
      "Identify Earth Locations that Analog the Permanent Moon Base Locations and Mars",
    category: "space-exploration",
    categoryLabel: "Space Exploration",
    categoryIcon: "planet",
    domains: [
      "Earth Science",
      "Planetary Science",
      "Geospatial Analysis",
      "Remote Sensing",
      "Software Development",
      "Space Exploration",
      "GIS",
    ],
    mainObjective:
      "To use open Earth, Moon, and Mars datasets to identify and characterize locations on Earth that have environmental, geological, or physical characteristics similar to potential lunar or Martian landing sites and base locations.",
    businessObjectives:
      "To help space agencies and mission teams identify terrestrial analog sites where they can test spacecraft equipment, technologies, scientific methods, and operational procedures before deploying them on the Moon or Mars.",
    targetAudience:
      "Space agencies, mission planners, planetary scientists, engineers, researchers, universities, robotics teams, and space-exploration organizations.",
    keyInsights:
      "Some Earth environments have characteristics similar to the Moon or Mars, including deserts, polar regions, volcanic terrain, arid environments, and caves. Existing analog locations are useful for testing, but many potential analog sites remain poorly characterized.",
    mainChallenges:
      "Finding meaningful similarities between different planetary environments, combining datasets from Earth, Moon, and Mars, dealing with differences in topography, geology, temperature, terrain, and resources, and accurately characterizing potential analog sites.",
    recommendations:
      "Develop a Terrestrial Analog Finder that compares Earth locations with selected lunar and Martian environments using measurable parameters such as terrain, geology, temperature, elevation, surface composition, and environmental conditions.",
    actionMarketingPlan:
      "Build an interactive 3D/GIS web platform, identify and rank candidate analog locations based on transparent similarity criteria, and demonstrate the results to universities, space agencies, robotics teams, researchers, and STEM communities.",
    kpis: [
      "Number of Earth locations analyzed",
      "number of potential analog sites identified",
      "similarity-analysis accuracy",
      "geographic coverage",
      "number of planetary environments modeled",
      "map interactions",
      "users",
      "expert/user feedback",
    ],
    shortDescription:
      "Identify Earth locations whose geology and environment resemble potential Moon and Mars base sites.",
    image: aboutSpaceImage,
    imageAlt: "Satellite orbiting above the Earth",
    season: SEASON,
    organizer: ORGANIZER,
  },
  {
    id: "interplanetary-survival-guide-martian-map",
    slug: "interplanetary-survival-guide-martian-map",
    title: "Interplanetary Survival Guide: Martian Map",
    category: "space-exploration",
    categoryLabel: "Space Exploration",
    categoryIcon: "planet",
    domains: [
      "Mars Exploration",
      "Human Exploration",
      "Planetary Science",
      "GIS/Geospatial Analysis",
      "Software Development",
      "Remote Sensing",
      "Data Visualization",
    ],
    mainObjective:
      "To create a layered, integrated Martian map that combines data from multiple NASA missions and provides astronauts with information about routes, destinations, terrain, and current conditions to help them safely plan and perform Marswalks.",
    businessObjectives:
      "To support future human Mars missions, improve route and mission planning, make NASA's Mars datasets easier to access and combine, and help astronauts conduct scientific activities efficiently while maintaining safety.",
    targetAudience:
      "Future astronauts, mission planners, planetary scientists, engineers, researchers, educators, students, and space enthusiasts.",
    keyInsights:
      "NASA has collected many different types of Mars data over decades. Combining these datasets can provide a more complete understanding of a location, including terrain, scientific features, environmental conditions, and potential hazards.",
    mainChallenges:
      "Integrating data from different NASA missions, dealing with different data formats and resolutions, creating an intuitive map, providing useful route information, and presenting enough scientific detail without overwhelming the user.",
    recommendations:
      "Build an interactive layered Mars map where users can switch between terrain, elevation, geological features, hazards, scientific targets, rover data, and other relevant layers. Add route planning and destination analysis for Marswalks.",
    actionMarketingPlan:
      "Develop a web-based prototype focused on a selected Martian region, demonstrate realistic astronaut route-planning scenarios, and present it to universities, space communities, planetary researchers, STEM organizations, and NASA Space Apps participants.",
    kpis: [
      "Number of NASA datasets integrated",
      "number of map layers",
      "locations analyzed",
      "routes created",
      "scientific targets identified",
      "map interactions",
      "users",
      "route-planning completion time",
      "user feedback",
    ],
    shortDescription:
      "Build a layered Martian map that helps astronauts plan safe, science-rich Marswalks.",
    image: spaceExplorationImage,
    imageAlt: "Spacecraft exploring a distant planet",
    season: SEASON,
    organizer: ORGANIZER,
  },
  {
    id: "planet-x-and-spherex",
    slug: "planet-x-and-spherex",
    title: "Planet X and SPHEREx",
    category: "space-exploration",
    categoryLabel: "Space Exploration",
    categoryIcon: "planet",
    domains: [
      "Astrophysics",
      "Planetary Science",
      "Astronomy",
      "Software Development",
      "Data Visualization",
      "Image Analysis",
    ],
    mainObjective:
      "To create a public-facing web tool that displays images from NASA's SPHEREx mission and allows users to easily compare the same areas of the sky over time to identify objects that have changed position.",
    businessObjectives:
      "To make SPHEREx's massive astronomical dataset accessible and understandable to the public, support the discovery and study of moving celestial objects, and encourage public participation in astronomical exploration.",
    targetAudience:
      "Astronomers, researchers, students, educators, citizen scientists, astronomy enthusiasts, and the general public.",
    keyInsights:
      "SPHEREx maps the entire sky every six months using 102 bands of near-infrared light and produces images containing more than a billion objects. Comparing images over time can reveal objects that change position, including comets, asteroids, stars, brown dwarfs, and potentially new planets.",
    mainChallenges:
      "The dataset is extremely large, making manual analysis difficult. The application must efficiently display astronomical images, align observations from different periods, detect or highlight movement, and make the results understandable to non-experts.",
    recommendations:
      "Build an interactive sky viewer with a time slider or before/after comparison, object tracking, zooming, filtering, and automatic highlighting of objects that appear to move between observations.",
    actionMarketingPlan:
      "Launch the tool as a public astronomy platform, demonstrate interesting moving objects, and promote it through astronomy communities, universities, schools, citizen-science communities, social media, and STEM programs.",
    kpis: [
      "Number of users",
      "sky regions viewed",
      "objects tracked",
      "image comparisons performed",
      "moving objects identified",
      "average session time",
      "user engagement",
      "citizen-science participation",
      "user feedback",
    ],
    shortDescription:
      "Compare NASA SPHEREx sky images over time to spot celestial objects that change position.",
    image: aboutSpaceImage,
    imageAlt: "Satellite orbiting above the Earth",
    season: SEASON,
    organizer: ORGANIZER,
  },
  {
    id: "space-mission-design-game",
    slug: "space-mission-design-game",
    title: "Space Mission Design Game",
    category: "technology",
    categoryLabel: "Technology",
    categoryIcon: "gear",
    domains: [
      "Space Exploration",
      "Game Development",
      "Systems Engineering",
      "Software Development",
      "STEM Education",
      "Mission Planning",
    ],
    mainObjective:
      "To create an interactive game that allows students to design, manage, and simulate a complete space mission while making engineering decisions and experiencing the trade-offs involved in real mission design.",
    businessObjectives:
      "To make space engineering more accessible and engaging, help students understand systems engineering and resource management, and provide an educational environment where they can experiment with mission design without the cost or complexity of a real mission.",
    targetAudience:
      "Students, beginner space enthusiasts, educators, STEM communities, and young learners interested in engineering and space exploration.",
    keyInsights:
      "Space missions require balancing many interconnected factors, including mission objectives, spacecraft design, scientific instruments, launch vehicles, budget, power, mass, communications, and orbital constraints. Changing one decision can affect multiple parts of the mission.",
    mainChallenges:
      "Making complex engineering trade-offs understandable, creating realistic but accessible simulations, managing multiple constraints simultaneously, and keeping the game engaging while maintaining educational value.",
    recommendations:
      "Build a mission-design simulator with limited budgets and resources, configurable spacecraft components, mission objectives, orbital options, scientific instruments, and real-time feedback showing how each decision affects mission performance.",
    actionMarketingPlan:
      "Develop a playable web-based prototype, test it with students and educators, create several mission scenarios, and promote it through schools, universities, STEM clubs, gaming communities, and space-education platforms.",
    kpis: [
      "Number of players",
      "missions designed",
      "missions successfully completed",
      "average play time",
      "mission attempts",
      "decision interactions",
      "player retention",
      "learning improvement",
      "user feedback",
    ],
    shortDescription:
      "Design and simulate a complete space mission while balancing engineering trade-offs and resources.",
    image: technologyImage,
    imageAlt: "A satellite in orbit above the Earth",
    season: SEASON,
    organizer: ORGANIZER,
  },
  {
    id: "earth-information-jukebox",
    slug: "earth-information-jukebox",
    title: "The Earth Information Jukebox",
    category: "earth-climate",
    categoryLabel: "Earth & Climate",
    categoryIcon: "leaf",
    domains: [
      "Earth Science",
      "Data Sonification",
      "Software Development",
      "Arts & Multimedia",
      "Data Visualization",
      "Accessibility",
    ],
    mainObjective:
      "To build an “Earth Jukebox” that converts NASA Earth Information Center (EIC) visualizations into dynamic sounds, allowing people to experience and understand changes on Earth through both sight and sound.",
    businessObjectives:
      "Make complex Earth science more accessible, engaging, and memorable, reach audiences who may not fully benefit from visualizations alone, and create a new way to communicate scientific information through multimedia.",
    targetAudience:
      "Students, educators, Earth-science enthusiasts, general public, multimedia creators, museums, science centers, and people who benefit from non-visual or multi-sensory experiences.",
    keyInsights:
      "NASA's EIC already creates visual representations of changes in Earth's systems. These visual patterns can potentially be translated into sound patterns, allowing changes in environmental data to be perceived through another sensory channel.",
    mainChallenges:
      "Converting scientific visual information into meaningful sound, ensuring the sound actually represents the underlying data, keeping the experience understandable rather than noisy, and creating an interface that works for different audiences.",
    recommendations:
      "Build an interactive interface where users select an EIC visualization and hear a real-time sonification. Allow users to control sound parameters and explain what each sound represents scientifically.",
    actionMarketingPlan:
      "Create an interactive web prototype, demonstrate several Earth phenomena, test it with students and educators, and promote it through schools, museums, science centers, STEM communities, social media, and accessibility-focused organizations.",
    kpis: [
      "Number of users",
      "visualizations sonified",
      "listening sessions",
      "average interaction time",
      "completed experiences",
      "user understanding",
      "accessibility feedback",
      "repeat users",
      "educational feedback",
    ],
    shortDescription:
      "Turn NASA Earth Information Center visualizations into sound so anyone can experience changes on Earth.",
    image: heroEarthImage,
    imageAlt: "The blue Earth seen from space with oceans and clouds",
    season: SEASON,
    organizer: ORGANIZER,
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
    labels: {
      home: "Home",
    },
    back: { label: "Back to all challenges", href: "/challenges" },
  },
  /* Headings for the structured detail fields, in render order. */
  sectionTitles: {
    objective: "Main Objective",
    businessObjectives: "Business Objectives",
    domains: "Technical/Business Domains",
    audience: "Target Audience",
    keyInsights: "Key Insights from the Data",
    mainChallenges: "Main Challenges Identified",
    recommendations: "Recommendations",
    actionMarketingPlan: "Action / Marketing Plan",
    kpis: "KPIs",
  },
  /* Small label above the domains list in the hero. */
  domainsLabel: "Domains",
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
  /* Previous / next challenge navigation. */
  nav: {
    title: "Challenge Navigation",
    previousLabel: "Previous Challenge",
    nextLabel: "Next Challenge",
    allLabel: "Back to all challenges",
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
