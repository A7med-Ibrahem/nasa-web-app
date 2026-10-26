import { useRef } from "react";
import "./PageHero.css";

import heroEarthImage from "../../../assets/images/hero-earth.jpeg";
import { useRevealGroup } from "../../../hooks/useReveal";

/**
 * Shared page hero for the public secondary pages.
 *
 * The same composition as the Challenges and Live Standings heroes — copy on
 * the left, Earth art bleeding off the right, one dark surface — with the copy
 * supplied by the page's data module. The Earth is clipped by the section's
 * `overflow: hidden`, so it can never widen the document.
 */
export default function PageHero({
  eyebrow,
  title,
  description,
  titleId = "page-hero-title",
}) {
  const sectionRef = useRef(null);

  useRevealGroup(sectionRef, { stagger: 90 });

  return (
    <section
      className="page-hero on-dark"
      ref={sectionRef}
      aria-labelledby={titleId}
    >
      <div
        className="page-hero-media"
        aria-hidden="true"
        data-reveal-item
        data-reveal-variant="fade"
        style={{ "--reveal-index": 3 }}
      >
        <img
          className="page-hero-media-image"
          src={heroEarthImage}
          alt=""
          decoding="async"
          fetchPriority="high"
        />
      </div>
      <div className="page-hero-scrim" aria-hidden="true" />

      <div className="container page-hero-inner">
        <div className="page-hero-content">
          {eyebrow ? (
            <p className="eyebrow page-hero-eyebrow" data-reveal-item>
              {eyebrow}
            </p>
          ) : null}

          <h1 id={titleId} className="page-hero-title" data-reveal-item>
            {title}
          </h1>

          {description ? (
            <p className="page-hero-description" data-reveal-item>
              {description}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
