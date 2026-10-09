import { useRef } from "react";
import { Link } from "react-router-dom";
import "./ChallengeHero.css";

import { challengeDetailsPage } from "../../../data/challengesData";
import { ArrowLeftIcon, CalendarIcon } from "../../common/Icons/Icons";
import { challengeIcons } from "../../common/Icons/iconRegistry";
import { useRevealGroup } from "../../../hooks/useReveal";

/**
 * Challenge hero (`/challenges/:slug`).
 *
 * Breadcrumb (Home / Challenges / current title), event eyebrow, category
 * badge, the one `<h1>` on the page, the challenge's main objective as the
 * prominent introduction, its domain tags, a season pill, a back button and
 * the challenge's own image on the right.
 *
 * Same dark-stage composition as the other two heroes in the project — copy
 * left, artwork right — but the artwork here is the challenge photo from the
 * record rather than decorative Earth art, so it is a framed figure instead
 * of a bleeding background.
 *
 * Every string and value comes from props or data/challengesData.js; nothing
 * is challenge-specific. A record without an `image` renders a clean
 * category-icon fallback instead of a broken frame.
 */
export default function ChallengeHero({ challenge }) {
  const sectionRef = useRef(null);
  const {
    title,
    category,
    categoryLabel,
    categoryIcon,
    domains,
    mainObjective,
    image,
    imageAlt,
    season,
  } = challenge;

  const { eyebrow, breadcrumbLabel, parent, labels, back } =
    challengeDetailsPage.hero;
  const CategoryIcon = challengeIcons[categoryIcon];
  const domainTags = Array.isArray(domains) ? domains : [];

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
            inside the current item so the list holds only real entries. */}
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

            {/*
              Category pill: same identification treatment as the card badge
              (accent border + icon, dark fill) at hero scale, so the two
              screens read as one system.
            */}
            <p
              className={`challenge-hero-badge challenge-hero-badge--${category}`}
              data-reveal-item
            >
              {CategoryIcon ? <CategoryIcon size={14} /> : null}
              <span>{categoryLabel}</span>
            </p>

            <h1 id="challenge-details-title" className="challenge-hero-title" data-reveal-item>
              {title}
            </h1>

            {/*
              The full main objective is the hero's introduction: it is the
              official, complete statement of what the challenge asks for.
            */}
            <p className="challenge-hero-description" data-reveal-item>
              {mainObjective}
            </p>

            {domainTags.length > 0 ? (
              <ul className="challenge-hero-tags" data-reveal-item>
                {domainTags.map((tag) => (
                  <li className="challenge-hero-tag" key={tag}>
                    {tag}
                  </li>
                ))}
              </ul>
            ) : null}

            {/*
              Metadata badges. Season is the only record-derived pill now —
              the official 2026 data defines no difficulty rating.
            */}
            <p className="challenge-hero-meta" data-reveal-item>
              <span className="challenge-hero-pill">
                <CalendarIcon size={14} />
                <span>{season}</span>
              </span>
            </p>

            <p className="challenge-hero-back" data-reveal-item>
              <Link className="btn btn--ghost-dark challenge-hero-back-link" to={back.href}>
                <ArrowLeftIcon size={16} />
                {back.label}
              </Link>
            </p>
          </div>

          <div className="challenge-hero-media" data-reveal-item data-reveal-variant="fade">
            {image ? (
              <img
                className="challenge-hero-image"
                src={image}
                alt={imageAlt}
                decoding="async"
                fetchPriority="high"
              />
            ) : (
              /* No image in the record: a quiet category panel keeps the
                 frame, the grid and the page geometry intact. Decorative —
                 the category name is already rendered in the copy beside it. */
              <div className="challenge-hero-media-fallback" aria-hidden="true">
                {CategoryIcon ? <CategoryIcon size={56} /> : null}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
