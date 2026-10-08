import { useEffect, useMemo, useState } from "react";
import "./Challenges.css";

import ChallengeFilters from "../../components/challenges/ChallengeFilters/ChallengeFilters";
import ChallengeGrid from "../../components/challenges/ChallengeGrid/ChallengeGrid";
import ChallengesHero from "../../components/challenges/ChallengesHero/ChallengesHero";
import { challengesPage, staticChallenges } from "../../data/challengesData";
import { site } from "../../data/site";

/**
 * Challenges page (`/challenges`).
 *
 * Composition only, exactly like pages/Home/Home.jsx and
 * pages/LiveStandings/LiveStandings.jsx: this file decides which blocks
 * appear and in which order, every block owns its own markup and styling, and
 * all content comes from data/challengesData.js. It renders no Navbar or
 * Footer — those come from MainLayout, so Challenges inherits the same shared
 * chrome and the same active-link treatment as every other route.
 *
 * Page state is deliberately minimal: the selected category and the search
 * query. The visible list is never stored — `filteredChallenges` is derived
 * from `staticChallenges` on every render, so state and data cannot drift
 * apart. No state library, no URL query parameters: category ids and slugs
 * are stable values, so URL synchronisation can be added later without
 * renaming anything.
 *
 * Backend boundary: when an API exists, `staticChallenges` is replaced by the
 * fetched collection (or the filter moves server-side) and the components
 * below are unchanged — they only ever receive data through props.
 */
export default function Challenges() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    document.title = `${challengesPage.hero.title} — ${site.name}`;
  }, []);

  /*
   * Category and search compose: a challenge must match the selected
   * category (or "all") AND contain the query — case-insensitively — in its
   * title, short description, category fields or domains.
   */
  const filteredChallenges = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return staticChallenges.filter((challenge) => {
      const inCategory =
        selectedCategory === "all" || challenge.category === selectedCategory;

      if (!inCategory) {
        return false;
      }

      if (!query) {
        return true;
      }

      const haystack = [
        challenge.title,
        challenge.shortDescription,
        challenge.description,
        challenge.category,
        challenge.categoryLabel,
        ...(Array.isArray(challenge.domains) ? challenge.domains : []),
      ];

      return haystack.some((field) => field.toLowerCase().includes(query));
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="challenges-page">
      <ChallengesHero />

      <ChallengeFilters
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <ChallengeGrid challenges={filteredChallenges} />
    </div>
  );
}
