import { useEffect, useReducer, useRef, useState } from "react";
import "./StaffTeams.css";

import { fetchChallenge } from "../../api/challenges";
import {
  fetchTeam,
  fetchTeamStudents,
  getTeamChallengeId,
  searchTeams,
} from "../../api/teams";
import { staffData } from "../../data/staffData";
import { site } from "../../data/site";
import { loadError } from "../../utils/staffErrors";

import StaffPageHeader from "../../components/staff/StaffPageHeader/StaffPageHeader";
import StaffSearch from "../../components/staff/StaffSearch/StaffSearch";
import TeamRosterDetail from "../../components/staff/TeamRosterDetail/TeamRosterDetail";
import TeamRosterList from "../../components/staff/TeamRosterList/TeamRosterList";

const DEBOUNCE_MS = 350;

const initialState = {
  /* Committed search term: only the debounced input reaches this value. */
  query: "",
  listRetry: 0,
  teams: [],
  listStatus: "loading",
  listError: "",
  selectedTeamId: null,
  detailRetry: 0,
  team: null,
  teamStatus: "idle",
  teamError: "",
  students: [],
  studentsStatus: "idle",
  challenge: null,
  challengeStatus: "idle",
};

function detailLoading(selectedTeamId) {
  return {
    selectedTeamId,
    team: null,
    teamStatus: selectedTeamId === null ? "idle" : "loading",
    teamError: "",
    students: [],
    studentsStatus: selectedTeamId === null ? "idle" : "loading",
    challenge: null,
    challengeStatus: "idle",
  };
}

function reducer(state, action) {
  switch (action.type) {
    case "LIST_LOADING": {
      const nextQuery = action.query ?? state.query;
      const isRefresh = action.refresh === true;

      if (!isRefresh && nextQuery === state.query) {
        return state;
      }

      return {
        ...state,
        query: nextQuery,
        listRetry: isRefresh ? state.listRetry + 1 : state.listRetry,
        listStatus: "loading",
        listError: "",
      };
    }

    case "LIST_READY": {
      const rows = action.rows;
      const stillThere = rows.some(
        (row) => row?.teamId === state.selectedTeamId,
      );
      const nextSelection = stillThere
        ? state.selectedTeamId
        : rows[0]?.teamId ?? null;

      return {
        ...state,
        teams: rows,
        listStatus: "ready",
        listError: "",
        ...(nextSelection === state.selectedTeamId
          ? {}
          : detailLoading(nextSelection)),
      };
    }

    case "LIST_ERROR":
      return {
        ...state,
        teams: [],
        listStatus: "error",
        listError: action.message,
        ...detailLoading(null),
      };

    case "SELECT_TEAM":
      return {
        ...state,
        ...detailLoading(action.teamId),
        detailRetry: state.detailRetry + (action.retry ? 1 : 0),
      };

    case "DETAIL_READY":
      return {
        ...state,
        team: action.team,
        teamStatus: "ready",
        teamError: "",
        challenge: action.challenge ?? null,
        challengeStatus: action.challenge
          ? "ready"
          : action.hasChallengeId
            ? "loading"
            : "unavailable",
      };

    case "DETAIL_ERROR":
      return {
        ...state,
        team: null,
        teamStatus: "error",
        teamError: action.message,
        students: [],
        studentsStatus: "idle",
        challenge: null,
        challengeStatus: "idle",
      };

    case "CHALLENGE_READY":
      return {
        ...state,
        challenge: action.challenge ?? null,
        challengeStatus: action.challenge ? "ready" : "unavailable",
      };

    case "CHALLENGE_UNAVAILABLE":
      return {
        ...state,
        challenge: null,
        challengeStatus: "unavailable",
      };

    case "STUDENTS_READY":
      return {
        ...state,
        students: action.students,
        studentsStatus: "ready",
      };

    case "STUDENTS_ERROR":
      return {
        ...state,
        students: [],
        studentsStatus: "error",
      };

    default:
      return state;
  }
}

