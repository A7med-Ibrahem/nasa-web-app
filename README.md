# NASA Space Apps Hurghada

## Project Overview

Frontend for **NASA Space Apps Hurghada**, a local edition of the global NASA
Space Apps Challenge. Innovators, creators and problem-solvers use NASA open
data and space technology to work on real-world challenges.

This repository contains the React single-page application only. It talks to
the deployed ASP.NET Core backend over HTTP and SignalR; no server code or
database lives here.

Implemented route groups:

- **Public** — Home, Challenges list and details, Teams list and details,
  Sponsors, Season Media, Game Leaderboard and Live Standings.
- **Authentication** — one login page with separate staff and participant
  forms.
- **Judge** — dashboard and team evaluation, limited to the `Judge` role.
- **Participant** — dashboard, game and requests, limited to the
  `Participant` role.

## Tech Stack

- React 19
- React Router 7 (client-side routing)
- Vite 8
- JavaScript (JSX)
- Plain CSS with custom properties (no CSS framework)
- `@microsoft/signalr` for the Live Standings hub
- ESLint 10 (flat config, with `eslint-plugin-react-hooks` and
  `eslint-plugin-react-refresh`)

No state manager, data-fetching library or UI kit is installed.

## Backend and Environment

The app reads its API base from `VITE_API_BASE_URL`. The value must include
the versioned path (`/api/v1`); the client never appends it twice.

```env
VITE_API_BASE_URL=https://nasa-space-apps-hurghada.runasp.net/api/v1
```

- `.env.example` documents the variable.
- If no value is provided, `src/api/config.js` falls back to the same deployed
  backend, so a fresh clone runs without a local `.env` file.
- `.env` is git-ignored. Real credentials, passwords and access tokens are
  never committed; they exist only in the backend and in the browser session.
- SignalR hubs live at the origin, not under `/api/v1`, so hub URLs are built
  separately from API URLs.

All requests go through `src/api/client.js`, which adds JSON handling, the
Bearer token, the backend error envelope, and a distinct network-error state
(`status: 0`).

## Routes

| Route | Area | Notes |
| --- | --- | --- |
| `/` | Public | Home |
| `/challenges` | Public | Searchable challenge list |
| `/challenges/:challengeId` | Public | Challenge details |
| `/teams` | Public | Debounced server-side team search |
| `/teams/:teamId` | Public | Team profile, challenge, project and members |
| `/sponsors` | Public | Sponsors grouped by tier |
| `/season-media` | Public | Media grouped by season |
| `/leaderboard/game` | Public | Game leaderboard, refreshed by polling |
| `/live-standings` | Public | Judging standings with SignalR updates |
| `/login` | Auth | Staff and participant sign-in |
| `/judge` | Judge | Protected dashboard |
| `/judge/teams/:teamId/evaluate` | Judge | Protected evaluation form |
| `/participant/dashboard` | Participant | Protected dashboard |
| `/participant/game` | Participant | Questions and team standing |
| `/participant/requests` | Participant | Support requests |

`MainLayout` is a layout route, so the Navbar, skip link and Footer stay
mounted across public navigations. `/login` renders its own full-screen
experience outside that layout.

Unknown paths and `/about` currently redirect to the homepage rather than
showing a 404 page.

## Authentication and Roles

The backend is the only authority for identity and role.

- **Staff** sign in with `POST /auth/login/staff` using an identifier and
  password.
- **Participants** sign in with `POST /auth/login/participant` using a team
  username and password.
- A successful response supplies an access token and the account profile. The
  token is kept in the storage scope selected by "remember me".
- On reload, a stored token is verified with `GET /auth/me`. If the server is
  unreachable, the session is preserved and a retry panel is shown instead of
  signing the user out.
- `RequireAuth` redirects anonymous visitors to `/login` and shows an
  access-denied panel when an authenticated account lacks the required role.
- The Navbar reflects the session: signed-in users see their area (Judge
  Dashboard or My Team) and a sign-out action.

## Data Loading

Every API-backed block owns its request and renders four explicit states:
loading, error with Retry, empty, and ready. Public pages use
`src/hooks/useApiResource.js` (with `AbortController` and stale-response
protection) and the shared `DataState` component.

- API records are never duplicated as fixtures. Missing fields remove their
  block instead of being filled with placeholder data.
- API text is rendered as plain text. External links are only created for
  absolute `http(s)` URLs and open with `rel="noopener noreferrer"`.
- Images go through `src/utils/image.js`, falling back to initials or an icon
  when a logo or photo is missing or fails to decode.
- The Game Leaderboard has no SignalR feed: it refreshes every 20 seconds
  while the tab is visible, on window focus, and on demand. Live Standings uses
  the judging hub plus a polling fallback.

## Home Page Content

Static copy in `src/data/homepageData.js`:

- Hero
- About
- Current Event

Loaded from the API:

