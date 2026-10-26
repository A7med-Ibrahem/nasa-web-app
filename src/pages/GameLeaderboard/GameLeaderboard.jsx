import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./GameLeaderboard.css";

import { fetchGameLeaderboard } from "../../api/game";
import { parseTeamId } from "../../api/teams";
import { useAuth } from "../../auth/useAuth";
import DataState from "../../components/common/DataState/DataState";
import PageHero from "../../components/common/PageHero/PageHero";
import { gameLeaderboardPage } from "../../data/publicPagesData";
import { site } from "../../data/site";
import { useRevealGroup } from "../../hooks/useReveal";

const POLL_INTERVAL = 20_000;

function formatUpdated(date) {
  if (!(date instanceof Date)) {
    return "";
  }

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatCount(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number.toLocaleString("en-US") : "—";
}

function formatRank(value) {
  const number = Number(value);
  return Number.isFinite(number) ? String(value) : "—";
}

/**
 * Public game leaderboard (`/leaderboard/game`).
 *
 * GET /game/leaderboard is the only data source and its order, rank and
 * `isTied` values are rendered verbatim — nothing is recalculated. There is no
 * SignalR hub for this board, so freshness comes from a 20-second poll while
 * the tab is visible, a refetch on focus, and a manual Refresh button.
 */
export default function GameLeaderboard() {
  const { user } = useAuth();
  const pageRef = useRef(null);

  useRevealGroup(pageRef, { stagger: 80 });

  const [state, setState] = useState({
    status: "loading",
    data: null,
    error: null,
  });
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(true);

  const controllerRef = useRef(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    document.title = `${gameLeaderboardPage.hero.title} — ${site.name}`;
  }, []);

  const load = useCallback(async ({ silent = false } = {}) => {
    if (controllerRef.current) {
      controllerRef.current.abort();
    }

    const controller = new AbortController();
    const requestId = requestIdRef.current + 1;

    controllerRef.current = controller;
    requestIdRef.current = requestId;

    try {
      const result = await fetchGameLeaderboard({ signal: controller.signal });

      if (requestId !== requestIdRef.current) {
        return;
      }

      setState({
        status: "ready",
        data: Array.isArray(result) ? result : [],
        error: null,
      });
      setLastUpdated(new Date());
    } catch (cause) {
      if (cause?.name === "AbortError" || requestId !== requestIdRef.current) {
        return;
      }

      setState((current) => {
        if (current.status === "ready" && Array.isArray(current.data)) {
          return { ...current, error: cause };
        }

        return { status: "error", data: null, error: cause };
      });

      if (!silent) {
        setLastUpdated(null);
      }
    } finally {
      if (requestId === requestIdRef.current && !controller.signal.aborted) {
        setIsRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    load();

    const timer = setInterval(() => {
      if (document.visibilityState === "visible") {
        load({ silent: true });
      }
    }, POLL_INTERVAL);

    function handleFocus() {
      if (document.visibilityState === "visible") {
        load({ silent: true });
      }
    }

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleFocus);

    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleFocus);
      controllerRef.current?.abort();
    };
  }, [load]);

  function handleRefresh() {
    setIsRefreshing(true);
    load();
  }

  const participantTeamId =
    user?.role === "Participant"
      ? parseTeamId(user?.teamId ?? user?.team?.teamId)
      : null;

  const entries = useMemo(
    () =>
      Array.isArray(state.data)
        ? state.data.filter(
            (entry) => entry && typeof entry === "object",
          )
        : [],
    [state.data],
  );

  const staleError = state.error && state.status === "ready";

  return (
    <div className="game-leaderboard-page" ref={pageRef}>
      <PageHero
        eyebrow={gameLeaderboardPage.hero.eyebrow}
        title={gameLeaderboardPage.hero.title}
        description={gameLeaderboardPage.hero.description}
        titleId="game-leaderboard-title"
      />

      <section
        className="section game-leaderboard-section on-dark"
        aria-labelledby="game-leaderboard-title"
      >
        <div className="container">
          <div className="game-board-toolbar" data-reveal-item>
            <p className="game-board-note">
              {gameLeaderboardPage.pollingNote}
            </p>

            <div className="game-board-actions">
              {lastUpdated ? (
                <p className="game-board-updated" aria-live="polite">
                  {gameLeaderboardPage.lastUpdated}:{" "}
                  <time dateTime={lastUpdated.toISOString()}>
                    {formatUpdated(lastUpdated)}
                  </time>
                </p>
              ) : null}

              <button
                type="button"
                className="btn btn--ghost-dark game-board-refresh"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                {isRefreshing
                  ? gameLeaderboardPage.refreshing
                  : gameLeaderboardPage.refresh}
              </button>
            </div>
          </div>

          {staleError ? (
            <div className="game-board-notice" role="status">
              <span>{gameLeaderboardPage.staleError}</span>
              <button
                type="button"
                className="game-board-notice-action"
                onClick={handleRefresh}
              >
                {gameLeaderboardPage.states.retry}
              </button>
            </div>
          ) : null}

          {state.status === "loading" ? (
            <DataState
              status="loading"
              title={gameLeaderboardPage.states.loading}
            />
          ) : null}

          {state.status === "error" ? (
            <DataState
              status="error"
              title={gameLeaderboardPage.states.errorTitle}
              message={state.error?.message}
              retryLabel={gameLeaderboardPage.states.retry}
              onRetry={handleRefresh}
            />
          ) : null}

          {state.status === "ready" && entries.length === 0 ? (
            <DataState
              status="empty"
              title={gameLeaderboardPage.empty.title}
              message={gameLeaderboardPage.empty.description}
            />
          ) : null}

          {state.status === "ready" && entries.length > 0 ? (
            <div className="game-board-card" data-reveal-item>
              <div
                className="game-board-table-wrapper"
                tabIndex={0}
                role="region"
                aria-label={gameLeaderboardPage.table.caption}
              >
                <table className="game-board-table">
                  <caption className="visually-hidden">
                    {gameLeaderboardPage.table.caption}
                  </caption>

                  <thead>
                    <tr>
                      <th scope="col" className="game-board-col-rank">
                        {gameLeaderboardPage.table.columns.rank}
                      </th>
                      <th scope="col" className="game-board-col-team">
                        {gameLeaderboardPage.table.columns.team}
                      </th>
                      <th scope="col" className="game-board-col-number">
                        {gameLeaderboardPage.table.columns.correct}
                      </th>
                      <th scope="col" className="game-board-col-number">
                        {gameLeaderboardPage.table.columns.points}
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {entries.map((entry, index) => {
                      const entryTeamId = parseTeamId(entry.teamId);
                      const isOwnTeam =
                        participantTeamId !== null &&
                        entryTeamId === participantTeamId;
                      const teamName =
                        typeof entry.teamName === "string"
                          ? entry.teamName
                          : "";

                      return (
                        <tr
                          key={entryTeamId ?? `entry-${index}`}
                          className={isOwnTeam ? "is-current" : undefined}
                        >
                          <td
                            className="game-board-cell game-board-cell--rank"
                            data-label={gameLeaderboardPage.table.columns.rank}
                          >
                            <span className="game-board-rank-value">
                              {formatRank(entry.rank)}
                            </span>
                            {entry.isTied ? (
                              <span className="game-board-tie">
                                <span aria-hidden="true">
                                  {gameLeaderboardPage.table.tied}
                                </span>
                                <span className="visually-hidden">
                                  {gameLeaderboardPage.table.tied}
                                </span>
                              </span>
                            ) : null}
                          </td>

                          <td
                            className="game-board-cell game-board-cell--team"
                            data-label={gameLeaderboardPage.table.columns.team}
                          >
                            {entryTeamId !== null ? (
                              <Link
                                className="game-board-team-link"
                                to={`/teams/${entryTeamId}`}
                              >
                                {teamName || `#${entryTeamId}`}
                              </Link>
                            ) : (
                              <span className="game-board-team-name">
                                {teamName || "—"}
                              </span>
                            )}

                            {isOwnTeam ? (
                              <span className="game-board-own">
                                {gameLeaderboardPage.table.ownTeam}
                              </span>
                            ) : null}
                          </td>

                          <td
                            className="game-board-cell game-board-cell--number"
                            data-label={
                              gameLeaderboardPage.table.columns.correct
                            }
                          >
                            {formatCount(entry.correctCount)}
                          </td>

                          <td
                            className="game-board-cell game-board-cell--number game-board-cell--points"
                            data-label={
                              gameLeaderboardPage.table.columns.points
                            }
                          >
                            {formatCount(entry.totalPoints)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
