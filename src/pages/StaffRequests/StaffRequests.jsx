import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./StaffRequests.css";

import {
  deleteStaffRequest,
  fetchStaffRequests,
  updateRequestStatus,
} from "../../api/staffArea";
import { staffData } from "../../data/staffData";
import useTeamOptions from "../../hooks/useTeamOptions";
import { createHub } from "../../realtime/hubConnection";
import { site } from "../../data/site";
import { canonicalRequestStatus } from "../../utils/staffStatus";
import {
  loadError,
  requestActionError,
  requestDeleteError,
} from "../../utils/staffErrors";

import DataState from "../../components/common/DataState/DataState";
import StaffField from "../../components/staff/StaffField/StaffField";
import StaffPageHeader from "../../components/staff/StaffPageHeader/StaffPageHeader";
import StaffSummary from "../../components/staff/StaffSummary/StaffSummary";
import RequestCard from "../../components/staff/RequestCard/RequestCard";

const EMPTY_FILTERS = { status: "", type: "", teamId: "" };

function newestFirst(a, b) {
  const aTime = new Date(a.createdAt || 0).getTime();
  const bTime = new Date(b.createdAt || 0).getTime();
  return bTime - aTime;
}

export default function StaffRequests() {
  const copy = staffData.requests;

  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [requests, setRequests] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [refreshError, setRefreshError] = useState("");
  const [observedTypes, setObservedTypes] = useState([]);
  const [inflight, setInflight] = useState({});
  const [rowErrors, setRowErrors] = useState({});
  const [highlights, setHighlights] = useState(() => new Set());
  const [hubLive, setHubLive] = useState(false);

  const mountedRef = useRef(true);
  const requestIdRef = useRef(0);
  const previousIdsRef = useRef(new Set());
  const loadedOnceRef = useRef(false);
  const highlightTimersRef = useRef([]);

  const {
    teams,
    status: teamsStatus,
    error: teamsError,
    retry: retryTeams,
  } = useTeamOptions();

  useEffect(() => {
    document.title = `${copy.title} — ${site.name}`;
  }, [copy.title]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      highlightTimersRef.current.forEach((timer) => clearTimeout(timer));
      highlightTimersRef.current = [];
    };
  }, []);

  const load = useCallback(
    async (signal) => {
      const runId = requestIdRef.current + 1;
      requestIdRef.current = runId;

      try {
        const result = await fetchStaffRequests({
          teamId: filters.teamId,
          type: filters.type,
          status: filters.status,
          signal,
        });

        if (
          !mountedRef.current ||
          runId !== requestIdRef.current ||
          signal?.aborted
        ) {
          return;
        }

        const list = Array.isArray(result) ? result : [];
        list.sort(newestFirst);

        const previousIds = previousIdsRef.current;
        const nextIds = new Set(list.map((item) => item.requestId));

        if (loadedOnceRef.current) {
          const newIds = list
            .filter((item) => !previousIds.has(item.requestId))
            .map((item) => item.requestId);

          if (newIds.length > 0) {
            setHighlights((current) => {
              const next = new Set(current);
              newIds.forEach((id) => next.add(id));
              return next;
            });

            const timer = setTimeout(() => {
              setHighlights((current) => {
                const next = new Set(current);
                newIds.forEach((id) => next.delete(id));
                return next;
              });
            }, 2200);
            highlightTimersRef.current.push(timer);
          }
        }

        previousIdsRef.current = nextIds;
        loadedOnceRef.current = true;

        setRequests(list);
        setStatus("ready");
        setError("");
        setRefreshError("");

        setObservedTypes((current) => {
          const known = new Set(current);
          let changed = false;
          list.forEach((item) => {
            if (item.type && !known.has(item.type)) {
              known.add(item.type);
              changed = true;
            }
          });
          return changed ? Array.from(known) : current;
        });
      } catch (cause) {
        if (
          !mountedRef.current ||
          cause?.name === "AbortError" ||
          signal?.aborted ||
          runId !== requestIdRef.current
        ) {
          return;
        }

        const message = loadError(cause, copy.states.errorTitle);
        setRefreshError(message);
        setError(message);
        setStatus((current) => (current === "loading" ? "error" : current));
      }
    },
    [copy.states.errorTitle, filters.status, filters.teamId, filters.type],
  );

  useEffect(() => {
    const controller = new AbortController();

    load(controller.signal);

    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        load(controller.signal);
      }
    }, 20000);

    function handleFocus() {
      if (document.visibilityState === "visible") {
        load(controller.signal);
      }
    }

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleFocus);

    return () => {
      controller.abort();
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleFocus);
    };
  }, [load]);

  useEffect(() => {
    let connection;
    let active = true;
    let debounceTimer;

    function scheduleRefresh() {
      if (!active) {
        return;
      }
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => load(), 300);
    }

    function joinOrganizers(target) {
      return target
        .invoke("JoinOrganizers")
        .then(() => {
          if (active) {
            setHubLive(true);
          }
        })
        .catch(() => {
          if (active) {
            setHubLive(false);
          }
        });
    }

    async function start() {
      try {
        connection = createHub("/hubs/requests");
        connection.on("RequestCreated", scheduleRefresh);
        connection.on("RequestUpdated", scheduleRefresh);
        connection.on("RequestDeleted", scheduleRefresh);

        connection.onreconnecting(() => {
          if (active) {
            setHubLive(false);
          }
        });

        connection.onreconnected(() => {
          if (!active) {
            return;
          }
          setHubLive(false);
          joinOrganizers(connection);
        });

        connection.onclose(() => {
          if (active) {
            setHubLive(false);
          }
        });

        await connection.start();
        if (!active) {
          return;
        }

        await joinOrganizers(connection);
      } catch {
        if (active) {
          setHubLive(false);
        }
      }
    }

    start();

    return () => {
      active = false;
      clearTimeout(debounceTimer);
      if (connection) {
        connection.stop().catch(() => {});
      }
    };
  }, [load]);

  const teamNames = useMemo(() => {
    const map = new Map();
    teams.forEach((team) => {
      map.set(String(team.teamId), team.name || copy.card.teamFallback(team.teamId));
    });
    return map;
  }, [copy.card, teams]);

  const typeOptions = useMemo(() => {
    const extras = observedTypes
      .filter((type) => !copy.types.includes(type))
      .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
    return [...copy.types, ...extras];
  }, [copy.types, observedTypes]);

  const counts = useMemo(() => {
    const next = { Pending: 0, "In Progress": 0, Resolved: 0, Rejected: 0 };
    requests.forEach((item) => {
      const canonical = canonicalRequestStatus(item.status);
      if (canonical) {
        next[canonical] += 1;
      }
    });
    return next;
  }, [requests]);

  const summaryItems = [
    { key: "pending", label: copy.counts.pending, value: counts.Pending, tone: "pending" },
    {
      key: "progress",
      label: copy.counts.inProgress,
      value: counts["In Progress"],
      tone: "progress",
    },
    { key: "resolved", label: copy.counts.resolved, value: counts.Resolved, tone: "resolved" },
    { key: "rejected", label: copy.counts.rejected, value: counts.Rejected, tone: "rejected" },
  ];

  function resetListForFilter() {
    requestIdRef.current += 1;
    previousIdsRef.current = new Set();
    loadedOnceRef.current = false;
    highlightTimersRef.current.forEach((timer) => clearTimeout(timer));
    highlightTimersRef.current = [];
    setHighlights(new Set());
    setRequests([]);
    setStatus("loading");
    setError("");
    setRefreshError("");
  }

  function updateFilter(key, value) {
    resetListForFilter();
    setFilters((current) => ({ ...current, [key]: value }));
  }

  function handleRefresh() {
    load();
  }

  async function handleAction(item, nextStatus) {
    if (inflight[item.requestId]) {
      return;
    }

    const id = item.requestId;
    setInflight((current) => ({ ...current, [id]: "status" }));
    setRowErrors((current) => ({ ...current, [id]: "" }));

    try {
      const updated = await updateRequestStatus(id, nextStatus);
      if (!mountedRef.current) {
        return;
      }
      setRequests((current) =>
        current.map((row) =>
          row.requestId === id
            ? {
                ...row,
                ...(updated && typeof updated === "object" ? updated : {}),
                status:
                  updated && typeof updated === "object" && updated.status
                    ? updated.status
                    : nextStatus,
              }
            : row,
        ),
      );
    } catch (cause) {
      if (!mountedRef.current) {
        return;
      }
      setRowErrors((current) => ({
        ...current,
        [id]: requestActionError(cause),
      }));
    } finally {
      if (mountedRef.current) {
        setInflight((current) => {
          const next = { ...current };
          delete next[id];
          return next;
        });
      }
    }
  }

  async function handleDelete(item) {
    if (inflight[item.requestId]) {
      return;
    }
    if (!window.confirm(copy.actions.confirmDelete)) {
      return;
    }

    const id = item.requestId;
    setInflight((current) => ({ ...current, [id]: "delete" }));
    setRowErrors((current) => ({ ...current, [id]: "" }));

    try {
      await deleteStaffRequest(id);
      if (!mountedRef.current) {
        return;
      }
      previousIdsRef.current.delete(id);
      setRequests((current) => current.filter((row) => row.requestId !== id));
    } catch (cause) {
      if (!mountedRef.current) {
        return;
      }
      setRowErrors((current) => ({
        ...current,
        [id]: requestDeleteError(cause),
      }));
    } finally {
      if (mountedRef.current) {
        setInflight((current) => {
          const next = { ...current };
          delete next[id];
          return next;
        });
      }
    }
  }

  return (
    <div className="staff-requests">
      <StaffPageHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
      >
        <span
          className={`staff-live-pill ${hubLive ? "is-live" : "is-auto"}`}
          role="status"
          aria-live="polite"
        >
          <span className="staff-live-dot" aria-hidden="true" />
          {hubLive ? staffData.common.live : staffData.common.autoRefreshing}
        </span>
        <button
          type="button"
          className="btn btn--ghost-dark staff-page-button"
          onClick={handleRefresh}
        >
          {staffData.common.refresh}
        </button>
      </StaffPageHeader>

      <section className="staff-filter-card" aria-label={copy.filters.caption}>
        <div className="staff-filter-grid">
          <StaffField id="staff-request-status" label={copy.filters.status}>
            <select
              id="staff-request-status"
              value={filters.status}
              onChange={(event) => updateFilter("status", event.target.value)}
            >
              <option value="">{copy.filters.allStatuses}</option>
              {copy.statuses.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </StaffField>

          <StaffField id="staff-request-type" label={copy.filters.type}>
            <select
              id="staff-request-type"
              value={filters.type}
              onChange={(event) => updateFilter("type", event.target.value)}
            >
              <option value="">{copy.filters.allTypes}</option>
              {typeOptions.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </StaffField>

          <StaffField id="staff-request-team" label={copy.filters.team}>
            <select
              id="staff-request-team"
              value={filters.teamId}
              onChange={(event) => updateFilter("teamId", event.target.value)}
              disabled={teamsStatus !== "ready"}
            >
              <option value="">{copy.filters.allTeams}</option>
              {teams.map((team) => (
                <option key={team.teamId} value={team.teamId}>
                  {team.name || copy.card.teamFallback(team.teamId)}
                </option>
              ))}
            </select>
          </StaffField>
        </div>

        {teamsStatus === "loading" ? (
          <p className="staff-inline-note">{staffData.common.teamsLoading}</p>
        ) : null}

        {teamsStatus === "error" ? (
          <p className="staff-inline-note staff-inline-note--error" role="alert">
            {teamsError}
            <button type="button" className="staff-link-button" onClick={retryTeams}>
              {staffData.common.retry}
            </button>
          </p>
        ) : null}
      </section>

      <StaffSummary
        label={copy.countsLabel}
        ariaLabel={copy.countsLabel}
        items={summaryItems}
        className="staff-requests-summary"
      />

      <section className="staff-list-card" aria-label={copy.title}>
        {status === "loading" ? (
          <DataState
            status="loading"
            title={copy.states.loading}
            tone="dark"
            compact
          />
        ) : null}

        {status === "error" ? (
          <DataState
            status="error"
            title={copy.states.errorTitle}
            message={error}
            retryLabel={staffData.common.retry}
            onRetry={handleRefresh}
            tone="dark"
            compact
          />
        ) : null}

        {status === "ready" ? (
          <>
            {refreshError ? (
              <p className="staff-inline-note staff-inline-note--error" role="alert">
                {copy.states.refreshError}
                <button
                  type="button"
                  className="staff-link-button"
                  onClick={handleRefresh}
                >
                  {staffData.common.retry}
                </button>
              </p>
            ) : null}

            {requests.length === 0 ? (
              <DataState
                status="ready"
                title={copy.states.empty}
                tone="dark"
                compact
              />
            ) : (
              <ul className="staff-request-list">
                {requests.map((item) => (
                  <RequestCard
                    key={item.requestId}
                    request={item}
                    teamName={
                      teamNames.get(String(item.teamId)) ||
                      copy.card.teamFallback(item.teamId)
                    }
                    busyAction={inflight[item.requestId]}
                    error={rowErrors[item.requestId]}
                    isNew={highlights.has(item.requestId)}
                    onAction={handleAction}
                    onDelete={handleDelete}
                  />
                ))}
              </ul>
            )}
          </>
        ) : null}
      </section>
    </div>
  );
}
