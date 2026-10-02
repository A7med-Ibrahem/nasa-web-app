import { useRef } from "react";
import "./LiveStandingsHero.css";

import { liveStandingsHero } from "../../../data/liveStandingsData";
import { useRevealGroup } from "../../../hooks/useReveal";
import usePointerParallax from "../../../hooks/usePointerParallax";

/**
 * Live Standings hero.
 *
 * Reuses the homepage hero's composition, palette and motion system — the same
 * `data-reveal-item` contract, the same `hero-float` keyframes and the same
 * `--mx` / `--my` parallax hook — so the two pages share one visual language
 * without a second animation system.
 */
export default function LiveStandingsHero() {
  const sectionRef = useRef(null);

  // Badge -> heading -> description -> Earth. The Earth is last, which is why
  // it needs an explicit index: it is absolutely positioned and comes first in
  // the DOM.
  useRevealGroup(sectionRef, { stagger: 100, rootMargin: "0px" });
  usePointerParallax(sectionRef, { max: 8 });

  return (
    <section
      className="standings-hero on-dark"
      ref={sectionRef}
      aria-labelledby="live-standings-title"
    >
      {/* Decorative background art; the message is carried by the copy. */}
      <div
        className="standings-hero-media"
        aria-hidden="true"
        data-reveal-item
        data-reveal-variant="fade"
        style={{ "--reveal-index": 3 }}
      >
        <img
          className="standings-hero-media-image"
          src={liveStandingsHero.image.src}
          alt={liveStandingsHero.image.alt}
          decoding="async"
          fetchPriority="high"
        />
      </div>
      <div className="standings-hero-scrim" aria-hidden="true" />

      <div className="container standings-hero-inner">
        <div className="standings-hero-content">
          <p className="standings-hero-badge" data-reveal-item>
            <span className="standings-hero-badge-dot" aria-hidden="true" />
            <span className="standings-hero-badge-label">
              {liveStandingsHero.badge.label}
            </span>
            <span className="standings-hero-badge-rule" aria-hidden="true" />
            <span className="standings-hero-badge-detail">
              {liveStandingsHero.badge.detail}
            </span>
          </p>

          <h1 id="live-standings-title" className="standings-hero-title" data-reveal-item>
            {liveStandingsHero.title}
          </h1>

          <p className="standings-hero-description" data-reveal-item>
            {liveStandingsHero.description}
          </p>
        </div>
      </div>
    </section>
  );
}