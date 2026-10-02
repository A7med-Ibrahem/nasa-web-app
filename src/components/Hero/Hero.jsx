import "./Hero.css";

import heroEarthImage from "../../assets/images/hero-earth.jpeg";
import { hero, site } from "../../data/homepageData";
import { actionIcons } from "../Icons/iconRegistry";

const PrimaryIcon = actionIcons[hero.primaryAction.icon];
const SecondaryIcon = actionIcons[hero.secondaryAction.icon];

export default function Hero() {
  return (
    <section className="hero on-dark" aria-labelledby="hero-title">
      {/* Decorative: the Earth is atmospheric background art, the message is
          carried by the adjacent copy. */}
      <div className="hero-media" aria-hidden="true">
        <img
          className="hero-media-image"
          src={heroEarthImage}
          alt=""
          decoding="async"
          fetchPriority="high"
        />
      </div>
      <div className="hero-scrim" aria-hidden="true" />

      <div className="container hero-inner">
        <div className="hero-content">
          <p className="hero-brand" aria-label={site.name}>
            <span className="hero-brand-primary">{hero.brand.primary}</span>
            <span className="hero-brand-secondary">{hero.brand.secondary}</span>
            <span className="hero-brand-city">{hero.brand.city}</span>
          </p>

          <p className="hero-tagline">
            <span className="hero-tagline-rule" aria-hidden="true" />
            {hero.tagline}
          </p>

          <h1 id="hero-title" className="hero-title">
            {hero.titleLines[0]}
            <br />
            {hero.titleLines[1]}
          </h1>

          <p className="hero-description">{hero.description}</p>

          <div className="hero-actions">
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