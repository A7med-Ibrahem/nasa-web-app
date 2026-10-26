import { useEffect, useRef } from "react";
import "./JudgeDashboard.css";

import { judgeDashboard } from "../../data/judgeDashboard";
import { site } from "../../data/site";
import { useRevealGroup } from "../../hooks/useReveal";

import JudgeHero from "../../components/judge/JudgeHero/JudgeHero";
import TeamExplorer from "../../components/judge/TeamExplorer/TeamExplorer";

/**
 * Judge Dashboard page (`/judge`).
 *
 * Composition only, exactly like pages/Home and pages/LiveStandings: this file
 * decides which blocks appear and in which order and owns the document title;
 * every block owns its own markup, styling and data fetching. Navbar and
 * Footer come from MainLayout, and the route itself is wrapped in
 * RequireAuth(requiredRole="Judge"), so this page never has to re-check the
 * session.
 *
 * There is no dashboard data module: teams, members, challenges and criteria
 * are all live API responses, so hardcoding any of them here would be a bug.
 */
export default function JudgeDashboard() {
  const pageRef = useRef(null);

  useRevealGroup(pageRef, { stagger: 90, rootMargin: "0px 0px -6% 0px" });

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    document.title = `${judgeDashboard.hero.title} — ${site.name}`;
  }, []);

  return (
    <div className="judge-dashboard" ref={pageRef}>
      <JudgeHero />
      <TeamExplorer />
    </div>
  );
}
