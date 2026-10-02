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
  { id: "standings", label: "Live Standings", href: "/live-standings" },
  { id: "about", label: "About", href: "#about" },
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
  links: [
    { id: "home", label: "Home", href: "/" },
    { id: "challenges", label: "Challenges", href: "/challenges" },
    { id: "standings", label: "Live Standings", href: "/live-standings" },
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