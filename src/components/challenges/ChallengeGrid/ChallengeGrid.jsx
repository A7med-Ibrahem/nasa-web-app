import "./ChallengeGrid.css";

import { challengesPage } from "../../../data/challengesData";
import ChallengeCard from "../ChallengeCard/ChallengeCard";

/**
 * The challenge results: a responsive card grid with a centred empty state.
 *
 * Presentational — it renders exactly the collection it is handed, which the
 * page derives from `staticChallenges` by applying the category filter and
 * the search query. When a future API supplies the collection, the filtering
 * (or server-side paging) changes and this component does not.
 *
 * The grid is a real `<ul>` of ChallengeCard list items: 3 columns on
 * desktop, 2 on tablet, 1 on phone, all inside the shared page container, so
 * no breakpoint can introduce horizontal page scrolling.
 */
export default function ChallengeGrid({ challenges }) {
  if (challenges.length === 0) {
    return (
      <section className="challenge-grid-section">
        <div className="container">
          {/* role="status" announces the outcome when a filter or search
              query empties the grid, instead of leaving the region silently
              blank. Muted typography, not an error style. */}
          <div className="challenge-empty" role="status">
            <h2 className="challenge-empty-title">{challengesPage.emptyState.title}</h2>
            <p className="challenge-empty-description">
              {challengesPage.emptyState.description}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="challenge-grid-section">
      <div className="container">
        {/* Keeps the heading outline contiguous: h1 (hero) -> h2 -> h3
            (cards), without adding visible chrome to the page. */}
        <h2 className="visually-hidden">Challenge results</h2>

        <ul className="challenge-grid">
          {challenges.map((challenge) => (
            <ChallengeCard key={challenge.id} challenge={challenge} />
          ))}
        </ul>
      </div>
    </section>
  );
}
