import { useState } from "react";
import { Link } from "react-router-dom";
import "./ChallengeCard.css";

import { PlanetIcon } from "../../common/Icons/Icons";
import { toExcerpt } from "../../../utils/apiContent";
import { toImageSrc } from "../../../utils/image";

const EXCERPT_LENGTH = 160;

/**
 * One challenge in the grid — the card *is* the link to its details page.
 *
 * Presentational: every value comes from the API record
 * (`challengeId`, `title`, `description`, `source`, `season`, `image`).
 * A missing field simply removes its block; nothing is filled from a fixture.
 */
export default function ChallengeCard({ challenge }) {
  const { challengeId, title, description, source, season, image } = challenge;
  const [imageFailed, setImageFailed] = useState(false);

  const imageSrc = toImageSrc(image);
  const excerpt = toExcerpt(description, EXCERPT_LENGTH);
  const hasMeta = Boolean(source) || Boolean(season);
  const headingId = challengeId ? `challenge-title-${challengeId}` : undefined;

  return (
    <li className="challenge-tile">
      <Link className="challenge-tile-link" to={`/challenges/${challengeId}`}>
        <article aria-labelledby={headingId}>
          <div className="challenge-tile-media">
            {imageSrc && !imageFailed ? (
              <img
                className="challenge-tile-image"
                src={imageSrc}
                alt=""
                loading="lazy"
                decoding="async"
                onError={() => setImageFailed(true)}
              />
            ) : (
              <div className="challenge-tile-placeholder" aria-hidden="true">
                <PlanetIcon size={34} />
              </div>
            )}
          </div>

          <div className="challenge-tile-body">
            <h3 className="challenge-tile-title" id={headingId}>
              {title}
            </h3>

            {excerpt ? (
              <p className="challenge-tile-description">{excerpt}</p>
            ) : null}
          </div>

          {hasMeta ? (
            <div className="challenge-tile-footer">
              {source ? (
                <span className="challenge-tile-badge">{source}</span>
              ) : null}
              {season ? (
                <span className="challenge-tile-badge challenge-tile-badge--season">
                  {season}
                </span>
              ) : null}
            </div>
          ) : null}
        </article>
      </Link>
    </li>
  );
}
