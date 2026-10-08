import { Link } from "react-router-dom";
import "./ChallengeCard.css";

import { site } from "../../../data/site";
import { difficultyLabels } from "../../../data/challengesData";
import { challengeIcons } from "../../common/Icons/iconRegistry";

/**
 * One challenge in the grid — the card *is* the link to its details page.
 *
 * Fully presentational: it receives a single `challenge` record through props
 * and renders whatever that record contains, so the same card serves today's
 * static data and a future API response with an identical shape (title,
 * description, category, image, season, difficulty, slug, organizer) without
 * any JSX changing. Nothing here is challenge-specific.
 *
 * The record renders inside a list item + `<article>` with a heading, and the
 * whole card wraps in a router `Link` to /challenges/:slug — client
 * navigation, no `window.location`, and `slug` is already part of the data.
 * An `<article>` inside an `<a>` is valid HTML5 as long as the anchor holds no
 * interactive descendants, which it does not.
 */
export default function ChallengeCard({ challenge }) {
  const {
    id,
    slug,
    title,
    category,
    categoryLabel,
    categoryIcon,
    description,
    image,
    imageAlt,
    organizer,
    season,
    difficulty,
  } = challenge;

  const CategoryIcon = challengeIcons[categoryIcon];
  const DifficultyIcon = challengeIcons.bars;

  return (
    <li className="challenge-tile">
      <Link className="challenge-tile-link" to={`/challenges/${slug}`}>
        <article aria-labelledby={`challenge-title-${id}`}>
          <div className="challenge-tile-media">
            <img
              className="challenge-tile-image"
              src={image}
              alt={imageAlt}
              loading="lazy"
              decoding="async"
            />

            <span
              className={`challenge-tile-badge challenge-tile-badge--${category}`}
            >
              {CategoryIcon ? <CategoryIcon size={13} /> : null}
              <span>{categoryLabel}</span>
            </span>
          </div>

          <div className="challenge-tile-body">
            <h3 className="challenge-tile-title" id={`challenge-title-${id}`}>
              {title}
            </h3>

            <p className="challenge-tile-description">{description}</p>
          </div>

          <div className="challenge-tile-footer">
            <p className="challenge-tile-meta">
              {/*
                The globe/orbit mark cropped out of the site logo PNG — the
                crop geometry is derived in ChallengeCard.css. Decorative: the
                wordmark beside it carries the name.
              */}
              <span className="challenge-tile-logo" aria-hidden="true">
                <img src={site.logo} alt="" decoding="async" />
              </span>
              <span className="challenge-tile-organizer">{organizer}</span>
              <span className="challenge-tile-divider" aria-hidden="true" />
              <span className="challenge-tile-season">{season}</span>
            </p>

            <p
              className={`challenge-tile-difficulty challenge-tile-difficulty--${difficulty}`}
            >
              {DifficultyIcon ? <DifficultyIcon size={14} /> : null}
              <span>{difficultyLabels[difficulty]}</span>
            </p>
          </div>
        </article>
      </Link>
    </li>
  );
}
