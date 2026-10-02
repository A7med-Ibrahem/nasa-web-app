/* ==========================================================================
   Lightweight inline SVG icon set.
   No icon library dependency: these are a handful of hand-rolled paths so the
   bundle stays small.
   All icons are decorative by default (aria-hidden) and inherit `currentColor`.
   ========================================================================== */

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": "true",
  focusable: "false",
};

export function ArrowRightIcon({ size = 18 }) {
  return (
    <svg {...base} width={size} height={size}>
      <path d="M4 12h15" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  );
}

export function SignalIcon({ size = 18 }) {
  return (
    <svg {...base} width={size} height={size}>
      <circle cx="12" cy="12" r="2.4" fill="currentColor" stroke="none" />
      <path d="M7.8 16.2a5.9 5.9 0 0 1 0-8.4" />
      <path d="M16.2 7.8a5.9 5.9 0 0 1 0 8.4" />
      <path d="M4.9 19.1a10 10 0 0 1 0-14.2" />
      <path d="M19.1 4.9a10 10 0 0 1 0 14.2" />
    </svg>
  );
}

export function CalendarIcon({ size = 20 }) {
  return (
    <svg {...base} width={size} height={size}>
      <rect x="3" y="5" width="18" height="16" rx="2.5" />
      <path d="M3 10h18" />
      <path d="M8 3v4" />
      <path d="M16 3v4" />
    </svg>
  );
}

export function MapPinIcon({ size = 20 }) {
  return (
    <svg {...base} width={size} height={size}>
      <path d="M12 21c4.2-4.6 6-7.9 6-10.4A6 6 0 0 0 6 10.6C6 13.1 7.8 16.4 12 21Z" />
      <circle cx="12" cy="10.4" r="2.4" />
    </svg>
  );
}

export function GlobeIcon({ size = 28 }) {
  return (
    <svg {...base} width={size} height={size}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3c2.6 2.7 2.6 15.3 0 18" />
      <path d="M12 3c-2.6 2.7-2.6 15.3 0 18" />
    </svg>
  );
}

export function UsersIcon({ size = 28 }) {
  return (
    <svg {...base} width={size} height={size}>
      <circle cx="9" cy="8.5" r="3.2" />
      <path d="M3.2 19.5a5.8 5.8 0 0 1 11.6 0" />
      <path d="M16.2 5.9a3.2 3.2 0 0 1 0 5.4" />
      <path d="M17.6 14.4a5.8 5.8 0 0 1 3.2 5.1" />
    </svg>
  );
}

export function RocketIcon({ size = 28 }) {
  return (
    <svg {...base} width={size} height={size}>
      <path d="M12 3c3 2.1 4.6 5.3 4.6 9L12 16.4 7.4 12C7.4 8.3 9 5.1 12 3Z" />
      <circle cx="12" cy="9.6" r="1.7" />
      <path d="M9.6 16.2 7 21l4-1.4" />
      <path d="M14.4 16.2 17 21l-4-1.4" />
    </svg>
  );
}

/* --------------------------------------------------------------------------
   Standings icons
   -------------------------------------------------------------------------- */

/* Movement is drawn as an arrow rather than a triangle so it stays legible at
   the small size it appears in the standings table. */
export function TrendUpIcon({ size = 14 }) {
  return (
    <svg {...base} width={size} height={size}>
      <path d="M6 18 18 6" />
      <path d="M9.5 6H18v8.5" />
    </svg>
  );
}

export function TrendDownIcon({ size = 14 }) {
  return (
    <svg {...base} width={size} height={size}>
      <path d="M6 6l12 12" />
      <path d="M18 9.5V18H9.5" />
    </svg>
  );
}

export function CrownIcon({ size = 15 }) {
  return (
    <svg {...base} width={size} height={size}>
      <path d="M4 17h16" />
      <path d="M4 17 3 7.5l4.6 3.2L12 5l4.4 5.7L21 7.5 20 17" />
    </svg>
  );
}

/* Two figures: distinct from UsersIcon, which shows a single person plus a
   second partial figure, and used where a *group* of teams is meant. */
export function TeamIcon({ size = 18 }) {
  return (
    <svg {...base} width={size} height={size}>
      <circle cx="8.5" cy="8" r="2.8" />
      <circle cx="16.5" cy="9.5" r="2.2" />
      <path d="M3.5 18a5 5 0 0 1 10 0" />
      <path d="M14.5 18a3.6 3.6 0 0 1 6-1.7" />
    </svg>
  );
}

export function ChartIcon({ size = 18 }) {
  return (
    <svg {...base} width={size} height={size}>
      <path d="M4 20V4" />
      <path d="M4 20h16" />
      <path d="M8.5 20v-6" />
      <path d="M13 20v-9" />
      <path d="M17.5 20v-4" />
    </svg>
  );
}

export function MenuIcon({ size = 22 }) {
  return (
    <svg {...base} width={size} height={size}>
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </svg>
  );
}

export function CloseIcon({ size = 22 }) {
  return (
    <svg {...base} width={size} height={size}>
      <path d="M6 6l12 12" />
      <path d="M18 6L6 18" />
    </svg>
  );
}

/* --------------------------------------------------------------------------
   Social icons (solid glyphs)
   -------------------------------------------------------------------------- */

export function XIcon({ size = 18 }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M18.244 2H21.5l-7.1 8.11L22.75 22h-6.54l-5.12-6.7L5.2 22H1.94l7.6-8.68L1.5 2h6.7l4.63 6.12L18.244 2Zm-1.14 18h1.8L7 3.9H5.07L17.104 20Z" />
    </svg>
  );
}

export function LinkedInIcon({ size = 18 }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.75h4V21H3V9.75Zm6.5 0h3.83v1.54h.05c.53-1 1.84-2.04 3.78-2.04 4.04 0 4.79 2.66 4.79 6.12V21h-4v-4.69c0-1.12-.02-2.56-1.56-2.56-1.56 0-1.8 1.22-1.8 2.48V21h-4V9.75Z" />
    </svg>
  );
}

export function InstagramIcon({ size = 18 }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9a5.5 5.5 0 0 1-5.5 5.5h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2Zm0 2A3.5 3.5 0 0 0 4 7.5v9A3.5 3.5 0 0 0 7.5 20h9a3.5 3.5 0 0 0 3.5-3.5v-9A3.5 3.5 0 0 0 16.5 4h-9ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm5.25-3.25a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5Z" />
    </svg>
  );
}

export function YouTubeIcon({ size = 18 }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M21.6 7.2a2.5 2.5 0 0 0-1.76-1.77C18.27 5 12 5 12 5s-6.27 0-7.84.43A2.5 2.5 0 0 0 2.4 7.2C2 8.78 2 12 2 12s0 3.22.4 4.8a2.5 2.5 0 0 0 1.76 1.77C5.73 19 12 19 12 19s6.27 0 7.84-.43a2.5 2.5 0 0 0 1.76-1.77C22 15.22 22 12 22 12s0-3.22-.4-4.8ZM10 15V9l5.2 3L10 15Z" />
    </svg>
  );
}