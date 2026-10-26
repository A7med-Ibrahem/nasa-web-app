import "./TeamRosterDetail.css";

import { staffData } from "../../../data/staffData";

import {
  ArrowLeftIcon,
  ExternalLinkIcon,
  TeamIcon,
} from "../../common/Icons/Icons";
import DataState from "../../common/DataState/DataState";
import StatusBadge from "../StatusBadge/StatusBadge";

function textValue(value) {
  return typeof value === "string" ? value.trim() : "";
}

function safeExternalUrl(value) {
  const candidate = textValue(value);
  if (!candidate) {
    return null;
  }

  try {
    const url = new URL(candidate);
    return url.protocol === "http:" || url.protocol === "https:"
      ? url.href
      : null;
  } catch {
    return null;
  }
}

/**
 * Selected team's roster, challenge and project.
 *
 * Every value comes from `GET /teams/{teamId}` and
 * `GET /teams/{teamId}/students`. When the students request fails, the minimal
 * student list nested in the team payload is still shown so the page never
 * substitutes example people; the failure is reported above it.
 */
export default function TeamRosterDetail({
  team,
  status,
  error,
  students,
  studentsStatus,
  challengeStatus,
  onRetry,
  onBack,
}) {
  const copy = staffData.teams;
  const backButton = (
    <button type="button" className="staff-roster-back" onClick={onBack}>
      <ArrowLeftIcon size={16} />
      {copy.detail.back}
    </button>
  );

  if (status === "idle") {
    return (
      <aside
        className="staff-roster-detail"
        aria-labelledby="staff-roster-detail-title"
      >
        {backButton}
        <h3 className="visually-hidden" id="staff-roster-detail-title">
          {copy.detail.title}
        </h3>
        <div className="staff-roster-detail-empty">
          <span className="staff-roster-detail-empty-icon" aria-hidden="true">
            <TeamIcon size={24} />
          </span>
          <p className="staff-roster-detail-empty-title">
            {copy.detail.selectTitle}
          </p>
          <p className="staff-roster-detail-empty-text">
            {copy.detail.selectText}
          </p>
        </div>
      </aside>
    );
  }

  if (status === "loading") {
    return (
      <aside
        className="staff-roster-detail"
        aria-labelledby="staff-roster-detail-title"
      >
        {backButton}
        <h3 className="visually-hidden" id="staff-roster-detail-title">
          {copy.detail.title}
        </h3>
        <DataState
          status="loading"
          title={copy.detail.loading}
          tone="dark"
          compact
        />
      </aside>
    );
  }

  if (status === "error") {
    return (
      <aside
        className="staff-roster-detail"
        aria-labelledby="staff-roster-detail-title"
      >
        {backButton}
        <h3 className="visually-hidden" id="staff-roster-detail-title">
          {copy.detail.title}
        </h3>
        <DataState
          status="error"
          title={copy.detail.errorTitle}
          message={error}
          retryLabel={staffData.common.retry}
          onRetry={onRetry}
          tone="dark"
          compact
        />
      </aside>
    );
  }

  const name = textValue(team?.name) || copy.detail.fallbackName;
  const initials = name.slice(0, 1).toUpperCase();
  const username = textValue(team?.username) || staffData.common.dash;

  const challenge =
    team?.challenge && typeof team.challenge === "object"
      ? team.challenge
      : null;
  const challengeTitle = textValue(challenge?.title);
  const challengeDescription = textValue(challenge?.description);
  const challengeSource = textValue(challenge?.source);
  const challengeSeason = textValue(challenge?.season);
  const challengeMeta = [challengeSource, challengeSeason].filter(Boolean);

  const projectTitle = textValue(team?.project?.title);
  const projectDescription = textValue(team?.project?.description);
  const repositoryUrl = safeExternalUrl(team?.project?.repositoryLink);
  const demoUrl = safeExternalUrl(team?.project?.demoLink);
  const hasProject =
    Boolean(projectTitle || projectDescription || repositoryUrl || demoUrl);

  const roster = Array.isArray(students) ? students : [];
  const nestedStudents = Array.isArray(team?.students) ? team.students : [];
  const studentRows = roster.length > 0 ? roster : nestedStudents;
  const hasStudents = studentRows.length > 0;

  return (
    <aside
      className="staff-roster-detail"
      aria-labelledby="staff-roster-detail-title"
    >
      {backButton}

      <h3 className="visually-hidden" id="staff-roster-detail-title">
        {copy.detail.title}
      </h3>

      <div className="staff-roster-detail-head">
        <span className="staff-roster-detail-avatar" aria-hidden="true">
          {initials}
        </span>
        <div className="staff-roster-detail-identity">
          <p className="staff-roster-detail-name">{name}</p>
          <p className="staff-roster-detail-team">
            {team?.teamId != null
              ? `${copy.detail.teamId} #${team.teamId}`
              : copy.detail.teamId}
          </p>
        </div>
      </div>

      <dl className="staff-roster-facts">
        <div className="staff-roster-fact">
          <dt>{copy.detail.username}</dt>
          <dd>{username}</dd>
        </div>
        <div className="staff-roster-fact">
          <dt>{copy.detail.status}</dt>
          <dd>
            <StatusBadge status={team?.status} />
          </dd>
        </div>
      </dl>

      <section
        className="staff-roster-section"
        aria-labelledby="staff-roster-challenge-title"
      >
        <h4
          className="staff-roster-section-title"
          id="staff-roster-challenge-title"
        >
          {copy.detail.challenge}
        </h4>

        {challengeStatus === "loading" ? (
          <p className="staff-roster-muted" role="status" aria-live="polite">
            {staffData.common.loading}
          </p>
        ) : null}

        {challengeStatus === "ready" && challenge ? (
          <div className="staff-roster-challenge">
            <p className="staff-roster-challenge-title">
              {challengeTitle || `#${challenge.challengeId ?? "—"}`}
            </p>
            {challengeMeta.length > 0 ? (
              <p className="staff-roster-challenge-meta">
                {challengeMeta.join(" · ")}
              </p>
            ) : null}
            {challengeDescription ? (
              <p className="staff-roster-text">{challengeDescription}</p>
            ) : null}
          </div>
        ) : null}

        {challengeStatus !== "loading" && challengeStatus !== "ready" ? (
          <p className="staff-roster-muted">{copy.detail.challengeEmpty}</p>
        ) : null}
      </section>

      <section
        className="staff-roster-section"
        aria-labelledby="staff-roster-project-title"
      >
        <h4
          className="staff-roster-section-title"
          id="staff-roster-project-title"
        >
          {copy.detail.project}
        </h4>

        {hasProject ? (
          <div className="staff-roster-project">
            {projectTitle ? (
              <p className="staff-roster-project-name">{projectTitle}</p>
            ) : null}
            {projectDescription ? (
              <p className="staff-roster-text">{projectDescription}</p>
            ) : null}
            {repositoryUrl || demoUrl ? (
              <div className="staff-roster-project-links">
                {repositoryUrl ? (
                  <a
                    className="staff-roster-link"
                    href={repositoryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {copy.detail.repository}
                    <ExternalLinkIcon size={14} />
                    <span className="visually-hidden">
                      {" "}
                      ({copy.detail.linkHint})
                    </span>
                  </a>
                ) : null}
                {demoUrl ? (
                  <a
                    className="staff-roster-link"
                    href={demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {copy.detail.demo}
                    <ExternalLinkIcon size={14} />
                    <span className="visually-hidden">
                      {" "}
                      ({copy.detail.linkHint})
                    </span>
                  </a>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : (
          <p className="staff-roster-muted">{copy.detail.projectEmpty}</p>
        )}
      </section>

      <section
        className="staff-roster-section staff-roster-students"
        aria-labelledby="staff-roster-students-title"
      >
        <div className="staff-roster-section-head">
          <h4
            className="staff-roster-section-title"
            id="staff-roster-students-title"
          >
            {copy.detail.students}
          </h4>
          {studentsStatus === "ready" && hasStudents ? (
            <span className="staff-roster-students-count">
              {copy.detail.studentsCount(studentRows.length)}
            </span>
          ) : null}
        </div>

        {studentsStatus === "loading" ? (
          <p className="staff-roster-muted" role="status" aria-live="polite">
            {copy.detail.studentsLoading}
          </p>
        ) : null}

        {studentsStatus === "error" ? (
          <p className="staff-roster-muted staff-roster-muted--error" role="alert">
            {copy.detail.studentsError}
          </p>
        ) : null}

        {studentsStatus === "ready" && !hasStudents ? (
          <p className="staff-roster-muted">{copy.detail.studentsEmpty}</p>
        ) : null}

        {hasStudents && studentsStatus !== "loading" ? (
          <>
            <div className="staff-roster-students-table-wrap">
              <table className="staff-roster-students-table">
                <caption className="visually-hidden">
                  {copy.detail.studentsCaption}
                </caption>
                <thead>
                  <tr>
                    <th scope="col">{copy.detail.columns.name}</th>
                    <th scope="col">{copy.detail.columns.status}</th>
                    <th scope="col">{copy.detail.columns.email}</th>
                    <th scope="col">{copy.detail.columns.contact}</th>
                  </tr>
                </thead>
                <tbody>
                  {studentRows.map((student, index) => {
                    const studentName =
                      textValue(student?.name) ||
                      copy.detail.fallbackStudent;
                    return (
                      <tr
                        key={
                          student?.studentId ??
                          `${studentName}-${index}`
                        }
                      >
                        <th scope="row">{studentName}</th>
                        <td>
                          <StatusBadge status={student?.status} />
                        </td>
                        <td>
                          {textValue(student?.email) || staffData.common.dash}
                        </td>
                        <td>
                          {textValue(student?.contact) ||
                            staffData.common.dash}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <ul className="staff-roster-student-cards">
              {studentRows.map((student, index) => {
                const studentName =
                  textValue(student?.name) ||
                  copy.detail.fallbackStudent;
                return (
                  <li
                    className="staff-roster-student-card"
                    key={student?.studentId ?? `${studentName}-${index}`}
                  >
                    <div className="staff-roster-student-card-head">
                      <span className="staff-roster-student-card-name">
                        {studentName}
                      </span>
                      <StatusBadge status={student?.status} />
                    </div>
                    <dl className="staff-roster-student-card-facts">
                      <div>
                        <dt>{copy.detail.columns.email}</dt>
                        <dd>
                          {textValue(student?.email) ||
                            staffData.common.dash}
                        </dd>
                      </div>
                      <div>
                        <dt>{copy.detail.columns.contact}</dt>
                        <dd>
                          {textValue(student?.contact) ||
                            staffData.common.dash}
                        </dd>
                      </div>
                    </dl>
                  </li>
                );
              })}
            </ul>
          </>
        ) : null}
      </section>
    </aside>
  );
}
