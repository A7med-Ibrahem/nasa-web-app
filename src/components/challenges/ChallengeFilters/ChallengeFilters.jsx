import "./ChallengeFilters.css";

import { challengesPage } from "../../../data/challengesData";
import { SearchIcon } from "../../common/Icons/Icons";

/**
 * Search + source filters for the Challenges page.
 *
 * Fully controlled and presentational: the page derives the source list from
 * the loaded API records and owns both values. The source row is only rendered
 * when there are at least two distinct non-empty sources.
 */
export default function ChallengeFilters({
  searchQuery,
  onSearchChange,
  sources,
  selectedSource,
  onSourceChange,
  shownCount,
  totalCount,
}) {
  const { search, sourceFilter, results } = challengesPage;
  const showSourceFilter = Array.isArray(sources) && sources.length >= 2;

  return (
    <section className="challenge-filters" aria-label={challengesPage.filtersLabel}>
      <div className="container">
        <div className="challenge-filters-row">
          {showSourceFilter ? (
            <div
              className="challenge-filter-list"
              role="group"
              aria-label={sourceFilter.ariaLabel}
            >
              <button
                type="button"
                className="challenge-filter-pill"
                aria-pressed={selectedSource === "all"}
                onClick={() => onSourceChange("all")}
              >
                <span>{sourceFilter.all}</span>
              </button>

              {sources.map((source) => (
                <button
                  key={source}
                  type="button"
                  className="challenge-filter-pill"
                  aria-pressed={selectedSource === source}
                  onClick={() => onSourceChange(source)}
                >
                  <span>{source}</span>
                </button>
              ))}
            </div>
          ) : null}

          <div className="challenge-search">
            <label className="visually-hidden" htmlFor="challenge-search-input">
              {search.label}
            </label>
            <span className="challenge-search-icon" aria-hidden="true">
              <SearchIcon size={16} />
            </span>
            <input
              id="challenge-search-input"
              type="search"
              className="challenge-search-input"
              placeholder={search.placeholder}
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
              autoComplete="off"
            />
          </div>
        </div>

        <p className="challenge-filter-count" role="status">
          {results.label}: {shownCount} {results.of} {totalCount} {results.noun}
        </p>
      </div>
    </section>
  );
}
