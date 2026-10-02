/* ==========================================================================
   Icon registry
   --------------------------------------------------------------------------
   Maps the string `icon` keys used in src/data/*.js to their SVG components.
   Kept in its own module so the icon file only exports components (which keeps
   React Fast Refresh working in development).
   ========================================================================== */

import {
  ArrowRightIcon,
  ChartIcon,
  CrownIcon,
  GlobeIcon,
  InstagramIcon,
  LinkedInIcon,
  RocketIcon,
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