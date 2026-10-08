import "./ChallengeFilters.css";

import { challengeCategories, challengesPage } from "../../../data/challengesData";
import { challengeIcons } from "../../common/Icons/iconRegistry";

/**
 * Category pills + search field for the Challenges page.
 *
 * Presentational and fully controlled: the page owns `selectedCategory` and
 * `searchQuery`, so the two controls compose the same way a future API-driven
 * version would — this component never filters anything itself, it only
 * reports what the visitor chose. Static content (the category list, the
 * search copy) comes from data/challengesData.js, exactly like every other
 * section in the project.
 *
 * Both controls are real form controls: pills are `<button>`s with
 * `aria-pressed` reflecting the active category, and the search is a labelled
 * `<input type="search">`, so everything is keyboard reachable.
 */
export default function ChallengeFilters({
  selectedCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
}) {
  const SearchIcon = challengeIcons.search;
  const { label: searchLabel, placeholder: searchPlaceholder } = challengesPage.search;

  return (
    <section className="challenge-filters" aria-label="Challenge filters">
      <div className="container">
        <div className="challenge-filters-row">
          {/*
            Dedicated horizontal scroll container for narrow screens: the pills
            that exceed its width scroll *inside* it, so the document width is
            never affected. On desktop every pill fits and nothing scrolls.
          */}
          <div
            className="challenge-filter-list"
            role="group"
            aria-label="Filter challenges by category"
          >
            {challengeCategories.map((category) => {
              const Icon = challengeIcons[category.icon];
              const isActive = category.id === selectedCategory;

              return (
                <button
                  key={category.id}
                  type="button"
                  className="challenge-filter-pill"
                  aria-pressed={isActive}
                  onClick={() => onCategoryChange(category.id)}
                >
                  {Icon ? <Icon size={15} /> : null}
                  <span>{category.label}</span>
                </button>
              );
            })}
          </div>

          <div className="challenge-search">
            <label className="visually-hidden" htmlFor="challenge-search-input">
              {searchLabel}
            </label>
            <span className="challenge-search-icon" aria-hidden="true">
              <SearchIcon size={16} />
            </span>
            <input
              id="challenge-search-input"
              type="search"
              className="challenge-search-input"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
              autoComplete="off"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
