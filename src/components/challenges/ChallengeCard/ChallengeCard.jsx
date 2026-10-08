import "./ChallengeCard.css";

import { site } from "../../../data/site";
import { difficultyLabels } from "../../../data/challengesData";
import { challengeIcons } from "../../common/Icons/iconRegistry";

/**
 * One challenge in the grid.
 *
 * Fully presentational: it receives a single `challenge` record through props
 * and renders whatever that record contains, so the same card serves today's
 * static data and a future API response with an identical shape (title,
 * description, category, image, season, difficulty, slug, organizer) without
 * any JSX changing. Nothing here is challenge-specific.
 *
 * The record is rendered inside a list item + `<article>` with a heading, so
 * the grid is a real list of labelled articles rather than a row of clickable
 * divs. A future /challenges/:slug route can wrap the card in a Link without
 * restructuring it — `slug` is already part of the data.
 */
export default function ChallengeCard({ challenge }) {
  const {
    id,
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
      <article aria-labelledby={`challenge-title-${id}`}>
        <div className="challenge-tile-media">
          <img
            className="challenge-tile-image"
            src={image}
            alt={imageAlt}
            loading="lazy"
            decoding="async"
          />

          <span className={`challenge-tile-badge challenge-tile-badge--${category}`}>
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

          <p className={`challenge-tile-difficulty challenge-tile-difficulty--${difficulty}`}>
            {DifficultyIcon ? <DifficultyIcon size={14} /> : null}
            <span>{difficultyLabels[difficulty]}</span>
          </p>
        </div>
      </article>
    </li>
  );
}
