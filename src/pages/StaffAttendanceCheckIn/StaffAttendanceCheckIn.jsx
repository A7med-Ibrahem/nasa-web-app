import { useEffect, useMemo, useRef, useState } from "react";
import "./StaffAttendanceCheckIn.css";

import { fetchAttendanceTeams, saveAttendance } from "../../api/staffArea";
import { staffData } from "../../data/staffData";
import { site } from "../../data/site";
import { todayLocalDate } from "../../utils/dates";
import { attendanceSaveError, loadError } from "../../utils/staffErrors";
import { canonicalAttendanceStatus } from "../../utils/staffStatus";

import DataState from "../../components/common/DataState/DataState";
import CheckInTeamCard from "../../components/staff/CheckInTeamCard/CheckInTeamCard";
import StaffField from "../../components/staff/StaffField/StaffField";
import StaffPageHeader from "../../components/staff/StaffPageHeader/StaffPageHeader";
import StaffSearch from "../../components/staff/StaffSearch/StaffSearch";
import StaffSummary from "../../components/staff/StaffSummary/StaffSummary";

const DEBOUNCE_MS = 350;

function teamStudents(team) {
  return Array.isArray(team?.students) ? team.students : [];
}

function isInactiveTeam(team) {
  return String(team?.status ?? "").trim().toLowerCase() === "inactive";
}

