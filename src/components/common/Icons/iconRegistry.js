/* ==========================================================================
   Icon registry
   --------------------------------------------------------------------------
   Maps the string `icon` keys used in src/data/*.js to their SVG components.
   Kept in its own module so the icon file only exports components (which keeps
   React Fast Refresh working in development).
   ========================================================================== */

import {
  ArrowLeftIcon,
  ArrowRightIcon,
  BarsIcon,
  ChartIcon,
  CrownIcon,
  ExternalLinkIcon,
  GearIcon,
  GlobeIcon,
  GridIcon,
  HeartIcon,
  InstagramIcon,
  LeafIcon,
  LightbulbIcon,
  LinkedInIcon,
  PlanetIcon,
  RocketIcon,
  ScaleIcon,
  SearchIcon,
  SignalIcon,
  TeamIcon,
  TrendDownIcon,
  TrendUpIcon,
  UsersIcon,
  XIcon,
  YouTubeIcon,
} from "./Icons";

export const actionIcons = {
  arrow: ArrowRightIcon,
  arrowLeft: ArrowLeftIcon,
  external: ExternalLinkIcon,
  signal: SignalIcon,
};

/* Category icons, difficulty indicator and the search glyph, keyed by the
   string `icon` / `categoryIcon` values in data/challengesData.js. */
export const challengeIcons = {
  grid: GridIcon,
  leaf: LeafIcon,
  planet: PlanetIcon,
  gear: GearIcon,
  heart: HeartIcon,
  search: SearchIcon,
  bars: BarsIcon,
};

export const statisticIcons = {
  globe: GlobeIcon,
  users: UsersIcon,
  rocket: RocketIcon,
  team: TeamIcon,
  chart: ChartIcon,
};

export const movementIcons = {
  up: TrendUpIcon,
  down: TrendDownIcon,
};

export const standingsIcons = {
  crown: CrownIcon,
};

export const socialIcons = {
  x: XIcon,
  linkedin: LinkedInIcon,
  instagram: InstagramIcon,
  youtube: YouTubeIcon,
};

/* Feature icons for the login page, keyed by the string `icon` values in
   data/loginData.js. Field-level glyphs (mail, lock, eye) are fixed to one
   input each, so LoginForm imports those directly from Icons.jsx. */
export const loginIcons = {
  scale: ScaleIcon,
  bulb: LightbulbIcon,
  users: UsersIcon,
};