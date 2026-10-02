/* ==========================================================================
   Icon registry
   --------------------------------------------------------------------------
   Maps the string `icon` keys used in src/data/homepageData.js to their SVG
   components. Kept in its own module so the icon file only exports components
   (which keeps React Fast Refresh working in development).
   ========================================================================== */

import {
  ArrowRightIcon,
  GlobeIcon,
  InstagramIcon,
  LinkedInIcon,
  RocketIcon,
  SignalIcon,
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
};

export const socialIcons = {
  x: XIcon,
  linkedin: LinkedInIcon,
  instagram: InstagramIcon,
  youtube: YouTubeIcon,
};