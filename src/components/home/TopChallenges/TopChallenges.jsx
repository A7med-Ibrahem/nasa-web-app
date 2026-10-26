import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./TopChallenges.css";

import { challenges } from "../../../data/homepageData";
import DataState from "../../common/DataState/DataState";
import { ArrowRightIcon, PlanetIcon } from "../../common/Icons/Icons";
import { actionIcons } from "../../common/Icons/iconRegistry";
import { useRevealGroup } from "../../../hooks/useReveal";
import { toExcerpt } from "../../../utils/apiContent";
import { toImageSrc } from "../../../utils/image";

const HeaderActionIcon = actionIcons[challenges.action.icon];

/**
 * One challenge in the homepage rail.
 *
 * Presentational: every value comes from the API record, and nothing is filled
 * from a fixture when a field is missing.
 */
function ChallengeCard({ challenge }) {
  const { challengeId, title, description, source, season, image } = challenge;
  const [imageFailed, setImageFailed] = useState(false);

  const imageSrc = toImageSrc(image);
  const excerpt = toExcerpt(description, challenges.excerptLength);
  const hasMeta = Boolean(source) || Boolean(season);
  const headingId = challengeId ? `home-challenge-title-${challengeId}` : undefined;
  const href = challengeId ? `/challenges/${challengeId}` : "/challenges";

  return (
    <li className="challenge-card" data-reveal-item>
      {/* The whole card is the link to its details route. */}
      <Link className="challenge-card-link" to={href}>
        <article aria-labelledby={headingId}>
          <div className="challenge-media">
            {imageSrc && !imageFailed ? (
              <img
                className="challenge-image"
                src={imageSrc}
                alt=""
                loading="lazy"
                decoding="async"
                onError={() => setImageFailed(true)}
              />
            ) : (
              <div className="challenge-media-placeholder" aria-hidden="true">
                <PlanetIcon size={34} />
              </div>
            )}
          </div>

          <div className="challenge-body">
            <h3 className="challenge-title" id={headingId}>
              {title}
            </h3>

            {excerpt ? (
              <p className="challenge-description">{excerpt}</p>
            ) : null}

            {hasMeta ? (
              <ul className="challenge-meta">
                {source ? (
                  <li className="challenge-badge">{source}</li>
                ) : null}
                {season ? (
                  <li className="challenge-badge challenge-badge--season">
                    {season}
                  </li>
                ) : null}
              </ul>
            ) : null}

            <span className="challenge-arrow">
              <span>{challenges.cardAction}</span>
              <ArrowRightIcon size={16} />
            </span>
          </div>
        </article>
      </Link>
    </li>
  );
}

/**
 * Top challenges section (GET /challenges).
 *
 * The header is always present; the state block replaces the rail while the
 * request is in flight or failed, and an empty collection gets its own message
 * rather than a blank band.
 */
export default function TopChallenges({
  status,
  challenges: items,
  error,
  onRetry,
}) {
  const sectionRef = useRef(null);

  useRevealGroup(sectionRef, { stagger: 110 });

  return (
    <section
      className="section section--dark top-challenges"
      ref={sectionRef}
      aria-labelledby="top-challenges-title"
    >
      <div className="container">
        <header className="challenges-header" data-reveal-item>
          <div className="challenges-header-text">
            <p className="eyebrow">{challenges.eyebrow}</p>

            <h2 id="top-challenges-title" className="section-title">
              {challenges.title}
            </h2>

            <p className="section-desc">{challenges.description}</p>
          </div>

          <Link to={challenges.action.href} className="arrow-link">
            {challenges.action.label}
            <HeaderActionIcon size={16} />
          </Link>
        </header>

        {status === "loading" ? (
          <DataState
            status="loading"
            title={challenges.states.loading}
            compact
          />
        ) : null}

        {status === "error" ? (
          <DataState
            status="error"
            title={challenges.states.errorTitle}
            message={error?.message}
            retryLabel={challenges.states.retry}
            onRetry={onRetry}
            compact
          />
        ) : null}

        {status === "ready" && items.length === 0 ? (
          <DataState
            status="empty"
            title={challenges.states.emptyTitle}
            message={challenges.states.emptyDescription}
            compact
          />
        ) : null}

        {status === "ready" && items.length > 0 ? (
          /*
            Dedicated horizontal scroll container.
            `overflow-x: auto` on a block-level box gives the list its own
            scrolling viewport; the cards that exceed it scroll *inside* it, so
            the document width is never affected.
          */
          <ul className="challenge-list" tabIndex={0}>
            {items.map((challenge, index) => (
              <ChallengeCard
                key={challenge.challengeId ?? `challenge-${index}`}
                challenge={challenge}
              />
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
