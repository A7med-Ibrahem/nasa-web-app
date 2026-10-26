import { SearchIcon } from "../../common/Icons/Icons";
import "./TeamSearchPanel.css";

import { judgeDashboard } from "../../../data/judgeDashboard";

/**
 * Search bar for the Judge Dashboard.
 *
 * A real <form>, so Enter and the button are the same submit path — there is
 * no keyboard-only branch to keep in sync. The results count is announced
 * politely; loading and error copy lives with the table that owns the data.
 */
export default function TeamSearchPanel({ value, onChange, onSubmit, onShowAll, total }) {
  const { search } = judgeDashboard;

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <div className="team-search-card" data-reveal-item>
      <div className="team-search-heading">
        <h2 className="team-search-title" id="team-search-title">
          {search.title}
        </h2>
        <p className="team-search-hint">{search.hint}</p>
      </div>

      <form className="team-search-form" onSubmit={handleSubmit} role="search">
        <label className="visually-hidden" htmlFor="team-search-input">
          {search.label}
        </label>

        <div className="team-search-control">
          <span className="team-search-icon" aria-hidden="true">
            <SearchIcon size={17} />
          </span>
          <input
            id="team-search-input"
            className="team-search-input"
            type="search"
            name="search"
            autoComplete="off"
            placeholder={search.placeholder}
            value={value}
            onChange={(event) => onChange(event.target.value)}
          />
        </div>

        <button type="submit" className="btn team-search-submit">
          <SearchIcon size={16} />
          {search.submit}
        </button>

        <button type="button" className="team-search-all" onClick={onShowAll}>
          {search.showAll}
        </button>
      </form>

      {total !== null && (
        <p className="team-search-count" role="status" aria-live="polite">
          {search.resultLabel(total)}
        </p>
      )}
    </div>
  );
}
