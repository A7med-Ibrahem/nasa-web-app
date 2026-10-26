import { useEffect, useMemo, useRef, useState } from "react";
import "./StaffAttendanceRecords.css";

import { fetchAttendanceRecords } from "../../api/staffArea";
import { staffData } from "../../data/staffData";
import { site } from "../../data/site";
import useTeamOptions from "../../hooks/useTeamOptions";
import { formatDateTime, formatEventDate } from "../../utils/dates";
import { toCsv } from "../../utils/staffCsv";
import { loadError } from "../../utils/staffErrors";
import { canonicalAttendanceStatus } from "../../utils/staffStatus";

import DataState from "../../components/common/DataState/DataState";
import AttendanceTable from "../../components/staff/AttendanceTable/AttendanceTable";
import StaffField from "../../components/staff/StaffField/StaffField";
import StaffPageHeader from "../../components/staff/StaffPageHeader/StaffPageHeader";
import StaffSummary from "../../components/staff/StaffSummary/StaffSummary";

const EMPTY_FILTERS = { eventDate: "", teamId: "", status: "" };

function newestFirst(a, b) {
  const aDate = new Date(a.eventDate || 0).getTime();
  const bDate = new Date(b.eventDate || 0).getTime();
  if (aDate !== bDate) {
    return bDate - aDate;
  }

  const aTime = new Date(a.timestamp || 0).getTime();
  const bTime = new Date(b.timestamp || 0).getTime();
  return bTime - aTime;
}

export default function StaffAttendanceRecords() {
  const copy = staffData.attendance;

  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [records, setRecords] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  const mountedRef = useRef(true);
  const requestIdRef = useRef(0);

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
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const runId = requestIdRef.current + 1;
    requestIdRef.current = runId;

    fetchAttendanceRecords({
      teamId: filters.teamId,
      eventDate: filters.eventDate,
      status: filters.status,
      signal: controller.signal,
    })
      .then((result) => {
        if (
          !mountedRef.current ||
          controller.signal.aborted ||
          runId !== requestIdRef.current
        ) {
          return;
        }

        const list = Array.isArray(result) ? result : [];
        list.sort(newestFirst);
        setRecords(list);
        setStatus("ready");
        setError("");
      })
      .catch((cause) => {
        if (
          !mountedRef.current ||
          cause?.name === "AbortError" ||
          controller.signal.aborted ||
          runId !== requestIdRef.current
        ) {
          return;
        }

        setStatus("error");
        setError(loadError(cause, copy.states.errorTitle));
      });

    return () => controller.abort();
  }, [
    copy.states.errorTitle,
    filters.eventDate,
    filters.status,
    filters.teamId,
    attempt,
  ]);

  const teamNames = useMemo(() => {
    const map = new Map();
    teams.forEach((team) => {
      map.set(
        String(team.teamId),
        team.name || team.teamName || copy.teamFallback(team.teamId),
      );
    });
    return map;
  }, [copy, teams]);

  const rows = useMemo(
    () =>
      records.map((record, index) => ({
        ...record,
        key:
          record.attendanceId ??
          `${record.studentId ?? "student"}-${
            record.eventDate ?? "date"
          }-${index}`,
        teamName:
          teamNames.get(String(record.teamId)) ||
          copy.teamFallback(record.teamId),
      })),
    [copy, records, teamNames],
  );

  const counts = useMemo(() => {
    const next = { Present: 0, Late: 0, Absent: 0, total: records.length };

    records.forEach((record) => {
      const value = canonicalAttendanceStatus(record.status);
      if (value) {
        next[value] += 1;
      }
    });

    return next;
  }, [records]);

  const summaryItems = [
    { key: "present", label: copy.summary.present, value: counts.Present, tone: "present" },
    { key: "late", label: copy.summary.late, value: counts.Late, tone: "late" },
    { key: "absent", label: copy.summary.absent, value: counts.Absent, tone: "absent" },
    { key: "total", label: copy.summary.total, value: counts.total, tone: "neutral" },
  ];

  function updateFilter(key, value) {
    setFilters((current) => ({ ...current, [key]: value }));
    setRecords([]);
    setStatus("loading");
    setError("");
  }

  function handleRetry() {
    setStatus("loading");
    setError("");
    setAttempt((current) => current + 1);
  }

  function handleExport() {
    if (rows.length === 0) {
      return;
    }

    const headers = [
      copy.table.student,
      copy.table.team,
      copy.table.date,
      copy.table.status,
      copy.table.markedBy,
      copy.table.timestamp,
    ];
    const body = rows.map((row) => [
      row.studentName || copy.studentFallback,
      row.teamName,
      formatEventDate(row.eventDate),
      row.status || staffData.common.dash,
      row.markedBy || staffData.common.dash,
      formatDateTime(row.timestamp),
    ]);
    const csv = toCsv(headers, body);
    const blob = new Blob([`\uFEFF${csv}`], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `${copy.exportFileName}${
      filters.eventDate ? `-${filters.eventDate}` : ""
    }.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="staff-attendance-records">
      <StaffPageHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
      >
        <span className="visually-hidden" id="staff-attendance-export-note">
          {copy.exportNote}
        </span>
        <button
          type="button"
          className="btn btn--ghost-dark staff-page-button"
          onClick={handleExport}
          disabled={status !== "ready" || rows.length === 0}
          aria-describedby="staff-attendance-export-note"
        >
          {copy.exportCsv}
        </button>
      </StaffPageHeader>

      <section className="staff-attendance-filter" aria-label={copy.filters.caption}>
        <div className="staff-attendance-filter-grid">
          <StaffField id="staff-attendance-date" label={copy.filters.date}>
            <input
              id="staff-attendance-date"
              type="date"
              value={filters.eventDate}
              onChange={(event) =>
                updateFilter("eventDate", event.target.value)
              }
            />
          </StaffField>

          <StaffField id="staff-attendance-team" label={copy.filters.team}>
            <select
              id="staff-attendance-team"
              value={filters.teamId}
              onChange={(event) => updateFilter("teamId", event.target.value)}
              disabled={teamsStatus !== "ready"}
            >
              <option value="">{copy.filters.allTeams}</option>
              {teams.map((team) => (
                <option key={team.teamId} value={team.teamId}>
                  {team.name || copy.teamFallback(team.teamId)}
                </option>
              ))}
            </select>
          </StaffField>

          <StaffField id="staff-attendance-status" label={copy.filters.status}>
            <select
              id="staff-attendance-status"
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
        label={copy.summaryLabel}
        ariaLabel={copy.summaryLabel}
        items={summaryItems}
        className="staff-attendance-summary"
      />

      <section className="staff-attendance-list" aria-label={copy.title}>
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

        {status === "ready" && rows.length === 0 ? (
          <DataState
            status="ready"
            title={copy.states.empty}
            tone="dark"
            compact
          />
        ) : null}

        {status === "ready" && rows.length > 0 ? (
          <AttendanceTable rows={rows} />
        ) : null}
      </section>
    </div>
  );
}
