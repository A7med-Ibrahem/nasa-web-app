/* ==========================================================================
   Homepage content — single source of truth for the marketing homepage.
   --------------------------------------------------------------------------
   Hero, About and Current Event are static copy: the public API exposes no
   endpoint for them. Previous Events, Core Team and Sponsors are rendered
   from the API and keep only their headings/state copy here — never fixture
   records. Challenges are intentionally not rendered on the homepage; they
   live on the dedicated /challenges page.
   ========================================================================== */

import { site } from "./site";
import heroEarthImage from "../assets/images/hero-earth.jpeg";
import aboutImage from "../assets/images/about-space.jpeg";

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
  carousel: {
    regionLabel: "Previous events carousel",
    previous: "Show previous events",
    next: "Show more events",
  },
  states: {
    loading: "Loading previous events...",
    errorTitle: "Couldn't load previous events",
    retry: "Retry",
  },
};

/* --------------------------------------------------------------------------
   Core team (GET /core-team)
   --------------------------------------------------------------------------
   Members always come from the public API; this module only owns the section
   copy and its loading/error/empty states.
   -------------------------------------------------------------------------- */

export const coreTeam = {
  eyebrow: "OUR CORE TEAM",
  title: "The people behind the mission",
  description:
    "A passionate team of organizers, mentors, and volunteers working to make NASA Space Apps a success.",
  states: {
    loading: "Loading core team members...",
    errorTitle: "Couldn't load the core team",
    emptyTitle: "Core team coming soon",
    emptyMessage: "The team members for this edition will be announced soon.",
    retry: "Retry",
  },
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
