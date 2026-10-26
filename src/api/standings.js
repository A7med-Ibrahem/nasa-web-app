import { request } from "./client";

const isFiniteNumber = (value) => typeof value === "number" && Number.isFinite(value);

function isStandingsEntry(entry) {
  return (
    entry !== null &&
    typeof entry === "object" &&
    (entry.rank === null || isFiniteNumber(entry.rank)) &&
    typeof entry.isTied === "boolean" &&
    isFiniteNumber(entry.teamId) &&
    typeof entry.teamName === "string" &&
    isFiniteNumber(entry.achievedScore) &&
    isFiniteNumber(entry.availableScore) &&
    isFiniteNumber(entry.percentage) &&
    isFiniteNumber(entry.judgesCounted) &&
    Array.isArray(entry.criteria)
  );
}

/**
 * The hub sends the same array as the REST endpoint. Validate before accepting
 * either source so a malformed event can never blank a valid leaderboard.
 */
export function isStandingsPayload(payload) {
  return Array.isArray(payload) && payload.every(isStandingsEntry);
}

export function fetchStandings({ signal } = {}) {
  return request("/judging/standings", { signal });
}
