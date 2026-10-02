import { useRef } from "react";
import "./Hero.css";

import { hero } from "../../../data/homepageData";
import { site } from "../../../data/site";
import { actionIcons } from "../../common/Icons/iconRegistry";
import { useRevealGroup } from "../../../hooks/useReveal";
import usePointerParallax from "../../../hooks/usePointerParallax";

const PrimaryIcon = actionIcons[hero.primaryAction.icon];
const SecondaryIcon = actionIcons[hero.secondaryAction.icon];

export default function Hero() {
  const sectionRef = useRef(null);

  // Copy leads, artwork lands last: an explicit index overrides DOM order,
  // which would otherwise reveal the absolute-positioned media first.
  useRevealGroup(sectionRef, { stagger: 90 });
  usePointerParallax(sectionRef, { max: 8 });

  return (
    <section className="hero on-dark" ref={sectionRef} aria-labelledby="hero-title">
      {/* Decorative: the Earth is atmospheric background art, the message is
          carried by the adjacent copy. */}
      <div
        className="hero-media"
        aria-hidden="true"
        data-reveal-item
        data-reveal-variant="fade"
        style={{ "--reveal-index": 5 }}
      >
        <img
          className="hero-media-image"
          src={hero.image.src}
          alt={hero.image.alt}
          decoding="async"
          fetchPriority="high"
        />
      </div>
      <div className="hero-scrim" aria-hidden="true" />

      <div className="container hero-inner">
        <div className="hero-content">
          <p className="hero-brand" data-reveal-item aria-label={site.name}>
            <span className="hero-brand-primary">{hero.brand.primary}</span>
            <span className="hero-brand-secondary">{hero.brand.secondary}</span>
            <span className="hero-brand-city">{hero.brand.city}</span>
          </p>

          <p className="hero-tagline" data-reveal-item>
            <span className="hero-tagline-rule" aria-hidden="true" />
            {hero.tagline}
          </p>

          <h1 id="hero-title" className="hero-title" data-reveal-item>
            {hero.titleLines[0]}
            <br />
            {hero.titleLines[1]}
          </h1>

          <p className="hero-description" data-reveal-item>{hero.description}</p>

          <div className="hero-actions" data-reveal-item>
            <a href={hero.primaryAction.href} className="btn btn--primary">
              {hero.primaryAction.label}
              <PrimaryIcon />
            </a>

            <a href={hero.secondaryAction.href} className="btn btn--ghost-dark">
              <SecondaryIcon />
              {hero.secondaryAction.label}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}