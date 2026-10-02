/* ==========================================================================
   Homepage content — single source of truth for the marketing homepage.
   --------------------------------------------------------------------------
   This module is intentionally plain static data so that, once a backend
   exists, each export can be swapped for an API response with an identical
   shape. Components only consume these objects; none of them build content
   inline.
   ========================================================================== */

import earthClimateImage from "../assets/images/earth-climate.jpeg";
import spaceExplorationImage from "../assets/images/space-exploration.jpeg";
import technologyImage from "../assets/images/technology.jpeg";
import sustainabilityImage from "../assets/images/sustainability.jpeg";
import aboutImage from "../assets/images/about-space.jpeg";
import brandLogo from "../assets/images/nasa-logo.png";

/* --------------------------------------------------------------------------
   Site level
   -------------------------------------------------------------------------- */

export const site = {
  name: "NASA Space Apps Hurghada",
  shortName: "Space Apps Hurghada",
  tagline: "Space • Science • Technology",
  year: 2026,
  copyright: "© 2026 NASA Space Apps Hurghada. All rights reserved.",
};

export const navigationLinks = [
  { id: "home", label: "Home", href: "/" },
  { id: "challenges", label: "Challenges", href: "/challenges" },
  { id: "standings", label: "Live Standings", href: "/standings" },
  { id: "about", label: "About", href: "#about" },
];

/* --------------------------------------------------------------------------
   Hero
   -------------------------------------------------------------------------- */

export const hero = {
  brand: {
    primary: "NASA",
    secondary: "SPACE APPS",
    city: "HURGHADA",
  },
  tagline: "Space • Science • Technology",
  titleLines: ["Big Challenges.", "Bigger Impact."],
  description:
    "NASA Space Apps is a global hackathon that brings together innovators, creators, and problem-solvers to tackle real-world challenges using space data.",
  primaryAction: {
    label: "Explore Challenges",
    href: "/challenges",
    icon: "arrow",
  },
  secondaryAction: {
    label: "Live Standings",
    href: "/standings",
    icon: "signal",
  },
};

/* --------------------------------------------------------------------------
   About
   -------------------------------------------------------------------------- */

export const about = {
  eyebrow: "ABOUT NASA SPACE APPS",
  titleLines: ["From data to", "impact"],
  description:
    "NASA Space Apps Challenge is a global hackathon that invites participants from all backgrounds to use open NASA data and technology to solve real-world problems on Earth and beyond.",
  action: {
    label: "Learn More",
    href: "/about",
    icon: "arrow",
  },
  image: {
    src: aboutImage,
    alt: "Satellite orbiting above the Earth",
  },
  statistics: [
    {
      id: "countries",
      value: "200+",
      label: "Countries & Regions",
      icon: "globe",
    },
    {
      id: "participants",
      value: "100,000+",
      label: "Participants",
      icon: "users",
    },
    {
      id: "projects",
      value: "1,000+",
      label: "Projects",
      icon: "rocket",
    },
  ],
};

/* --------------------------------------------------------------------------
   Current event
   -------------------------------------------------------------------------- */

export const currentEvent = {
  id: "nasa-space-apps-hurghada-2026",
  eyebrow: "CURRENT EVENT",
  title: "NASA Space Apps Hurghada 2026",
  description:
    "Join us for an exciting journey of innovation, collaboration, and impact. Take on real NASA challenges and help build a better future — on Earth and beyond.",
  startDate: "2026-04-24",
  endDate: "2026-04-26",
  dateLabel: "April 24 – 26, 2026",
  location: "Hurghada, Egypt",
  logo: brandLogo,
  logoAlt: "NASA Space Apps Hurghada",
  links: { details: "/events/nasa-space-apps-hurghada-2026" },
};

/* --------------------------------------------------------------------------
   Top challenges
   -------------------------------------------------------------------------- */

export const challenges = {
  eyebrow: "TOP CHALLENGES",
  title: "Explore the Challenges",
  description:
    "Discover real-world problems and use the power of space data to create innovative solutions.",
  action: { label: "View All Challenges", href: "/challenges", icon: "arrow" },
  items: [
    {
      id: "climate-resilience",
      slug: "climate-resilience",
      category: "EARTH & CLIMATE",
      title: "Climate Resilience",
      description:
        "Build solutions to help communities adapt to climate change and natural disasters.",
      image: earthClimateImage,
      imageAlt: "Earth seen from space showing cloud systems",
    },
    {
      id: "future-of-exploration",
      slug: "future-of-exploration",
      category: "SPACE EXPLORATION",
      title: "Future of Exploration",
      description:
        "Support the next generation of space exploration and human settlement.",
      image: spaceExplorationImage,
      imageAlt: "Spacecraft exploring a distant planet",
    },
    {
      id: "open-innovation",
      slug: "open-innovation",
      category: "TECHNOLOGY",
      title: "Open Innovation",
      description:
        "Use NASA open data to build tools that improve lives on Earth.",
      image: technologyImage,
      imageAlt: "Satellite technology in orbit",
    },
    {
      id: "sustainable-future",
      slug: "sustainable-future",
      category: "SUSTAINABILITY",
      title: "Sustainable Future",
      description:
        "Develop solutions for a more sustainable and resilient planet.",
      image: sustainabilityImage,
      imageAlt: "Green Earth with sustainable energy research",
    },
  ],
};

