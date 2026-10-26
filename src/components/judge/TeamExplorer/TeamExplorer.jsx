import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import "./TeamExplorer.css";

import { ApiError } from "../../../api/client";
import { fetchChallenge } from "../../../api/challenges";
import {
  fetchTeam,
  fetchTeamStudents,
  getTeamChallengeId,
  searchTeams,
} from "../../../api/teams";
import { judgeDashboard } from "../../../data/judgeDashboard";

import TeamSearchPanel from "../TeamSearchPanel/TeamSearchPanel";
import TeamTable from "../TeamTable/TeamTable";
import TeamDetailsPanel from "../TeamDetailsPanel/TeamDetailsPanel";

/**
 * Owns the "search -> list -> details" flow of the Judge Dashboard.
 *
 * Data flow (every value below is a real API response):
 *   GET /teams?search={term}      -> the table rows
 *   GET /teams/{teamId}           -> team detail, including nested `challenge`
 *                                    and `students`
 *   GET /teams/{teamId}/students  -> fallback only when detail omits students
 *   GET /challenges/{challengeId} -> fallback when detail has only an id
 *
 * Correctness details that matter here:
 *   - stale responses are dropped. Every run carries an incrementing request
 *     id *and* an AbortController, so a slow earlier search can never overwrite
 *     a newer one, whichever way it resolves.
 *   - the same guard applies to team details/challenge lookups, which are also
 *     cancelled when the judge selects a different team.
 *   - selection falls back to the first row on a new result, but an explicit
 *     pick survives a refresh when that team is still present.
 *   - the list is fetched once on mount and again only when the committed
 *     query changes — never on every keystroke.
 *   - no failure path substitutes example teams, members or scores.
 */

/* All async list/detail phases live in one reducer so the effect bodies only
   ever *start* work: every state transition happens inside a promise callback
   or an event handler, never synchronously while an effect is running. */
const initialState = {
  query: "",
  /* Bumped only when the same term is submitted again, so the list effect
     re-runs for a manual refresh without the query itself changing. */
  refreshToken: 0,
  teams: [],
  listStatus: "loading",
  listError: "",
  selectedTeamId: null,
  team: null,
  teamStatus: "idle",
  teamError: "",
  members: [],
  membersStatus: "idle",
  challenge: null,
  challengeStatus: "idle",
};

function reducer(state, action) {
  switch (action.type) {
    case "LIST_LOADING":
      return {
        ...state,
        query: action.query ?? state.query,
        refreshToken:
          action.refresh === true ? state.refreshToken + 1 : state.refreshToken,
        listStatus: "loading",
        listError: "",
      };

    case "LIST_READY": {
      const rows = action.rows;
      const stillThere = rows.some((row) => row?.teamId === state.selectedTeamId);
      const nextSelection = stillThere
        ? state.selectedTeamId
        : rows.length > 0
          ? rows[0].teamId
          : null;

      return {
        ...state,
        teams: rows,
        listStatus: "ready",
        selectedTeamId: nextSelection,
      };
    }

    case "LIST_ERROR":
      return {
        ...state,
        teams: [],
        listStatus: "error",
        listError: action.message,
        selectedTeamId: null,
      };

    case "TEAM_CLEARED":
      return {
        ...state,
        selectedTeamId: null,
        team: null,
        teamStatus: "idle",
        teamError: "",
        members: [],
        membersStatus: "idle",
        challenge: null,
        challengeStatus: "idle",
      };

    case "TEAM_LOADING":
      return {
        ...state,
        selectedTeamId: action.teamId,
        team: null,
        teamStatus: "loading",
        teamError: "",
        members: [],
        membersStatus: "loading",
        challenge: null,
        challengeStatus: "idle",
      };

    case "TEAM_READY":
      return {
        ...state,
        team: action.team,
        teamStatus: "ready",
        challengeStatus: action.challengeId === undefined || action.challengeId === null
          ? "unavailable"
          : "loading",
      };

    case "TEAM_ERROR":
      return {
        ...state,
        team: null,
        teamStatus: "error",
        teamError: action.message,
        challengeStatus: "idle",
      };

    case "MEMBERS_READY":
      return { ...state, members: action.members, membersStatus: "ready" };

    case "MEMBERS_ERROR":
      return { ...state, members: [], membersStatus: "error" };

    case "CHALLENGE_READY":
      return {
        ...state,
        challenge: action.challenge,
        challengeStatus: action.challenge ? "ready" : "unavailable",
      };

    case "CHALLENGE_UNAVAILABLE":
      return { ...state, challenge: null, challengeStatus: "unavailable" };

    default:
      return state;
  }
}

