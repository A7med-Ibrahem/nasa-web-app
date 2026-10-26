import "./ChallengeGrid.css";

import { challengesPage } from "../../../data/challengesData";
import ChallengeCard from "../ChallengeCard/ChallengeCard";

/**
 * The challenge results: a responsive card grid with two distinct empty states
 * — "no challenges published yet" and "no results for these filters".
 *
 * Presentational; the page owns the fetched collection and the filtering.
 */
export default function ChallengeGrid({ challenges, isFiltered = false, onReset }) {
  if (challenges.length === 0) {
    const state = isFiltered
      ? challengesPage.noResults
      : challengesPage.emptyState;

    return (
      <section className="challenge-grid-section">
        <div className="container">
          <div className="challenge-empty" role="status">
            <h2 className="challenge-empty-title">{state.title}</h2>
            <p className="challenge-empty-description">{state.description}</p>

            {isFiltered && onReset ? (
              <button
                type="button"
                className="btn btn--ghost-dark challenge-empty-action"
                onClick={onReset}
              >
                {challengesPage.noResults.resetLabel}
              </button>
            ) : null}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="challenge-grid-section">
      <div className="container">
        <h2 className="visually-hidden">{challengesPage.results.heading}</h2>

        <ul className="challenge-grid">
          {challenges.map((challenge) => (
            <ChallengeCard key={challenge.challengeId} challenge={challenge} />
          ))}
        </ul>
      </div>
    </section>
  );
}
