/* ==========================================================================
   Icon registry
   --------------------------------------------------------------------------
   Maps the string `icon` keys used in src/data/*.js to their SVG components.
   Kept in its own module so the icon file only exports components (which keeps
   React Fast Refresh working in development).
   ========================================================================== */

import {
  ArrowRightIcon,
  BarsIcon,
  ChartIcon,
  CrownIcon,
  GearIcon,
  GlobeIcon,
  GridIcon,
  HeartIcon,
  InstagramIcon,
  LeafIcon,
  LinkedInIcon,
  PlanetIcon,
  RocketIcon,
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