- Top Challenges — `GET /challenges`
- Previous Events — `GET /seasonmedia`
- Sponsors — `GET /sponsors`

The Core Team section is disabled by `SHOW_CORE_TEAM` because no public
core-team endpoint exists. The component and fixture are kept for when real
member data becomes available.

## Project Structure

```
src/
├── api/                     Endpoint modules grouped by resource
│   ├── client.js            fetch wrapper, Bearer auth, error envelope
│   ├── config.js            API base + URL builders
│   ├── auth.js              Staff/participant login, /auth/me
│   ├── challenges.js
│   ├── teams.js             Search, public detail, staff detail
│   ├── sponsors.js
│   ├── seasonMedia.js
│   ├── game.js              Questions, answers, game leaderboard
│   ├── judging.js           Criteria, scoring
│   ├── standings.js
│   └── requests.js
│
├── assets/
│   ├── images/              Section imagery
│   └── logos/               Brand lockup
│
├── auth/                    Auth context, token storage, role gate
│
├── components/
│   ├── common/              DataState, Icons, PageHero
│   ├── home/                Home-only sections
│   ├── challenges/          Challenge list, filters, hero
│   ├── challengeDetails/    Challenge profile blocks
│   ├── liveStandings/       Hero, table, rows, stats
│   ├── sponsors/            Tier rendering shared by Home and /sponsors
│   ├── seasonMedia/         Media gallery shared by Home and /season-media
│   ├── judge/               Judge dashboard blocks
│   └── layout/              Navbar and Footer
│
├── data/                    UI copy and static page content
│   ├── site.js              Brand, navigation, footer
│   ├── homepageData.js      Home copy
│   ├── challengesData.js    Challenges copy
│   ├── publicPagesData.js   Teams, Sponsors, Season Media, Game Leaderboard
│   ├── liveStandingsData.js Live Standings copy
│   ├── participantData.js   Participant area copy
│   ├── judgeDashboard.js    Judge area copy
│   └── loginData.js         Login copy
│
├── hooks/                   Shared behaviour
│   ├── useApiResource.js    One-resource fetch state
│   ├── useLiveStandings.js  SignalR feed + polling fallback
│   ├── useReveal.js         Scroll reveals
│   ├── useEscapeKey.js
│   ├── usePrefersReducedMotion.js
│   ├── useCountUp.js
│   └── usePointerParallax.js
│
├── layouts/
│   ├── MainLayout/          Skip link + Navbar + main + Footer
│   └── ParticipantLayout/   Participant area shell
│
├── pages/                   Route-level composition
│   ├── Home/
│   ├── Challenges/
│   ├── ChallengeDetails/
│   ├── Teams/
│   ├── TeamDetails/
│   ├── Sponsors/
│   ├── SeasonMedia/
│   ├── GameLeaderboard/
│   ├── LiveStandings/
│   ├── Login/
│   ├── JudgeDashboard/
│   ├── JudgeEvaluation/
│   ├── ParticipantDashboard/
│   ├── ParticipantGame/
│   └── ParticipantRequests/
│
├── realtime/                SignalR hub connection helpers
├── styles/                  Tokens, reset/primitives, motion layer
├── utils/                   Image, text and initials helpers
├── App.jsx                  Route table
└── main.jsx                 Entry point: router + global styles
```

### Where things belong

| Concern | Location |
| --- | --- |
| A route/screen | `pages/<Name>/<Name>.jsx`, registered in `App.jsx` |
| Chrome shared by all pages | `layouts/`, `components/layout/` |
| Reusable UI used by 2+ pages | `components/common/` or a shared feature folder |
| UI used by one page only | `components/<feature>/` |
| UI copy and static content | `data/` |
| Behaviour shared across components | `hooks/` |
| Endpoint definitions | `api/` |
| Design tokens / reset / primitives | `styles/` |
| Component styling | next to the component, e.g. `Teams/Teams.css` |

## Development

Requirements: Node.js with npm, and access to the backend.

```bash
npm install       # install dependencies
npm run dev       # start the Vite dev server with HMR
npm run lint      # run ESLint over the project
npm run build     # produce a production build in dist/
npm run preview   # serve the production build locally
```

The dev server and preview server print their local URL (Vite defaults to
`http://localhost:5173` and `http://localhost:4173`).

## Accessibility and Motion

- Every interactive element is keyboard reachable and uses visible focus
  styles.
- Tables have captions and scoped headers; the scrollable wrappers are labelled
  regions.
- Decorative images use empty alt text; meaningful images use the record's
  name.
- Layouts are checked down to 360 px wide without horizontal page overflow.
- Scroll reveals and hover lifts are disabled under
  `prefers-reduced-motion: reduce`.

## Current Status

- All public routes listed above are implemented.
- The judge and participant areas are implemented behind their role gates.
- Official assets and copy that do not exist yet are omitted rather than
  replaced with fabricated content.
- `/about` and unknown paths redirect to the homepage; no dedicated 404 or
  About page exists.
