import { useEffect, useMemo, useState } from "react";
import "./Challenges.css";

import { fetchChallenges } from "../../api/challenges";
import ChallengeFilters from "../../components/challenges/ChallengeFilters/ChallengeFilters";
import ChallengeGrid from "../../components/challenges/ChallengeGrid/ChallengeGrid";
import ChallengesHero from "../../components/challenges/ChallengesHero/ChallengesHero";
import DataState from "../../components/common/DataState/DataState";
import { challengesPage } from "../../data/challengesData";
import { site } from "../../data/site";
import useApiResource from "../../hooks/useApiResource";

function distinctSources(challenges) {
  const seen = new Map();

  challenges.forEach((challenge) => {
    const source =
      typeof challenge?.source === "string" ? challenge.source.trim() : "";

    if (source) {
      const key = source.toLowerCase();
      if (!seen.has(key)) {
        seen.set(key, source);
      }
    }
  });

  return Array.from(seen.values()).sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: "base" }),
  );
}

/**
 * Challenges page (`/challenges`).
 *
 * GET /challenges is the only data source. Search and the optional source
 * filter are derived from the loaded list on every render — no filtered copy
 * is stored, so the UI cannot drift from the response.
 */
export default function Challenges() {
  const [selectedSource, setSelectedSource] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { status, data, error, retry } = useApiResource(fetchChallenges);

  const challenges = useMemo(
    () => (Array.isArray(data) ? data : []),
    [data],
  );
  const sources = useMemo(() => distinctSources(challenges), [challenges]);

  /* A reload can remove the selected source; fall back to "all" instead of
     filtering the whole grid away. */
  const activeSource = sources.includes(selectedSource)
    ? selectedSource
    : "all";

  const filteredChallenges = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const source = activeSource.toLowerCase();

    return challenges.filter((challenge) => {
      if (source !== "all") {
        const itemSource =
          typeof challenge?.source === "string"
            ? challenge.source.trim().toLowerCase()
            : "";
        if (itemSource !== source) {
          return false;
        }
      }

      if (!query) {
        return true;
      }

      return [challenge?.title, challenge?.description, challenge?.source, challenge?.season]
        .some(
          (value) =>
            typeof value === "string" && value.toLowerCase().includes(query),
        );
    });
  }, [challenges, searchQuery, activeSource]);

  const isFiltered = searchQuery.trim() !== "" || activeSource !== "all";

  useEffect(() => {
    document.title = `${challengesPage.hero.title} — ${site.name}`;
  }, []);

  function resetFilters() {
    setSearchQuery("");
    setSelectedSource("all");
  }

  return (
    <div className="challenges-page">
      <ChallengesHero />

      {status === "loading" ? (
        <div className="container">
          <DataState status="loading" title={challengesPage.states.loading} />
        </div>
      ) : null}

      {status === "error" ? (
        <div className="container">
          <DataState
            status="error"
            title={challengesPage.states.errorTitle}
            message={error?.message}
            retryLabel={challengesPage.states.retry}
            onRetry={retry}
          />
        </div>
      ) : null}

      {status === "ready" && challenges.length === 0 ? (
        <div className="container">
          <DataState
            status="empty"
            title={challengesPage.emptyState.title}
            message={challengesPage.emptyState.description}
          />
        </div>
      ) : null}

      {status === "ready" && challenges.length > 0 ? (
        <>
          <ChallengeFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sources={sources}
            selectedSource={activeSource}
            onSourceChange={setSelectedSource}
            shownCount={filteredChallenges.length}
            totalCount={challenges.length}
          />

          <ChallengeGrid
            challenges={filteredChallenges}
            isFiltered={isFiltered}
            onReset={resetFilters}
          />
        </>
      ) : null}
    </div>
  );
}
