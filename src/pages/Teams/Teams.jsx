import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./Teams.css";

import { parseTeamId, searchTeams } from "../../api/teams";
import DataState from "../../components/common/DataState/DataState";
import { SearchIcon } from "../../components/common/Icons/Icons";
import PageHero from "../../components/common/PageHero/PageHero";
import { teamsPage } from "../../data/publicPagesData";
import { site } from "../../data/site";
import useApiResource from "../../hooks/useApiResource";
import { useRevealGroup } from "../../hooks/useReveal";
import { getInitials } from "../../utils/initials";
import { toImageSrc } from "../../utils/image";

const PAGE_SIZE = 24;
const DEBOUNCE_MS = 350;

/**
 * One public team card. The card is the link to `/teams/:teamId`; `username` is
 * deliberately never read, even when the API returns it.
 */
function TeamCard({ team }) {
  const { teamId, name, logo } = team;
  const [imageFailed, setImageFailed] = useState(false);

  const imageSrc = toImageSrc(logo);

  return (
    <li className="team-card" data-reveal-item>
      <Link className="team-card-link" to={`/teams/${teamId}`}>
        <span className="team-card-logo-frame">
          {imageSrc && !imageFailed ? (
            <img
              className="team-card-logo"
              src={imageSrc}
              alt=""
              loading="lazy"
              decoding="async"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <span className="team-card-initials" aria-hidden="true">
              {getInitials(name)}
            </span>
          )}
        </span>

        <span className="team-card-name">{name}</span>
      </Link>
    </li>
  );
}

/**
 * Public teams page (`/teams`).
 *
 * Search runs on the server (`GET /teams?search=`), debounced by 350 ms. The
 * page validates each record's id, keeps only `Active` teams, and reveals them
 * 24 at a time because logos can be large inline base64 payloads.
 */
export default function Teams() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sectionRef = useRef(null);

  useRevealGroup(sectionRef, { stagger: 70 });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    document.title = `${teamsPage.hero.title} — ${site.name}`;
  }, []);

  const loadTeams = useCallback(
    (options = {}) => searchTeams(debouncedQuery, options),
    [debouncedQuery],
  );

  const { status, data, error, retry } = useApiResource(loadTeams);

  const teams = useMemo(() => {
    if (!Array.isArray(data)) {
      return [];
    }

    return data.filter(
      (team) =>
        team &&
        typeof team === "object" &&
        parseTeamId(team.teamId) !== null &&
        team.status === "Active",
    );
  }, [data]);

  const hasSearch = debouncedQuery !== "";
  const visibleTeams = teams.slice(0, visibleCount);

  function handleSearchChange(event) {
    setQuery(event.target.value);
    setVisibleCount(PAGE_SIZE);
  }

  function handleLoadMore() {
    setVisibleCount((current) => current + PAGE_SIZE);
  }

  const searchCopy = teamsPage.search;

  return (
    <div className="teams-page">
      <PageHero
        eyebrow={teamsPage.hero.eyebrow}
        title={teamsPage.hero.title}
        description={teamsPage.hero.description}
        titleId="teams-title"
      />

      <section
        className="section teams-section on-dark"
        ref={sectionRef}
        aria-labelledby="teams-title"
      >
        <div className="container">
          <div className="teams-toolbar">
            <div className="teams-search">
              <label className="visually-hidden" htmlFor="teams-search-input">
                {searchCopy.label}
              </label>
              <span className="teams-search-icon" aria-hidden="true">
                <SearchIcon size={16} />
              </span>
              <input
                id="teams-search-input"
                type="search"
                className="teams-search-input"
                placeholder={searchCopy.placeholder}
                value={query}
                onChange={handleSearchChange}
                autoComplete="off"
              />
            </div>

            {status === "ready" && teams.length > 0 ? (
              <p className="teams-count" role="status">
                {teamsPage.results.label}: {teams.length}
              </p>
            ) : null}
          </div>

          {status === "loading" ? (
            <DataState status="loading" title={teamsPage.states.loading} />
          ) : null}

          {status === "error" ? (
            <DataState
              status="error"
              title={teamsPage.states.errorTitle}
              message={error?.message}
              retryLabel={teamsPage.states.retry}
              onRetry={retry}
            />
          ) : null}

          {status === "ready" && teams.length === 0 ? (
            <DataState
              status="empty"
              title={
                hasSearch ? teamsPage.noResults.title : teamsPage.empty.title
              }
              message={
                hasSearch
                  ? teamsPage.noResults.description
                  : teamsPage.empty.description
              }
            />
          ) : null}

          {status === "ready" && teams.length > 0 ? (
            <>
              <ul className="team-grid">
                {visibleTeams.map((team) => (
                  <TeamCard key={team.teamId} team={team} />
                ))}
              </ul>

              {visibleCount < teams.length ? (
                <div className="teams-more">
                  <button
                    type="button"
                    className="btn btn--ghost-dark"
                    onClick={handleLoadMore}
                  >
                    {teamsPage.loadMore}
                  </button>
                </div>
              ) : null}
            </>
          ) : null}
        </div>
      </section>
    </div>
  );
}