export default function TeamExplorer() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [rawSearch, setRawSearch] = useState("");

  const listRequestId = useRef(0);
  const detailRequestId = useRef(0);

  const {
    query,
    refreshToken,
    teams,
    listStatus,
    listError,
    selectedTeamId,
    team,
    teamStatus,
    teamError,
    members,
    membersStatus,
    challenge,
    challengeStatus,
  } = state;

  /* ---------- Team list ---------- */

  useEffect(() => {
    const requestId = listRequestId.current + 1;
    listRequestId.current = requestId;
    const controller = new AbortController();

    searchTeams(query, { signal: controller.signal })
      .then((result) => {
        if (listRequestId.current !== requestId) {
          return;
        }
        dispatch({ type: "LIST_READY", rows: Array.isArray(result) ? result : [] });
      })
      .catch((error) => {
        if (error?.name === "AbortError" || listRequestId.current !== requestId) {
          return;
        }
        dispatch({
          type: "LIST_ERROR",
          message:
            error instanceof ApiError
              ? error.message
              : judgeDashboard.search.errorTitle,
        });
      });

    return () => controller.abort();
  }, [query, refreshToken]);

  /* ---------- Selected team detail + members + challenge ---------- */

  useEffect(() => {
    if (selectedTeamId === null) {
      return undefined;
    }

    const requestId = detailRequestId.current + 1;
    detailRequestId.current = requestId;
    const controller = new AbortController();

    /* Detail is staff-only. Its live shape nests the challenge under
       `team.challenge`, so use that directly and only fall back to the
       challenge endpoint when a partial response supplies an id alone. A
       failure inside the lookup is contained: the team panel still renders
       and only the challenge row reports itself unavailable. */
    fetchTeam(selectedTeamId, { signal: controller.signal })
      .then((result) => {
        if (detailRequestId.current !== requestId) {
          return undefined;
        }

        const detail = result && typeof result === "object" ? result : null;
        if (!detail) {
          dispatch({
            type: "TEAM_ERROR",
            message: judgeDashboard.details.errorTitle,
          });
          dispatch({ type: "MEMBERS_ERROR" });
          return undefined;
        }

        const challengeId = getTeamChallengeId(detail);
        const nestedChallenge =
          detail.challenge && typeof detail.challenge === "object"
            ? detail.challenge
            : null;
        const nestedStudents = Array.isArray(detail.students)
          ? detail.students
          : null;

        dispatch({
          type: "TEAM_READY",
          team: detail,
          challengeId,
        });

        if (nestedStudents !== null) {
          dispatch({ type: "MEMBERS_READY", members: nestedStudents });
        }

        const pending = [];

        if (
          nestedChallenge &&
          (nestedChallenge.challengeId != null || nestedChallenge.title)
        ) {
          dispatch({
            type: "CHALLENGE_READY",
            challenge: nestedChallenge,
          });
        } else if (challengeId !== null) {
          pending.push(
            fetchChallenge(challengeId, { signal: controller.signal })
              .then((challengeResult) => {
                if (detailRequestId.current !== requestId) {
                  return;
                }
                dispatch({
                  type: "CHALLENGE_READY",
                  challenge: challengeResult ?? null,
                });
              })
              .catch((error) => {
                if (
                  error?.name === "AbortError" ||
                  detailRequestId.current !== requestId
                ) {
                  return;
                }
                dispatch({ type: "CHALLENGE_UNAVAILABLE" });
              }),
          );
        }

        if (nestedStudents === null) {
          pending.push(
            fetchTeamStudents(selectedTeamId, { signal: controller.signal })
              .then((membersResult) => {
                if (detailRequestId.current !== requestId) {
                  return;
                }
                dispatch({
                  type: "MEMBERS_READY",
                  members: Array.isArray(membersResult) ? membersResult : [],
                });
              })
              .catch((error) => {
                if (
                  error?.name === "AbortError" ||
                  detailRequestId.current !== requestId
                ) {
                  return;
                }
                dispatch({ type: "MEMBERS_ERROR" });
              }),
          );
        }

        return Promise.all(pending);
      })
      .catch((error) => {
        if (error?.name === "AbortError" || detailRequestId.current !== requestId) {
          return;
        }
        dispatch({
          type: "TEAM_ERROR",
          message:
            error instanceof ApiError
              ? error.message
              : judgeDashboard.details.errorTitle,
        });
        dispatch({ type: "MEMBERS_ERROR" });
      });

    return () => controller.abort();
  }, [selectedTeamId]);

  /* ---------- Handlers ---------- */

  /* The committed query drives the fetch; the raw input is only ever promoted
     here (Enter and the Search button share this one path).

     Submitting a *different* term just commits it. Submitting the *same* term
     is a manual refresh, so the reducer's refresh token is bumped instead —
     the effect depends on both, and the query itself stays stable. */
  const handleSubmit = useCallback(() => {
    const next = rawSearch.trim();

    if (next === query) {
      dispatch({ type: "LIST_LOADING", refresh: true });
      return;
    }

    dispatch({ type: "LIST_LOADING", query: next });
  }, [rawSearch, query]);

  const handleShowAll = useCallback(() => {
    setRawSearch("");

    if (query === "") {
      dispatch({ type: "LIST_LOADING", refresh: true });
      return;
    }

    dispatch({ type: "LIST_LOADING", query: "" });
  }, [query]);

  const handleSelect = useCallback((teamId) => {
    dispatch({ type: "TEAM_LOADING", teamId });
  }, []);

  const memberCount = membersStatus === "ready" ? members.length : null;

  return (
    <section
      className="judge-section team-explorer on-dark"
      aria-labelledby="team-search-title"
    >
      <div className="container">
        <TeamSearchPanel
          value={rawSearch}
          onChange={setRawSearch}
          onSubmit={handleSubmit}
          onShowAll={handleShowAll}
          total={listStatus === "ready" ? teams.length : null}
        />

        <div className="team-explorer-grid">
          <TeamTable
            teams={teams}
            status={listStatus}
            error={listError}
            selectedTeamId={selectedTeamId}
            onSelect={handleSelect}
            caption={judgeDashboard.table.caption}
          />

          <TeamDetailsPanel
            team={team}
            status={teamStatus}
            error={teamError}
            members={members}
            membersStatus={membersStatus}
            memberCount={memberCount}
            challenge={challenge}
            challengeStatus={challengeStatus}
          />
        </div>
      </div>
    </section>
  );
}
