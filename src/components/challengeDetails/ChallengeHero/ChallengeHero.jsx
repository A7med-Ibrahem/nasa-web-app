import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./ChallengeHero.css";

import { challengeDetailsPage } from "../../../data/challengesData";
import { ArrowLeftIcon, CalendarIcon, PlanetIcon } from "../../common/Icons/Icons";
import { toExcerpt } from "../../../utils/apiContent";
import { toImageSrc } from "../../../utils/image";
import { useRevealGroup } from "../../../hooks/useReveal";

const HERO_EXCERPT_LENGTH = 220;

/**
 * Challenge hero (`/challenges/:challengeId`).
 *
 * Breadcrumb, event eyebrow, source badge, the one `<h1>` on the page, a short
 * introduction drawn from the record, its season pill, a back button and the
 * challenge image. Every string and value comes from props or
 * data/challengesData.js; nothing is challenge-specific.
 *
 * The API has no alt text for the image, so it is treated as decorative. A
 * record without a usable image (or whose image fails to load) renders a quiet
 * planet panel so the page geometry stays intact.
 */
export default function ChallengeHero({ challenge }) {
  const sectionRef = useRef(null);
  const [imageFailed, setImageFailed] = useState(false);
  const { title, description, source, season, image } = challenge;

  const { eyebrow, breadcrumbLabel, parent, labels, back } =
    challengeDetailsPage.hero;
  const imageSrc = toImageSrc(image);
  const excerpt = toExcerpt(description, HERO_EXCERPT_LENGTH);

  // Copy leads and the figure trails, so DOM order is reveal order and no
  // explicit --reveal-index is needed.
  useRevealGroup(sectionRef, { stagger: 90 });

  return (
    <section
      className="challenge-hero on-dark"
      ref={sectionRef}
      aria-labelledby="challenge-details-title"
    >
      <div className="container">
        {/* Semantic breadcrumb: a list of links, current page marked with
            aria-current instead of being a dead link. The separator lives
            inside each later item so the list holds only real entries. */}
        <nav className="challenge-breadcrumb" aria-label={breadcrumbLabel} data-reveal-item>
          <ol className="challenge-breadcrumb-list">
            <li>
              <Link className="challenge-breadcrumb-link" to="/">
                {labels.home}
              </Link>
            </li>
            <li>
              <span className="challenge-breadcrumb-separator" aria-hidden="true">
                /
              </span>
              <Link className="challenge-breadcrumb-link" to={parent.href}>
                {parent.label}
              </Link>
            </li>
            <li className="challenge-breadcrumb-current">
              <span className="challenge-breadcrumb-separator" aria-hidden="true">
                /
              </span>
              <span aria-current="page">{title}</span>
            </li>
          </ol>
        </nav>

        <div className="challenge-hero-inner">
          <div className="challenge-hero-content">
            <p className="eyebrow challenge-hero-eyebrow" data-reveal-item>
              {eyebrow}
            </p>

            {source ? (
              <p className="challenge-hero-badge" data-reveal-item>
                <PlanetIcon size={14} />
                <span>{source}</span>
              </p>
            ) : null}

            <h1 id="challenge-details-title" className="challenge-hero-title" data-reveal-item>
              {title}
            </h1>

            {excerpt ? (
              <p className="challenge-hero-description" data-reveal-item>
                {excerpt}
              </p>
            ) : null}

            {season ? (
              <p className="challenge-hero-meta" data-reveal-item>
                <span className="challenge-hero-pill">
                  <CalendarIcon size={14} />
                  <span>{season}</span>
                </span>
              </p>
            ) : null}

            <p className="challenge-hero-back" data-reveal-item>
              <Link className="btn btn--ghost-dark challenge-hero-back-link" to={back.href}>
                <ArrowLeftIcon size={16} />
                {back.label}
              </Link>
            </p>
          </div>

          <div className="challenge-hero-media" data-reveal-item data-reveal-variant="fade">
            {imageSrc && !imageFailed ? (
              <img
                className="challenge-hero-image"
                src={imageSrc}
                alt=""
                decoding="async"
                fetchPriority="high"
                onError={() => setImageFailed(true)}
              />
            ) : (
              <div className="challenge-hero-media-fallback" aria-hidden="true">
                <PlanetIcon size={56} />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
