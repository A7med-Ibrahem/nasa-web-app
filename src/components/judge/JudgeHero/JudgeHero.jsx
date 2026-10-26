import { useRef } from "react";
import "./JudgeHero.css";

import { useAuth } from "../../../auth/useAuth";
import { judgeDashboard } from "../../../data/judgeDashboard";
import { useRevealGroup } from "../../../hooks/useReveal";
import usePointerParallax from "../../../hooks/usePointerParallax";

/**
 * Judge Dashboard hero.
 *
 * Same composition, palette and motion contract as the homepage and Live
 * Standings heroes — `data-reveal-item` cascade, the shared `hero-float`
 * keyframes and the `--mx` / `--my` parallax hook — so the judge area reads as
 * part of this site rather than a bolted-on admin panel.
 *
 * The space atmosphere is pure CSS (gradients plus a starfield built from
 * radial-gradients): no external image URL can 404 the hero, and nothing here
 * depends on an asset that may not exist.
 *
 * The judge's name comes from the authenticated session only. Nothing about
 * the visitor is hardcoded.
 */
export default function JudgeHero() {
  const sectionRef = useRef(null);

  const { user } = useAuth();

  useRevealGroup(sectionRef, { stagger: 100, rootMargin: "0px" });
  usePointerParallax(sectionRef, { max: 6 });

  const { hero } = judgeDashboard;

  /* The backend's own name for this account. `/auth/me` may return an empty
     string, in which case the username is the next best identifier — and if
     neither exists the row is simply not rendered, rather than inventing a
     name. */
  const displayName = (user?.name || user?.username || "").trim();

  return (
    <section
      className="judge-hero on-dark"
      ref={sectionRef}
      aria-labelledby="judge-dashboard-title"
    >
      <div className="judge-hero-starfield" aria-hidden="true" />
      <div className="judge-hero-glow" aria-hidden="true" />
      <div className="judge-hero-scrim" aria-hidden="true" />

      <div className="container judge-hero-inner">
        <div className="judge-hero-content">
          <p className="judge-hero-badge" data-reveal-item>
            <span className="judge-hero-badge-dot" aria-hidden="true" />
            <span className="judge-hero-badge-label">{hero.eyebrow}</span>
            <span className="judge-hero-badge-rule" aria-hidden="true" />
            <span className="judge-hero-badge-detail">{hero.roleBadge}</span>
          </p>

          <h1 id="judge-dashboard-title" className="judge-hero-title" data-reveal-item>
            {hero.title}
          </h1>

          <p className="judge-hero-description" data-reveal-item>
            {hero.description}
          </p>

          {/* Rendered by RequireAuth before we ever get here, so the session
              (and therefore the name) is already verified. The avatar is
              initials derived from the returned name — no invented photo. */}
          {displayName && (
            <p className="judge-hero-session" data-reveal-item data-reveal-variant="fade">
              <span className="judge-hero-session-avatar" aria-hidden="true">
                {displayName.slice(0, 1).toUpperCase()}
              </span>
              <span className="judge-hero-session-text">
                <span className="judge-hero-session-label">{hero.sessionLabel}</span>
                <span className="judge-hero-session-name">{displayName}</span>
              </span>
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
