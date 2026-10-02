import { Link } from "react-router-dom";
import "./CurrentChallengeCard.css";

import { currentChallenge } from "../../../data/liveStandingsData";
import { ArrowRightIcon } from "../../common/Icons/Icons";

/**
 * Sidebar card: the challenge currently being judged.
 *
 * Reuses the `.btn` button primitive (and therefore its existing hover and
 * arrow-shift behaviour) rather than introducing a second button style.
 */
export default function CurrentChallengeCard() {
  return (
    <article className="sidebar-card sidebar-card--flush current-challenge" data-reveal-item>
      <div className="current-challenge-media">
        <img
          src={currentChallenge.image.src}
          alt={currentChallenge.image.alt}
          loading="lazy"
          decoding="async"
        />
      </div>

      <div className="current-challenge-body">
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