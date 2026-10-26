import { useCallback, useEffect, useRef, useState } from "react";
import "./ParticipantRequests.css";

import { ApiError } from "../../api/client";
import { createRequest, deleteRequest, fetchRequests } from "../../api/requests";
import { participantData } from "../../data/participantData";
import { createHub } from "../../realtime/hubConnection";
import { useRevealGroup } from "../../hooks/useReveal";

function formatDate(value) {
  if (!value) {
    return "—";
  }
  try {
    const date = new Date(value);
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  } catch {
    return String(value);
  }
}

export default function ParticipantRequests() {
  const pageRef = useRef(null);
  useRevealGroup(pageRef, { stagger: 80, rootMargin: "0px 0px -6% 0px" });

  const [requests, setRequests] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [type, setType] = useState(participantData.requests.types[0]);
  const [message, setMessage] = useState("");
  const [formError, setFormError] = useState("");
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState({});
  /* "Live" is only true after this connection actually delivered a hub event.
     Connecting successfully is not enough: in Task 5 the socket started but
     never sent a payload, so the indicator must stay on "Auto-refreshing"
     (polling) until the first real RequestCreated/Updated/Deleted event. */
  const [hubPushedEvent, setHubPushedEvent] = useState(false);

  const messageMax = 500;

  useEffect(() => {
    document.title = "Requests — NASA Space Apps Hurghada";
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

  const load = useCallback(
    async (signal) => {
      try {
        const result = await fetchRequests({ signal });
        const list = Array.isArray(result) ? result : [];
        list.sort((a, b) => {
          const aTime = new Date(a.createdAt || 0).getTime();
          const bTime = new Date(b.createdAt || 0).getTime();
          return bTime - aTime;
        });
        setRequests(list);
        setStatus("ready");
        setError("");
      } catch (err) {
        if (err?.name === "AbortError") {
          return;
        }
        setStatus("error");
        if (err instanceof ApiError) {
          setError(err.message || participantData.requests.errorTitle);
        } else {
          setError(participantData.requests.errorTitle);
        }
      }
    },
    [],
  );

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    async function initialLoad() {
      setStatus("loading");
      setError("");
      try {
        const result = await fetchRequests({ signal: controller.signal });
        if (!active || controller.signal.aborted) {
          return;
        }
        const list = Array.isArray(result) ? result : [];
        list.sort((a, b) => {
          const aTime = new Date(a.createdAt || 0).getTime();
          const bTime = new Date(b.createdAt || 0).getTime();
          return bTime - aTime;
        });
        setRequests(list);
        setStatus("ready");
        setError("");
      } catch (err) {
        if (!active || controller.signal.aborted || err?.name === "AbortError") {
          return;
        }
        setStatus("error");
        if (err instanceof ApiError) {
          setError(err.message || participantData.requests.errorTitle);
        } else {
          setError(participantData.requests.errorTitle);
        }
      }
    }

    initialLoad();

    const interval = setInterval(() => {
      if (document.visibilityState === "visible" && active) {
        load();
      }
    }, 15000);

    function handleFocus() {
      if (document.visibilityState === "visible" && active) {
        load();
      }
    }

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleFocus);

    return () => {
      active = false;
      controller.abort();
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleFocus);
    };
  }, [load]);

  useEffect(() => {
    let connection;
    let mounted = true;
    let debounceTimer;

    function handlePushedEvent() {
      if (!mounted) {
        return;
      }
      setHubPushedEvent(true);
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      debounceTimer = setTimeout(() => load(), 300);
    }

    const start = async () => {
      try {
        connection = createHub("/hubs/requests");
        connection.on("RequestCreated", handlePushedEvent);
        connection.on("RequestUpdated", handlePushedEvent);
        connection.on("RequestDeleted", handlePushedEvent);

        connection.onreconnecting(() => {
          if (mounted) {
            setHubPushedEvent(false);
          }
        });
        connection.onreconnected(() => {
          if (mounted) {
            setHubPushedEvent(false);
          }
        });
        connection.onclose(() => {
          if (mounted) {
            setHubPushedEvent(false);
          }
        });

        await connection.start();
      } catch {
        if (mounted) {
          setHubPushedEvent(false);
        }
      }
    };

    start();

    return () => {
      mounted = false;
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      if (connection) {
        connection
          .stop()
          .catch(() => {});
      }
    };
  }, [load]);

  async function handleCreate(e) {
    e.preventDefault();
    if (creating) {
      return;
    }
    setFormError("");
    if (!message.trim()) {
      setFormError(participantData.requests.messageError);
      return;
    }
    if (message.trim().length > messageMax) {
      setFormError(participantData.requests.messageLengthNote);
      return;
    }

    setCreating(true);
    try {
      await createRequest({ type, message: message.trim() });
      setMessage("");
      load();
    } catch (err) {
      if (err instanceof ApiError) {
        const code = err.code || "";
        if (code === "request.invalid") {
          setFormError(participantData.requests.errors.request.invalid);
        } else if (code === "request.forbidden") {
          setFormError(participantData.requests.errors.request.forbidden);
        } else {
          setFormError(err.message);
        }
      } else {
        setFormError(participantData.requests.errorTitle);
      }
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(request) {
    if (request.status !== "Pending") {
      return;
    }
    if (!window.confirm(participantData.requests.deleteConfirm)) {
      return;
    }
    setDeleting((prev) => ({ ...prev, [request.requestId]: true }));
    try {
      await deleteRequest(request.requestId);
      load();
    } catch {
      // errors shown via reload/state if needed
    } finally {
      setDeleting((prev) => {
        const next = { ...prev };
        delete next[request.requestId];
        return next;
      });
    }
  }

  function statusClass(statusValue) {
    const s = String(statusValue || "").toLowerCase();
    if (s === "pending") {
      return "status-pending";
    }
    if (s === "in progress" || s === "in-progress") {
      return "status-progress";
    }
    if (s === "resolved") {
      return "status-resolved";
    }
    if (s === "rejected") {
      return "status-rejected";
    }
    return "status-unknown";
  }

  return (
    <div className="participant-requests" ref={pageRef}>
      <header className="participant-requests-header" data-reveal-item>
        <div>
          <p className="eyebrow">{participantData.requests.title}</p>
          <h2 className="participant-requests-title">{participantData.requests.subtitle}</h2>
        </div>
        <div className="participant-requests-header-actions">
          <span className="participant-hub-indicator">
            {hubPushedEvent
              ? participantData.requests.realtime.indicatorLive
              : participantData.requests.realtime.indicatorAuto}
          </span>
          <button
            type="button"
            className="btn participant-refresh"
            onClick={() => {
              const controller = new AbortController();
              load(controller.signal);
            }}
          >
            {participantData.requests.refresh}
          </button>
        </div>
      </header>

      <section className="participant-card" data-reveal-item>
        <header className="participant-card-header">
          <h3 className="participant-card-title">{participantData.requests.createTitle}</h3>
        </header>
        <form className="participant-request-form" onSubmit={handleCreate} noValidate>
          <div className="participant-form-row">
            <label className="participant-form-label" htmlFor="request-type">
              {participantData.requests.typeLabel}
            </label>
            <select
              id="request-type"
              className="participant-select"
              value={type}
              onChange={(e) => setType(e.target.value)}
              disabled={creating}
            >
              {participantData.requests.types.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div className="participant-form-row">
            <label className="participant-form-label" htmlFor="request-message">
              {participantData.requests.messageLabel}
            </label>
            <textarea
              id="request-message"
              className="participant-textarea"
              rows={4}
              placeholder={participantData.requests.messagePlaceholder}
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                setFormError("");
              }}
              disabled={creating}
              maxLength={messageMax}
            />
            <div className="participant-form-hint">
              {message.trim().length}/{messageMax} • {participantData.requests.messageLengthNote}
            </div>
            {formError ? (
              <p className="participant-question-error" role="alert">
                {formError}
              </p>
            ) : null}
          </div>
          <button type="submit" className="btn" disabled={creating}>
            {creating ? participantData.requests.submitting : participantData.requests.submit}
          </button>
        </form>
      </section>

      <section className="participant-card" data-reveal-item>
        <header className="participant-card-header">
          <h3 className="participant-card-title">{participantData.requests.listTitle}</h3>
        </header>
        {status === "loading" && (
          <div className="participant-state" role="status">
            <span className="team-state-spinner" aria-hidden="true" />
            <p>{participantData.requests.loading}</p>
          </div>
        )}
        {status === "error" && (
          <div className="participant-state participant-state--error" role="alert">
            <p className="participant-state-title">{participantData.requests.errorTitle}</p>
            <p className="participant-state-text">{error}</p>
            <button
              type="button"
              className="btn"
              onClick={() => {
                const controller = new AbortController();
                load(controller.signal);
              }}
            >
              {participantData.requests.retry}
            </button>
          </div>
        )}
        {status === "ready" && requests.length === 0 && (
          <p className="participant-muted">{participantData.requests.empty}</p>
        )}
        {status === "ready" && requests.length > 0 && (
          <ul className="participant-request-list">
            {requests.map((req) => (
              <li className="participant-request-item" key={req.requestId}>
                <div className="participant-request-item-header">
                  <div>
                    <p className="participant-request-type">{req.type}</p>
                    <p className="participant-request-meta">
                      {participantData.requests.createdAt}: {formatDate(req.createdAt)}
                    </p>
                    {req.resolvedAt ? (
                      <p className="participant-request-meta">
                        {participantData.requests.resolvedAt}: {formatDate(req.resolvedAt)}
                      </p>
                    ) : null}
                  </div>
                  <span className={`participant-request-status ${statusClass(req.status)}`}>
                    {req.status || "—"}
                  </span>
                </div>
                <p className="participant-request-message">{req.message}</p>
                {req.status === "Pending" ? (
                  <div className="participant-request-actions">
                    <button
                      type="button"
                      className="participant-delete"
                      onClick={() => handleDelete(req)}
                      disabled={Boolean(deleting[req.requestId])}
                    >
                      {deleting[req.requestId]
                        ? participantData.requests.deleting
                        : participantData.requests.delete}
                    </button>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
