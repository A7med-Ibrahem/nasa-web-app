import { useCallback, useEffect, useRef, useState } from "react";

import { fetchStandings, isStandingsPayload } from "../api/standings";
import {
  createJudgingHubConnection,
  SCORES_SUBMITTED_EVENT,
  STANDINGS_UPDATED_EVENT,
} from "../realtime/judgingHub";

const POLL_INTERVAL = 30_000;
const REFRESH_COALESCE_DELAY = 250;

/**
 * Owns the live standings feed: the initial REST read, SignalR delivery and
 * coalesced REST refreshes.
 *
 * SignalR carries the complete standings array, so the board is never built
 * from per-team events. `ScoresSubmitted` is only a hint that the aggregate has
 * changed; it triggers a REST read instead of being treated as standings data.
 */
export default function useLiveStandings() {
  const [standings, setStandings] = useState(null);
  const [phase, setPhase] = useState("loading");
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [connectionState, setConnectionState] = useState("connecting");
  const [isRefreshing, setIsRefreshing] = useState(true);

  const abortRef = useRef(null);
  const requestIdRef = useRef(0);
  const hubRevisionRef = useRef(0);
  const refreshTimerRef = useRef(null);

  const applyStandings = useCallback((payload) => {
    setStandings(payload);
    setPhase("ready");
    setError(null);
    setLastUpdated(new Date());
  }, []);

  const loadStandings = useCallback(async () => {
    if (abortRef.current) {
      abortRef.current.abort();
    }

    const controller = new AbortController();
    const requestId = requestIdRef.current + 1;
    const hubRevision = hubRevisionRef.current;

    abortRef.current = controller;
    requestIdRef.current = requestId;

    try {
      const payload = await fetchStandings({ signal: controller.signal });

      if (requestId !== requestIdRef.current || hubRevision !== hubRevisionRef.current) {
        return;
      }

      if (!isStandingsPayload(payload)) {
        throw new Error("The standings feed returned an unexpected response.");
      }

      applyStandings(payload);
    } catch (cause) {
      if (cause?.name === "AbortError" || requestId !== requestIdRef.current) {
        return;
      }

      if (hubRevision !== hubRevisionRef.current) {
        return;
      }

      setError(cause?.message || "Could not load the live standings.");
      setPhase((current) => (current === "ready" ? current : "error"));
    } finally {
      if (requestId === requestIdRef.current && !controller.signal.aborted) {
        setIsRefreshing(false);
      }
    }
  }, [applyStandings]);

  const refresh = useCallback(() => {
    setIsRefreshing(true);
    setPhase((current) => (current === "ready" ? current : "loading"));
    loadStandings();
  }, [loadStandings]);

  const scheduleRefresh = useCallback(() => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
    }

    refreshTimerRef.current = setTimeout(() => {
      refreshTimerRef.current = null;
      refresh();
    }, REFRESH_COALESCE_DELAY);
  }, [refresh]);

  useEffect(() => {
    if (abortRef.current) {
      abortRef.current.abort();
    }

    const controller = new AbortController();
    const requestId = requestIdRef.current + 1;
    const hubRevision = hubRevisionRef.current;

    abortRef.current = controller;
    requestIdRef.current = requestId;

    fetchStandings({ signal: controller.signal })
      .then((payload) => {
        if (
          requestId !== requestIdRef.current ||
          hubRevision !== hubRevisionRef.current
        ) {
          return;
        }

        if (!isStandingsPayload(payload)) {
          throw new Error("The standings feed returned an unexpected response.");
        }

        applyStandings(payload);
      })
      .catch((cause) => {
        if (
          cause?.name === "AbortError" ||
          requestId !== requestIdRef.current ||
          hubRevision !== hubRevisionRef.current
        ) {
          return;
        }

        setError(cause?.message || "Could not load the live standings.");
        setPhase((current) => (current === "ready" ? current : "error"));
      })
      .finally(() => {
        if (requestId === requestIdRef.current && !controller.signal.aborted) {
          setIsRefreshing(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [applyStandings]);

  useEffect(() => {
    let disposed = false;
    let retryTimer = null;
    let startTimer = null;
    let retryAttempt = 0;
    const connection = createJudgingHubConnection();

    const clearRetry = () => {
      if (retryTimer) {
        clearTimeout(retryTimer);
        retryTimer = null;
      }
    };

    const scheduleReconnect = () => {
      if (disposed || retryTimer) {
        return;
      }

      const delay = Math.min(2_000 * 2 ** retryAttempt, 30_000);
      retryAttempt += 1;

      retryTimer = setTimeout(() => {
        retryTimer = null;
        startConnection();
      }, delay);
    };

    const startConnection = () => {
      if (disposed) {
        return;
      }

      clearRetry();

      connection
        .start()
        .then(() => {
          if (disposed) {
            connection.stop().catch(() => {});
            return;
          }

          retryAttempt = 0;
          setConnectionState("connected");
        })
        .catch(() => {
          if (disposed) {
            return;
          }

          setConnectionState("disconnected");
          scheduleReconnect();
        });
    };

    const handleStandingsUpdated = (payload) => {
      if (disposed) {
        return;
      }

      if (!isStandingsPayload(payload)) {
        scheduleRefresh();
        return;
      }

      hubRevisionRef.current += 1;
      applyStandings(payload);
      setIsRefreshing(false);
    };

    const handleScoresSubmitted = () => {
      if (!disposed) {
        scheduleRefresh();
      }
    };

    const handleReconnecting = () => {
      if (!disposed) {
        clearRetry();
        setConnectionState("reconnecting");
      }
    };

    const handleReconnected = () => {
      if (!disposed) {
        clearRetry();
        retryAttempt = 0;
        setConnectionState("connected");
        scheduleRefresh();
      }
    };

    const handleClosed = () => {
      if (!disposed) {
        setConnectionState("disconnected");
        scheduleReconnect();
      }
    };

    connection.on(STANDINGS_UPDATED_EVENT, handleStandingsUpdated);
    connection.on(SCORES_SUBMITTED_EVENT, handleScoresSubmitted);
    connection.onreconnecting(handleReconnecting);
    connection.onreconnected(handleReconnected);
    connection.onclose(handleClosed);

    /* Defer the first start by one tick so React Strict Mode's setup/cleanup
       probe never opens (and immediately aborts) a second connection. */
    startTimer = setTimeout(() => {
      startTimer = null;
      startConnection();
    }, 0);

    return () => {
      disposed = true;
      if (startTimer) {
        clearTimeout(startTimer);
      }
      clearRetry();
      connection.off(STANDINGS_UPDATED_EVENT, handleStandingsUpdated);
      connection.off(SCORES_SUBMITTED_EVENT, handleScoresSubmitted);
      connection.stop().catch(() => {});
    };
  }, [applyStandings, scheduleRefresh]);

  useEffect(() => {
    if (connectionState !== "disconnected") {
      return undefined;
    }

    const timer = setInterval(() => {
      refresh();
    }, POLL_INTERVAL);

    return () => clearInterval(timer);
  }, [connectionState, refresh]);

  useEffect(
    () => () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    },
    [],
  );

  return {
    standings,
    phase,
    error,
    lastUpdated,
    connectionState,
    isRefreshing,
    refresh,
  };
}
