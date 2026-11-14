import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./AdminGameLeaderboard.css";

import { fetchGameLeaderboard } from "../../api/game";
import { adminData } from "../../data/adminData";
import { site } from "../../data/site";
import useGameHub from "../../hooks/useGameHub";
import {
  ANSWER_SUBMITTED_EVENT,
  LEADERBOARD_UPDATED_EVENT,
} from "../../realtime/gameHub";
import { loadMessage } from "../../utils/adminErrors";
import { formatDateTime } from "../../utils/dates";
import { formatNumber } from "../../utils/numbers";

import AdminPageHeader from "../../components/admin/AdminPageHeader/AdminPageHeader";
import StatusPill from "../../components/admin/StatusPill/StatusPill";
import DataState from "../../components/common/DataState/DataState";

const POLL_INTERVAL = 20_000;
const FEED_LIMIT = 8;

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

export default function AdminGameLeaderboard() {
  const copy = adminData.gameLeaderboard;

  const [state, setState] = useState({
    status: "loading",
    data: null,
    error: null,
  });
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(true);
  const [feed, setFeed] = useState([]);

  const controllerRef = useRef(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    document.title = `${copy.title} — ${site.name}`;
  }, [copy.title]);

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

  const handleLeaderboardUpdated = useCallback((payload) => {
    setState({
      status: "ready",
      data: Array.isArray(payload) ? payload : [],
      error: null,
    });
    setLastUpdated(new Date());
    setIsRefreshing(false);
  }, []);

  const handleAnswerSubmitted = useCallback((payload) => {
    if (!payload || typeof payload !== "object") {
      return;
    }

    setFeed((current) =>
      [
        {
          key: `${payload.teamId}-${payload.questionId}-${payload.submittedAt}-${current.length}`,
          ...payload,
        },
        ...current,
      ].slice(0, FEED_LIMIT),
    );
  }, []);

  useGameHub("admin", {
    [LEADERBOARD_UPDATED_EVENT]: handleLeaderboardUpdated,
    [ANSWER_SUBMITTED_EVENT]: handleAnswerSubmitted,
  });

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

  const entries = useMemo(
    () =>
      Array.isArray(state.data)
        ? state.data.filter((entry) => entry && typeof entry === "object")
        : [],
    [state.data],
  );

  const teamNames = useMemo(() => {
    const map = new Map();
    entries.forEach((entry) => {
      if (entry && entry.teamId !== null && entry.teamId !== undefined) {
        map.set(Number(entry.teamId), entry.teamName || `#${entry.teamId}`);
      }
    });
    return map;
  }, [entries]);

  const staleError = state.error && state.status === "ready";

  return (
    <div className="admin-game-board">
      <AdminPageHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
        titleId="admin-game-leaderboard-title"
        actionLabel={isRefreshing ? copy.refreshing : copy.refresh}
        onAction={handleRefresh}
        actionDisabled={isRefreshing}
      />

      <div className="game-board-toolbar">
        <p className="game-board-note">{copy.liveNote}</p>

        <div className="game-board-actions">
          {lastUpdated ? (
            <p className="game-board-updated" aria-live="polite">
              {copy.lastUpdated}:{" "}
              <time dateTime={lastUpdated.toISOString()}>
                {formatUpdated(lastUpdated)}
              </time>
            </p>
          ) : null}
        </div>
      </div>

      {staleError ? (
        <div className="game-board-notice" role="status">
          <span>{copy.staleError}</span>
          <button
            type="button"
            className="game-board-notice-action"
            onClick={handleRefresh}
          >
            {copy.states.retry}
          </button>
        </div>
      ) : null}

      {state.status === "loading" ? (
        <DataState
          status="loading"
          title={copy.states.loading}
          tone="dark"
          compact
        />
      ) : null}

      {state.status === "error" ? (
        <DataState
          status="error"
          title={copy.states.errorTitle}
          message={loadMessage(state.error, copy.states.errorTitle)}
          retryLabel={copy.states.retry}
          onRetry={handleRefresh}
          tone="dark"
          compact
        />
      ) : null}

      {state.status === "ready" && entries.length === 0 ? (
        <DataState
          status="empty"
          title={copy.empty.title}
          message={copy.empty.description}
          tone="dark"
          compact
        />
      ) : null}

      {state.status === "ready" && entries.length > 0 ? (
        <div className="game-board-card">
          <div
            className="game-board-table-wrapper"
            tabIndex={0}
            role="region"
            aria-label={copy.table.caption}
          >
            <table className="game-board-table">
              <caption className="visually-hidden">
                {copy.table.caption}
              </caption>

              <thead>
                <tr>
                  <th scope="col" className="game-board-col-rank">
                    {copy.table.columns.rank}
                  </th>
                  <th scope="col" className="game-board-col-team">
                    {copy.table.columns.team}
                  </th>
                  <th scope="col" className="game-board-col-number">
                    {copy.table.columns.correct}
                  </th>
                  <th scope="col" className="game-board-col-number">
                    {copy.table.columns.points}
                  </th>
                </tr>
              </thead>

              <tbody>
                {entries.map((entry, index) => (
                  <tr key={entry.teamId ?? `entry-${index}`}>
                    <td
                      className="game-board-cell game-board-cell--rank"
                      data-label={copy.table.columns.rank}
                    >
                      <span className="game-board-rank-value">
                        {formatNumber(entry.rank)}
                      </span>
                      {entry.isTied ? (
                        <span className="game-board-tie">
                          {copy.table.tied}
                        </span>
                      ) : null}
                    </td>

                    <td
                      className="game-board-cell game-board-cell--team"
                      data-label={copy.table.columns.team}
                    >
                      <span className="game-board-team-name">
                        {entry.teamName || `#${entry.teamId}`}
                      </span>
                    </td>

                    <td
                      className="game-board-cell game-board-cell--number"
                      data-label={copy.table.columns.correct}
                    >
                      {formatNumber(entry.correctCount)}
                    </td>

                    <td
                      className="game-board-cell game-board-cell--number game-board-cell--points"
                      data-label={copy.table.columns.points}
                    >
                      {formatNumber(entry.totalPoints)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      <section className="admin-game-feed" aria-label={copy.feed.title}>
        <h3 className="admin-game-feed-title">{copy.feed.title}</h3>

        {feed.length === 0 ? (
          <p className="admin-game-feed-empty">{copy.feed.empty}</p>
        ) : (
          <ul className="admin-game-feed-list">
            {feed.map((item) => (
              <li className="admin-game-feed-item" key={item.key}>
                <div className="admin-game-feed-main">
                  <span className="admin-game-feed-team">
                    {teamNames.get(Number(item.teamId)) || `#${item.teamId}`}
                  </span>
                  <span className="admin-game-feed-meta">
                    {copy.feed.question} #{item.questionId}
                  </span>
                </div>

                <div className="admin-game-feed-side">
                  <StatusPill tone={item.correct ? "on" : "off"}>
                    {item.correct ? copy.feed.correct : copy.feed.incorrect}
                  </StatusPill>
                  <span className="admin-game-feed-points">
                    +{formatNumber(item.points)}
                  </span>
                  <span className="admin-game-feed-time">
                    {formatDateTime(item.submittedAt)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
