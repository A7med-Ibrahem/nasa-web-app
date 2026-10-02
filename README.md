# NASA Space Apps Hurghada

## Project Overview

Frontend for **NASA Space Apps Hurghada**, a global hackathon where innovators,
creators and problem-solvers tackle real-world challenges using NASA open data
and space technology.

This is a static, single-page frontend built with React and Vite. The homepage
is implemented; additional pages (Challenges, Standings, Events, Sponsors, …)
are planned. There is **no backend yet** — all content currently comes from
static data modules, structured so each export can later be replaced by an API
response of identical shape.

## Tech Stack

- React 19
- Vite 8
- JavaScript (JSX)
- CSS (plain CSS with custom properties — no CSS framework)
- ESLint 10 (flat config, with `eslint-plugin-react-hooks` and
  `eslint-plugin-react-refresh`)

No router, state manager, data-fetching library or UI kit is installed. Page
routing is the first planned addition.

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
│   └── layout/            Page chrome shared by every page
│       ├── Navbar/
│       └── Footer/
│
├── data/
│   ├── site.js            Site-wide chrome: brand, navigation, footer
│   └── homepageData.js    Home page content only
│
├── hooks/
│   └── useEscapeKey.js    Escape-to-close behaviour (used by the mobile menu)
│
├── layouts/
│   └── MainLayout/        Skip link + Navbar + <main> + Footer
│
├── pages/
│   └── Home/              Route-level composition of the home sections
│
├── styles/
│   ├── variables.css      Design tokens (:root custom properties)
│   └── globals.css        Reset, element defaults, shared primitives
│
├── App.jsx                Composition point — selects the page inside MainLayout
└── main.jsx               React entry point; imports the global stylesheets
```

### Where things belong

| Concern | Location |
| --- | --- |
| A route/screen | `pages/<Name>/<Name>.jsx` |
| Chrome shared by all pages | `layouts/`, `components/layout/` |
| Reusable UI used by 2+ pages | `components/common/` |
| UI used by one page only | `components/<page>/` next to its page |
| Copy and content | `data/` |
| Behaviour shared across components | `hooks/` |
| Design tokens / reset / shared CSS primitives | `styles/` |
| Component styling | next to the component, e.g. `Hero/Hero.css` |

`src/services/` is reserved for future API modules and does not exist yet —
add it when the first real endpoint is integrated. Do not add placeholder
services, fake `fetch` calls or hard-coded API URLs.

## Development

```bash
npm install       # install dependencies
npm run dev       # start the Vite dev server with HMR
npm run lint      # run ESLint over the project
npm run build     # produce a production build in dist/
npm run preview   # serve the production build locally
```

## Current Status

- The **homepage is implemented** and approved.
- The **backend is not connected yet**; all content is static and lives in
  `src/data/`.
- **No router is installed.** `App.jsx` renders `Home` inside `MainLayout`;
  adding React Router later only requires changing `App.jsx` and adding files
  under `pages/`.
- **Placeholder content** remains where official assets or copy do not exist
  yet: sponsor wordmarks, team avatars, and previous-event photography. These
  are marked `null` in the data so no request is made for missing files.
- Planned pages: `/challenges`, `/challenges/:id`, `/standings`, `/about`,
  `/events`, `/events/:year`, `/sponsors`. Navigation already points at those
  paths.