/* --------------------------------------------------------------------------
   Previous events
   -------------------------------------------------------------------------- */

export const previousEvents = {
  eyebrow: "PREVIOUS EVENTS",
  title: "Highlights from 2024 & 2025",
  description:
    "Take a look at some of the amazing projects, teams, and moments from our past editions.",
  action: { label: "View Gallery", href: "/events", icon: "arrow" },
  items: [
    {
      id: "nasa-space-apps-hurghada-2025",
      year: "2025",
      title: "NASA Space Apps Hurghada 2025",
      description:
        "Teams tackled real NASA challenges and shipped working prototypes in a weekend.",
      /* Placeholder art from existing project assets — replace with real
         event photography once available. */
      image: technologyImage,
      imageAlt: "NASA Space Apps Hurghada 2025 event highlights",
      slug: "nasa-space-apps-hurghada-2025",
    },
    {
      id: "nasa-space-apps-hurghada-2024",
      year: "2024",
      title: "NASA Space Apps Hurghada 2024",
      description:
        "Our first Hurghada edition brought together students, mentors, and first-time builders.",
      /* Placeholder art from existing project assets — replace with real
         event photography once available. */
      image: spaceExplorationImage,
      imageAlt: "NASA Space Apps Hurghada 2024 event highlights",
      slug: "nasa-space-apps-hurghada-2024",
    },
  ],
};

/* --------------------------------------------------------------------------
   Core team
   -------------------------------------------------------------------------- */

export const coreTeam = {
  eyebrow: "OUR CORE TEAM",
  title: "The people behind the mission",
  description:
    "A passionate team of organizers, mentors, and volunteers working to make NASA Space Apps a success.",
  members: [
    {
      id: "ahmed-hassan",
      name: "Ahmed Hassan",
      role: "Event Lead",
      image: null,
    },
    {
      id: "sarah-mohamed",
      name: "Sarah Mohamed",
      role: "Tech Lead",
      image: null,
    },
    {
      id: "omar-el-sayed",
      name: "Omar El-Sayed",
      role: "Community Lead",
      image: null,
    },
    {
      id: "nour-ahmed",
      name: "Nour Ahmed",
      role: "Partnerships",
      image: null,
    },
    {
      id: "yousef-ali",
      name: "Yousef Ali",
      role: "Operations",
      image: null,
    },
  ],
};

/* --------------------------------------------------------------------------
   Sponsors
   -------------------------------------------------------------------------- */

export const sponsors = {
  eyebrow: "OUR SPONSORS",
  title: "With thanks to our sponsors",
  description:
    "We're grateful to our partners and supporters who make this event possible.",
  action: { label: "View All Sponsors", href: "/sponsors", icon: "arrow" },
  /* `logo` is `null` until official brand assets are supplied under
     src/assets/images/sponsors/. No <img> is rendered for null logos, so the
     page never issues a request for a file that does not exist. */
  items: [
    { id: "nasa", name: "NASA", logo: null },
    { id: "microsoft", name: "Microsoft", logo: null },
    { id: "google", name: "Google", logo: null },
    { id: "intel", name: "Intel", logo: null },
    { id: "aws", name: "AWS", logo: null },
    { id: "esri", name: "Esri", logo: null },
  ],
};

/* --------------------------------------------------------------------------
   Footer
   -------------------------------------------------------------------------- */

export const footer = {
  brand: {
    name: "NASA Space Apps Hurghada",
    logo: brandLogo,
    logoAlt: "NASA Space Apps Hurghada",
    href: "/",
  },
  links: [
    { id: "home", label: "Home", href: "/" },
    { id: "challenges", label: "Challenges", href: "/challenges" },
    { id: "standings", label: "Live Standings", href: "/standings" },
    { id: "about", label: "About", href: "/about" },
  ],
  socials: [
    {
      id: "x",
      label: "X",
      href: "https://x.com/",
      icon: "x",
    },
    {
      id: "linkedin",
      label: "LinkedIn",
      href: "https://www.linkedin.com/",
      icon: "linkedin",
    },
    {
      id: "instagram",
      label: "Instagram",
      href: "https://www.instagram.com/",
      icon: "instagram",
    },
    {
      id: "youtube",
      label: "YouTube",
      href: "https://www.youtube.com/",
      icon: "youtube",
    },
  ],
  bottomNote: "Space • Science • Technology",
};