export default function StaffTeams() {
  const copy = staffData.teams;
  const [state, dispatch] = useReducer(reducer, initialState);
  const [searchInput, setSearchInput] = useState("");
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);
  const listRunRef = useRef(0);
  const detailRunRef = useRef(0);

  const {
    query,
    listRetry,
    teams,
    listStatus,
    listError,
    selectedTeamId,
    detailRetry,
    team,
    teamStatus,
    teamError,
    students,
    studentsStatus,
    challengeStatus,
  } = state;

  useEffect(() => {
    document.title = `${copy.title} — ${site.name}`;
  }, [copy.title]);

  /* Search only reaches the server after a short pause, matching the check-in
     page. The reducer ignores a term that is already committed. */
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch({ type: "LIST_LOADING", query: searchInput.trim() });
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    const controller = new AbortController();
    const runId = listRunRef.current + 1;
    listRunRef.current = runId;

    searchTeams(query, { signal: controller.signal })
      .then((result) => {
        if (controller.signal.aborted || runId !== listRunRef.current) {
          return;
        }
        dispatch({
          type: "LIST_READY",
          rows: Array.isArray(result) ? result : [],
        });
      })
      .catch((cause) => {
        if (
          cause?.name === "AbortError" ||
          controller.signal.aborted ||
          runId !== listRunRef.current
        ) {
          return;
        }
        dispatch({
          type: "LIST_ERROR",
          message: loadError(cause, copy.list.errorTitle),
        });
      });

    return () => controller.abort();
  }, [copy.list.errorTitle, listRetry, query]);

  useEffect(() => {
    if (selectedTeamId === null) {
      return undefined;
    }

    const controller = new AbortController();
    const runId = detailRunRef.current + 1;
    detailRunRef.current = runId;

    fetchTeam(selectedTeamId, { signal: controller.signal })
      .then((result) => {
        if (controller.signal.aborted || runId !== detailRunRef.current) {
          return;
        }

        const detail = result && typeof result === "object" ? result : null;
        if (!detail) {
          dispatch({
            type: "DETAIL_ERROR",
            message: copy.detail.errorTitle,
          });
          return;
        }

        const nestedChallenge =
          detail.challenge && typeof detail.challenge === "object"
            ? detail.challenge
            : null;
        const hasNestedChallenge = Boolean(
          nestedChallenge &&
            (nestedChallenge.challengeId != null ||
              nestedChallenge.title),
        );
        const challengeId = getTeamChallengeId(detail);

        dispatch({
          type: "DETAIL_READY",
          team: detail,
          challenge: hasNestedChallenge ? nestedChallenge : null,
          hasChallengeId: !hasNestedChallenge && challengeId !== null,
        });

        if (!hasNestedChallenge && challengeId !== null) {
          fetchChallenge(challengeId, { signal: controller.signal })
            .then((challenge) => {
              if (controller.signal.aborted || runId !== detailRunRef.current) {
                return;
              }
              dispatch({
                type: "CHALLENGE_READY",
                challenge:
                  challenge && typeof challenge === "object"
                    ? challenge
                    : null,
              });
            })
            .catch((cause) => {
              if (
                cause?.name === "AbortError" ||
                controller.signal.aborted ||
                runId !== detailRunRef.current
              ) {
                return;
              }
              dispatch({ type: "CHALLENGE_UNAVAILABLE" });
            });
        }

        fetchTeamStudents(selectedTeamId, { signal: controller.signal })
          .then((result) => {
            if (controller.signal.aborted || runId !== detailRunRef.current) {
              return;
            }
            dispatch({
              type: "STUDENTS_READY",
              students: Array.isArray(result) ? result : [],
            });
          })
          .catch((cause) => {
            if (
              cause?.name === "AbortError" ||
              controller.signal.aborted ||
              runId !== detailRunRef.current
            ) {
              return;
            }
            dispatch({ type: "STUDENTS_ERROR" });
          });
      })
      .catch((cause) => {
        if (
          cause?.name === "AbortError" ||
          controller.signal.aborted ||
          runId !== detailRunRef.current
        ) {
          return;
        }
        dispatch({
          type: "DETAIL_ERROR",
          message: loadError(cause, copy.detail.errorTitle),
        });
      });

    return () => controller.abort();
  }, [copy.detail.errorTitle, detailRetry, selectedTeamId]);

  function handleSearchChange(value) {
    setSearchInput(value);
    setMobileDetailOpen(false);
  }

  function handleRefresh() {
    dispatch({ type: "LIST_LOADING", refresh: true });
  }

  function handleSelect(teamId) {
    setMobileDetailOpen(true);
    dispatch({
      type: "SELECT_TEAM",
      teamId,
      retry: teamId === selectedTeamId,
    });
  }

  function handleDetailRetry() {
    if (selectedTeamId === null) {
      return;
    }
    dispatch({
      type: "SELECT_TEAM",
      teamId: selectedTeamId,
      retry: true,
    });
  }

  return (
    <div className={`staff-roster${mobileDetailOpen ? " is-detail-open" : ""}`}>
      <StaffPageHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
      >
        <button
          type="button"
          className="btn btn--ghost-dark staff-page-button"
          onClick={handleRefresh}
        >
          {staffData.common.refresh}
        </button>
      </StaffPageHeader>

      <section className="staff-roster-search" aria-label={copy.searchLabel}>
        <StaffSearch
          id="staff-roster-search"
          label={copy.searchLabel}
          placeholder={copy.searchPlaceholder}
          value={searchInput}
          onChange={handleSearchChange}
          hint={copy.searchHint}
        />
      </section>

      <div className="staff-roster-grid">
        <TeamRosterList
          teams={teams}
          status={listStatus}
          error={listError}
          selectedTeamId={selectedTeamId}
          onSelect={handleSelect}
          onRetry={handleRefresh}
        />

        <TeamRosterDetail
          team={team}
          status={teamStatus}
          error={teamError}
          students={students}
          studentsStatus={studentsStatus}
          challengeStatus={challengeStatus}
          onRetry={handleDetailRetry}
          onBack={() => setMobileDetailOpen(false)}
        />
      </div>
    </div>
  );
}
