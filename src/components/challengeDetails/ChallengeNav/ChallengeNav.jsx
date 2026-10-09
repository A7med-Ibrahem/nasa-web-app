import { Link } from "react-router-dom";
import "./ChallengeNav.css";

import { challengeDetailsPage } from "../../../data/challengesData";
import { ArrowLeftIcon, ArrowRightIcon } from "../../common/Icons/Icons";

/**
 * Previous / next challenge navigation for the details page.
 *
 * Fully presentational: it receives the previous and next records (resolved
 * by the page from the shared challenge list) and renders whichever exist, so
 * the first challenge has no "previous" link and the last none for "next".
 * The return link is always available. Slugs are stable, so every link here
 * points at a real details route.
 */
export default function ChallengeNav({ previous, next }) {
  const { title, previousLabel, nextLabel, allLabel } = challengeDetailsPage.nav;

  return (
    <nav className="challenge-nav" aria-label={title}>
      <div className="challenge-nav-grid">
        {previous ? (
          <Link
            className="challenge-nav-link challenge-nav-link--prev"
            to={`/challenges/${previous.slug}`}
          >
            <span className="challenge-nav-direction">
              <ArrowLeftIcon size={15} />
              {previousLabel}
            </span>
            <span className="challenge-nav-title">{previous.title}</span>
          </Link>
        ) : (
          <span className="challenge-nav-spacer" aria-hidden="true" />
        )}

        {next ? (
          <Link
            className="challenge-nav-link challenge-nav-link--next"
            to={`/challenges/${next.slug}`}
          >
            <span className="challenge-nav-direction">
              {nextLabel}
              <ArrowRightIcon size={15} />
            </span>
            <span className="challenge-nav-title">{next.title}</span>
          </Link>
        ) : (
          <span className="challenge-nav-spacer" aria-hidden="true" />
        )}
      </div>

      <p className="challenge-nav-all">
        <Link className="arrow-link" to="/challenges">
          {allLabel}
        </Link>
      </p>
    </nav>
  );
}
