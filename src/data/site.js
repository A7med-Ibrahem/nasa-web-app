/* ==========================================================================
   Site-wide chrome data
   --------------------------------------------------------------------------
   Content owned by the global layout (Navbar, Footer) rather than by any one
   page. Keeping it here means future pages get the header and footer without
   importing homepage-only content, and the brand logo has a single source.

   Like homepageData.js this is intentionally plain static data, so each export
   can later be swapped for an API response of identical shape.
   ========================================================================== */

import brandLogo from "../assets/logos/nasa-logo.png";

/* --------------------------------------------------------------------------
   Site level
   -------------------------------------------------------------------------- */

export const site = {
  name: "NASA Space Apps Hurghada",
  shortName: "Space Apps Hurghada",
  tagline: "Space • Science • Technology",
  year: 2026,
  copyright: "© 2026 NASA Space Apps Hurghada. All rights reserved.",
  logo: brandLogo,
  logoAlt: "NASA Space Apps Hurghada",
};

/* Primary navigation. `id` is what the router matches against, so the active
   link stays a single data decision rather than a hardcoded check in the
   Navbar. */
export const navigationLinks = [
  { id: "home", label: "Home", href: "/" },
  { id: "challenges", label: "Challenges", href: "/challenges" },
  { id: "teams", label: "Teams", href: "/teams" },
  { id: "standings", label: "Live Standings", href: "/live-standings" },
  { id: "login", label: "Login", href: "/login" },
];

/* --------------------------------------------------------------------------
   Footer
   -------------------------------------------------------------------------- */

export const footer = {
  brand: {
    name: site.name,
    logo: site.logo,
    logoAlt: site.logoAlt,
    href: "/",
  },
  about: {
    title: "About",
    description:
      "NASA Space Apps Hurghada brings together innovators, creators, and problem-solvers to tackle real-world challenges using open NASA data.",
    eventLink: {
      label: "NASA Space Apps Challenge — Hurghada Local Event",
      href: "https://www.spaceappschallenge.org/2026/local-events/hurghada/",
    },
  },
  quickLinksTitle: "Quick Links",
  quickLinks: [
    { id: "home", label: "Home", href: "/" },
    { id: "challenges", label: "Challenges", href: "/challenges" },
    { id: "sponsors", label: "Sponsors", href: "/sponsors" },
    { id: "season-media", label: "Previous Events", href: "/season-media" },
  ],
  contactTitle: "Contact",
  contact: {
    email: "info@spaceappshurghada.com",
  },
  socialTitle: "Follow Us",
  socials: [
    {
      id: "instagram",
      label: "Instagram",
      href: "https://www.instagram.com/spaceappshurghada/",
      icon: "instagram",
    },
    {
      id: "facebook",
      label: "Facebook",
      href: "https://www.facebook.com/spaceappshurghada",
      icon: "facebook",
    },
    {
      id: "linkedin",
      label: "LinkedIn",
      href: "https://www.linkedin.com/company/spaceappshurghada/",
      icon: "linkedin",
    },
  ],
  bottomNote: "Space • Science • Technology",
};