export default function StaffAttendanceCheckIn() {
  const copy = staffData.checkIn;

  const [eventDate, setEventDate] = useState(() => todayLocalDate());
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [hideInactive, setHideInactive] = useState(true);

  const [teams, setTeams] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  const [savedStatuses, setSavedStatuses] = useState({});
  const [drafts, setDrafts] = useState({});

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveResult, setSaveResult] = useState(null);
  const [reloadToken, setReloadToken] = useState(0);

  const mountedRef = useRef(true);
  const loadIdRef = useRef(0);
  const savedRef = useRef(savedStatuses);
  const draftsRef = useRef(drafts);

  useEffect(() => {
    document.title = `${copy.title} — ${site.name}`;
  }, [copy.title]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    savedRef.current = savedStatuses;
  }, [savedStatuses]);

  useEffect(() => {
    draftsRef.current = drafts;
  }, [drafts]);

  /* Search is debounced before it reaches the server; the last committed term
     is the only thing the fetch effect depends on. */
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput.trim());
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    const controller = new AbortController();
    const runId = loadIdRef.current + 1;
    loadIdRef.current = runId;

    fetchAttendanceTeams({
      search: searchTerm,
      eventDate,
      signal: controller.signal,
    })
      .then((result) => {
        if (
          !mountedRef.current ||
          controller.signal.aborted ||
          runId !== loadIdRef.current
        ) {
          return;
        }

        const rows = Array.isArray(result) ? result : [];
        const previousSaved = savedRef.current;
        const previousDrafts = draftsRef.current;
        const nextSaved = { ...previousSaved };
        const nextDrafts = { ...previousDrafts };

        rows.forEach((team) => {
          teamStudents(team).forEach((student) => {
            const studentId = student?.studentId;
            if (studentId === null || studentId === undefined) {
              return;
            }

            const savedStatus = student.attendanceStatus ?? null;
            const hasDraft = Object.prototype.hasOwnProperty.call(
              previousDrafts,
              studentId,
            );
            const draftStatus = hasDraft
              ? previousDrafts[studentId]
              : savedStatus;
            const isDirty =
              canonicalAttendanceStatus(draftStatus) !==
              canonicalAttendanceStatus(previousSaved[studentId]);

            nextDrafts[studentId] = isDirty ? draftStatus : savedStatus;
            nextSaved[studentId] = savedStatus;
          });
        });

        savedRef.current = nextSaved;
        draftsRef.current = nextDrafts;
        setSavedStatuses(nextSaved);
        setDrafts(nextDrafts);
        setTeams(rows);
        setStatus("ready");
        setError("");
      })
      .catch((cause) => {
        if (
          !mountedRef.current ||
          cause?.name === "AbortError" ||
          controller.signal.aborted ||
          runId !== loadIdRef.current
        ) {
          return;
        }

        setError(loadError(cause, copy.states.errorTitle));
        setStatus("error");
      });

    return () => controller.abort();
  }, [copy.states.errorTitle, eventDate, reloadToken, searchTerm]);

  const hasDirtyChanges = useMemo(() => {
    const ids = new Set([
      ...Object.keys(drafts),
      ...Object.keys(savedStatuses),
    ]);

    for (const id of ids) {
      if (
        canonicalAttendanceStatus(drafts[id]) &&
        canonicalAttendanceStatus(drafts[id]) !==
          canonicalAttendanceStatus(savedStatuses[id])
      ) {
        return true;
      }
    }

    return false;
  }, [drafts, savedStatuses]);

  useEffect(() => {
    if (!hasDirtyChanges) {
      return undefined;
    }

    function handleBeforeUnload(event) {
      event.preventDefault();
      event.returnValue = copy.beforeUnload;
      return copy.beforeUnload;
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [copy.beforeUnload, hasDirtyChanges]);

  const dirtyEntries = useMemo(() => {
    const ids = new Set([
      ...Object.keys(drafts),
      ...Object.keys(savedStatuses),
    ]);
    const entries = [];

    ids.forEach((id) => {
      const draftStatus = canonicalAttendanceStatus(drafts[id]);
      if (!draftStatus) {
        return;
      }
      if (draftStatus === canonicalAttendanceStatus(savedStatuses[id])) {
        return;
      }

      const numericId = Number(id);
      if (!Number.isInteger(numericId) || numericId <= 0) {
        return;
      }

      entries.push({ studentId: numericId, status: draftStatus });
    });

    return entries;
  }, [drafts, savedStatuses]);

  const visibleTeams = useMemo(
    () =>
      hideInactive
        ? teams.filter((team) => !isInactiveTeam(team))
        : teams,
    [hideInactive, teams],
  );

  const counts = useMemo(() => {
    const next = { Present: 0, Late: 0, Absent: 0, Unmarked: 0 };

    visibleTeams.forEach((team) => {
      teamStudents(team).forEach((student) => {
        const value = canonicalAttendanceStatus(
          drafts[student?.studentId] ?? student?.attendanceStatus,
        );
        next[value || "Unmarked"] += 1;
      });
    });

    return next;
  }, [drafts, visibleTeams]);

  const summaryItems = [
    { key: "present", label: copy.summary.present, value: counts.Present, tone: "present" },
    { key: "late", label: copy.summary.late, value: counts.Late, tone: "late" },
    { key: "absent", label: copy.summary.absent, value: counts.Absent, tone: "absent" },
    {
      key: "unmarked",
      label: copy.summary.unmarked,
      value: counts.Unmarked,
      tone: "neutral",
    },
  ];

  const visibleStudentIds = useMemo(
    () =>
      visibleTeams.flatMap((team) =>
        teamStudents(team)
          .map((student) => student?.studentId)
          .filter((id) => id !== null && id !== undefined),
      ),
    [visibleTeams],
  );

  function handleStatusChange(studentId, nextStatus) {
    if (studentId === null || studentId === undefined) {
      return;
    }

    setDrafts((current) => ({ ...current, [studentId]: nextStatus }));
    setSaveError("");
    setSaveResult(null);
  }

  function handleMarkAllPresent() {
    if (visibleStudentIds.length === 0 || saving) {
      return;
    }

    setDrafts((current) => {
      const next = { ...current };
      visibleStudentIds.forEach((studentId) => {
        next[studentId] = "Present";
      });
      return next;
    });
    setSaveError("");
    setSaveResult(null);
  }

  function handleDateChange(nextDate) {
    if (!nextDate || nextDate === eventDate) {
      return;
    }

    if (
      hasDirtyChanges &&
      !window.confirm(copy.confirmDateChange)
    ) {
      return;
    }

    setEventDate(nextDate);
    setTeams([]);
    setSavedStatuses({});
    setDrafts({});
    savedRef.current = {};
    draftsRef.current = {};
    setStatus("loading");
    setError("");
    setSaveError("");
    setSaveResult(null);
  }

  function handleRetry() {
    setStatus("loading");
    setError("");
    setReloadToken((current) => current + 1);
  }

  async function handleSave() {
    if (saving || dirtyEntries.length === 0) {
      return;
    }

    setSaving(true);
    setSaveError("");
    setSaveResult(null);

    try {
      const result = await saveAttendance({
        eventDate: `${eventDate}T00:00:00Z`,
        entries: dirtyEntries,
      });

      if (!mountedRef.current) {
        return;
      }

      const nextSaved = { ...savedRef.current };
      const nextDrafts = { ...draftsRef.current };
      dirtyEntries.forEach((entry) => {
        nextSaved[entry.studentId] = entry.status;
        nextDrafts[entry.studentId] = entry.status;
      });
      savedRef.current = nextSaved;
      draftsRef.current = nextDrafts;
      setSavedStatuses(nextSaved);
      setDrafts(nextDrafts);
      setSaveResult({
        updated: Number(result?.updated) || 0,
        created: Number(result?.created) || 0,
      });
    } catch (cause) {
      if (!mountedRef.current) {
        return;
      }
      setSaveError(attendanceSaveError(cause));
    } finally {
      if (mountedRef.current) {
        setSaving(false);
      }
    }
  }

  const emptyTitle =
    teams.length > 0 && visibleTeams.length === 0
      ? copy.states.emptyFiltered
      : copy.states.empty;

  return (
    <div className="staff-checkin">
      <StaffPageHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
      >
        <button
          type="button"
          className="btn btn--ghost-dark staff-page-button"
          onClick={handleMarkAllPresent}
          disabled={saving || visibleStudentIds.length === 0}
          title={copy.markAllHint}
        >
          {copy.markAll}
        </button>
      </StaffPageHeader>

      <section className="staff-checkin-filter" aria-label={copy.searchLabel}>
        <div className="staff-checkin-filter-grid">
          <StaffField id="staff-checkin-date" label={copy.dateLabel}>
            <input
              id="staff-checkin-date"
              type="date"
              value={eventDate}
              onChange={(event) => handleDateChange(event.target.value)}
              disabled={saving}
            />
          </StaffField>

          <StaffSearch
            id="staff-checkin-search"
            label={copy.searchLabel}
            placeholder={copy.searchPlaceholder}
            value={searchInput}
            onChange={setSearchInput}
            hint={copy.searchHint}
            disabled={saving}
          />

          <div className="staff-checkin-switch">
            <label
              className="staff-checkin-switch-control"
              htmlFor="staff-checkin-hide-inactive"
            >
              <input
                id="staff-checkin-hide-inactive"
                type="checkbox"
                checked={hideInactive}
                onChange={(event) => setHideInactive(event.target.checked)}
                disabled={saving}
              />
              <span>{copy.hideInactive}</span>
            </label>
            <p className="staff-field-hint">{copy.hideInactiveHint}</p>
          </div>
        </div>
      </section>

      <StaffSummary
        label={copy.summaryLabel}
        ariaLabel={copy.summaryLabel}
        items={summaryItems}
      />

      {saveResult ? (
        <p className="staff-checkin-result" role="status" aria-live="polite">
          {copy.saved(saveResult.updated, saveResult.created)}
        </p>
      ) : null}

      <section className="staff-checkin-list" aria-label={copy.title}>
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
            onRetry={handleRetry}
            tone="dark"
            compact
          />
        ) : null}

        {status === "ready" && visibleTeams.length === 0 ? (
          <DataState
            status="ready"
            title={emptyTitle}
            tone="dark"
            compact
          />
        ) : null}

        {status === "ready" && visibleTeams.length > 0 ? (
          <ul className="staff-checkin-teams">
            {visibleTeams.map((team) => (
              <CheckInTeamCard
                key={team.teamId}
                team={team}
                draftStatuses={drafts}
                savedStatuses={savedStatuses}
                onChange={handleStatusChange}
                disabled={saving}
              />
            ))}
          </ul>
        ) : null}
      </section>

      {dirtyEntries.length > 0 ? (
        <div className="staff-save-bar" role="region" aria-label={copy.title}>
          <div className="staff-save-bar-copy">
            <p className="staff-save-bar-count">
              {copy.saveLabel(dirtyEntries.length)}
            </p>
            <p className="staff-save-bar-hint">{copy.barHint}</p>
            {saveError ? (
              <p className="staff-save-bar-error" role="alert">
                {saveError}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            className="btn staff-save-button"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? copy.saving : copy.save}
          </button>
        </div>
      ) : null}
    </div>
  );
}
