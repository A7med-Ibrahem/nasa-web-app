import { Link } from "react-router-dom";
import "./CurrentChallengeCard.css";

import { currentChallenge } from "../../../data/liveStandingsData";
import { ArrowRightIcon } from "../../common/Icons/Icons";

/**
 * Sidebar card: the challenge currently being judged.
 *
 * The live standings payload does not identify a current challenge, so this
 * card shows an explicit unavailable state and links to the challenges page
 * rather than presenting fixture content as live data.
 */
export default function CurrentChallengeCard() {
  const hasImage = Boolean(currentChallenge.image);

  return (
    <article
      className={`sidebar-card current-challenge${hasImage ? " sidebar-card--flush" : ""}`}
      data-reveal-item
    >
      {hasImage ? (
        <div className="current-challenge-media">
          <img
            src={currentChallenge.image.src}
            alt={currentChallenge.image.alt}
            loading="lazy"
            decoding="async"
          />
        </div>
      ) : null}

      <div
        className={`current-challenge-body${hasImage ? "" : " current-challenge-body--plain"}`}
      >
        <p className="current-challenge-label">{currentChallenge.label}</p>

        <h3 className="current-challenge-title">{currentChallenge.title}</h3>

        <p className="current-challenge-description">{currentChallenge.description}</p>

        <Link to={currentChallenge.action.href} className="btn btn--ghost-dark current-challenge-action">
          {currentChallenge.action.label}
          <ArrowRightIcon />
        </Link>
      </div>
    </article>
  );
}
