# NASA Space Apps Hurghada

## Project Overview

Frontend for **NASA Space Apps Hurghada**, a global hackathon where innovators,
creators and problem-solvers tackle real-world challenges using NASA open data
and space technology.

This is a frontend built with React and Vite. The homepage and the
**Live Standings** page (`/live-standings`) are implemented; additional pages
(Challenges, Events, Sponsors, …) are planned. There is **no backend yet** — all
content currently comes from static data modules, structured so each export can
later be replaced by an API response of identical shape.

## Tech Stack

- React 19
- React Router 7 (client-side routing)
- Vite 8
- JavaScript (JSX)
- CSS (plain CSS with custom properties — no CSS framework)
- ESLint 10 (flat config, with `eslint-plugin-react-hooks` and
  `eslint-plugin-react-refresh`)

No state manager, data-fetching library or UI kit is installed.

## Project Structure

```
src/
├── assets/
│   ├── images/            Section imagery (hero, about, challenge, event photos)
│   └── logos/             Brand assets (the NASA Space Apps Hurghada lockup)
│
├── components/
│   ├── common/
│   │   └── Icons/         Icons.jsx (SVG components) + iconRegistry.js (key → component)
│   ├── home/              Home page sections — not reusable outside Home
│   │   ├── Hero/
│   │   ├── About/
│   │   ├── CurrentEvent/
│   │   ├── TopChallenges/
│   │   ├── PreviousEvents/
│   │   ├── CoreTeam/
│   │   └── Sponsors/
│   ├── liveStandings/     Live Standings blocks — not reusable outside the page
│   │   ├── LiveStandingsHero/
│   │   ├── StandingsSection/
│   │   ├── StandingsSidebar/
│   │   ├── StandingsTable/
│   │   ├── StandingRow/
│   │   ├── CurrentChallenge/
│   │   ├── QuickStats/
│   │   └── ChallengeStats/
│   └── layout/            Page chrome shared by every page
│       ├── Navbar/
│       └── Footer/
│
├── data/
│   ├── site.js            Site-wide chrome: brand, navigation, footer
│   ├── homepageData.js    Home page content only
│   └── liveStandingsData.js  Live Standings page content only
│
├── hooks/
│   ├── useEscapeKey.js        Escape-to-close behaviour (mobile menu)
│   ├── usePrefersReducedMotion.js
│   ├── useReveal.js           Scroll reveals + viewport reporting
│   ├── useCountUp.js          One-shot numeric count-up
│   └── usePointerParallax.js  Pointer-driven --mx/--my offset for hero art
│
├── layouts/
│   └── MainLayout/        Skip link + Navbar + <main> + Footer (router layout route)
│
├── pages/
│   ├── Home/              Route-level composition of the home sections
│   └── LiveStandings/     Route-level composition of the standings page
│
├── styles/
│   ├── variables.css      Design tokens (:root custom properties)
│   ├── globals.css        Reset, element defaults, shared primitives
│   └── animations.css     The shared motion layer (reveals, floats, hovers)
│
├── App.jsx                Route table — maps paths to pages inside MainLayout
└── main.jsx               React entry point; router + global stylesheets
```

### Where things belong

| Concern | Location |
| --- | --- |
| A route/screen | `pages/<Name>/<Name>.jsx`, registered in `App.jsx` |
| Chrome shared by all pages | `layouts/`, `components/layout/` |
| Reusable UI used by 2+ pages | `components/common/` |
| UI used by one page only | `components/<page>/` next to its page |
| Copy and content | `data/` |
| Behaviour shared across components | `hooks/` |
| Design tokens / reset / shared CSS primitives | `styles/` |
| All motion (reveals, floats, hovers) | `styles/animations.css` + `hooks/useReveal.js` |
| Component styling | next to the component, e.g. `Hero/Hero.css` |

`src/services/` is reserved for future API modules and does not exist yet —
add it when the first real endpoint is integrated. Do not add placeholder
services, fake `fetch` calls or hard-coded API URLs. Page data modules are
written to mirror an API payload, so the swap is a change of import rather than
a change of component.

## Development

```bash
npm install       # install dependencies
npm run dev       # start the Vite dev server with HMR
npm run lint      # run ESLint over the project
npm run build     # produce a production build in dist/
npm run preview   # serve the production build locally
```

## Current Status

- The **homepage** and the **Live Standings page** (`/live-standings`) are
  implemented and share one Navbar, one Footer, one palette and one motion
  layer.
- **Routing** is React Router 7. `MainLayout` is the layout route, so the
  Navbar, skip link and Footer stay mounted across navigations. Adding a page
  means a `<Route>` in `App.jsx` plus a file in `pages/`.
- **The backend is not connected yet**; all content is static and lives in
  `src/data/`. The Live Standings "Last updated" value is a placeholder in
  `liveStandingsData.js` — it is not read from the browser clock, and no
  realtime connection exists.
- **Placeholder content** remains where official assets or copy do not exist
  yet: sponsor wordmarks, team portraits, standings team avatars, previous-event
  photography, and the Hurghada skyline. These are either `null` in the data
  (so no request is made for a missing file) or drawn as initials placeholders.
- Routes referenced by the chrome but not yet built (`/challenges`, `/about`)
  redirect to the homepage rather than 404.
- Planned pages: `/challenges`, `/challenges/:id`, `/about`, `/events`,
  `/events/:year`, `/sponsors`.