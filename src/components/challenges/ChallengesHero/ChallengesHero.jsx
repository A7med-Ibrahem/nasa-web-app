import { useRef } from "react";
import "./ChallengesHero.css";

import { challengesHero } from "../../../data/challengesData";
import { useRevealGroup } from "../../../hooks/useReveal";

/**
 * Challenges hero (`/challenges`).
 *
 * Deliberately the same composition and token set as the homepage hero and
 * the Live Standings hero — copy on the left, oversized Earth art bleeding off
 * the right edge, the same `data-reveal-item` contract — but shorter, because
 * this page is a discovery surface rather than a marketing stage. The Earth is
 * clipped by the section's `overflow: hidden`, which is what lets it reach
 * past the viewport edge without widening the document.
 *
 * Reuses the existing hero-earth artwork instead of shipping a second Earth
 * image; a future backend changes no part of this component.
 */
export default function ChallengesHero() {
  const sectionRef = useRef(null);

  // Copy leads; the absolutely positioned Earth is last, so it carries an
  // explicit index rather than its DOM position.
  useRevealGroup(sectionRef, { stagger: 90 });

  return (
    <section
      className="challenges-hero on-dark"
      ref={sectionRef}
      aria-labelledby="challenges-title"
    >
      {/* Decorative: the Earth is atmospheric background art, the message is
          carried by the adjacent copy. */}
      <div
        className="challenges-hero-media"
        aria-hidden="true"
        data-reveal-item
        data-reveal-variant="fade"
        style={{ "--reveal-index": 3 }}
      >
        <img
          className="challenges-hero-media-image"
          src={challengesHero.image.src}
          alt={challengesHero.image.alt}
          decoding="async"
          fetchPriority="high"
        />
      </div>
      <div className="challenges-hero-scrim" aria-hidden="true" />

      <div className="container challenges-hero-inner">
        <div className="challenges-hero-content">
          <p className="eyebrow challenges-hero-eyebrow" data-reveal-item>
            {challengesHero.eyebrow}
          </p>

          <h1 id="challenges-title" className="challenges-hero-title" data-reveal-item>
            {challengesHero.title}
          </h1>

          <p className="challenges-hero-description" data-reveal-item>
            {challengesHero.description}
          </p>
        </div>
      </div>
    </section>
  );
}
