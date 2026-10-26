/* ==========================================================================
   Homepage content — single source of truth for the marketing homepage.
   --------------------------------------------------------------------------
   Hero, About and Current Event are static copy: the public API exposes no
   endpoint for them. Top Challenges, Previous Events and Sponsors are rendered
   from the API and keep only their headings/state copy here — never fixture
   records.

   Core Team members are not available publicly, so the section is guarded off
   by SHOW_CORE_TEAM. The component and its fixture are kept for when the
   backend can supply real people.
   ========================================================================== */

import { site } from "./site";
import heroEarthImage from "../assets/images/hero-earth.jpeg";
import aboutImage from "../assets/images/about-space.jpeg";

/* No public core-team endpoint exists. Never render placeholder names on the
   real site; flip this only when real member data is available. */
export const SHOW_CORE_TEAM = false;

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
  /* Decorative background art: rendered with an empty alt and an aria-hidden
     wrapper, because the message is carried by the copy beside it. */
  image: {
    src: heroEarthImage,
    alt: "",
  },
  description:
    "NASA Space Apps is a global hackathon that brings together innovators, creators, and problem-solvers to tackle real-world challenges using space data.",
  primaryAction: {
    label: "Explore Challenges",
    href: "/challenges",
    icon: "arrow",
  },
  secondaryAction: {
    label: "Live Standings",
    href: "/live-standings",
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
  /* The brand logo comes from site.js so the asset has a single definition. */
  logo: site.logo,
  logoAlt: site.logoAlt,
  links: { details: "/events/nasa-space-apps-hurghada-2026" },
};

/* --------------------------------------------------------------------------
   Top challenges (GET /challenges)
   -------------------------------------------------------------------------- */

export const challenges = {
  eyebrow: "TOP CHALLENGES",
  title: "Explore the Challenges",
  description:
    "Discover real-world problems and use the power of space data to create innovative solutions.",
  action: { label: "View All Challenges", href: "/challenges", icon: "arrow" },
  cardAction: "Explore Challenge",
  excerptLength: 160,
  states: {
    loading: "Loading challenges...",
    errorTitle: "Couldn't load challenges",
    retry: "Retry",
    emptyTitle: "No challenges yet",
    emptyDescription: "Published challenges will appear here.",
  },
};

/* --------------------------------------------------------------------------
   Previous events (GET /seasonmedia)
   -------------------------------------------------------------------------- */

export const previousEvents = {
  eyebrow: "PREVIOUS EVENTS",
  title: "Highlights from previous editions",
  description:
    "Take a look at some of the amazing projects, teams, and moments from our past editions.",
  action: { label: "View all season media", href: "/season-media" },
  linkLabel: "View event",
  newTabHint: "(opens in a new tab)",
  states: {
    loading: "Loading previous events...",
    errorTitle: "Couldn't load previous events",
    retry: "Retry",
  },
};

/* --------------------------------------------------------------------------
   Core team
   --------------------------------------------------------------------------
   Fixture retained for the component; not rendered while SHOW_CORE_TEAM is
   false because the public API exposes no core-team data.
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
   Sponsors (GET /sponsors?includeInactive=false)
   -------------------------------------------------------------------------- */

export const sponsors = {
  eyebrow: "OUR SPONSORS",
  title: "With thanks to our sponsors",
  description:
    "We're grateful to our partners and supporters who make this event possible.",
  action: { label: "View all sponsors", href: "/sponsors" },
  newTabHint: "(opens in a new tab)",
  states: {
    loading: "Loading sponsors...",
    errorTitle: "Couldn't load sponsors",
    retry: "Retry",
  },
};
