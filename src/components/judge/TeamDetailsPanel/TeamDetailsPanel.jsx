import { Link } from "react-router-dom";
import "./TeamDetailsPanel.css";

import { judgeDashboard } from "../../../data/judgeDashboard";
import {
  ArrowRightIcon,
  ExternalLinkIcon,
  ScaleIcon,
  TeamIcon,
} from "../../common/Icons/Icons";

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
 * Team details panel (right column of the Judge Dashboard).
 *
 * Renders only what `GET /teams/{teamId}` actually returns: identifier, name,
 * username, status, the nested `challenge`, the optional `project`, and the
 * student names. Missing project fields are omitted, and external project
 * links are only emitted when they are valid http(s) URLs.
 *
 * The member count shown is `members.length` — derived from the returned
 * array, not from a `memberCount` field or any other invention.
 */
export default function TeamDetailsPanel({
  team,
  status,
  error,
  members,
  membersStatus,
  memberCount,
  challenge,
  challengeStatus,
}) {
  const { details } = judgeDashboard;

  if (status === "idle") {
    return (
      <aside className="team-details" aria-labelledby="team-details-title" data-reveal-item>
        <h2 className="team-details-title" id="team-details-title">
          {details.title}
        </h2>
        <div className="team-details-empty">
          <span className="team-details-empty-icon" aria-hidden="true">
            <TeamIcon size={22} />
          </span>
          <p className="team-details-empty-title">{details.selectPromptTitle}</p>
          <p className="team-details-empty-text">{details.selectPromptText}</p>
        </div>
      </aside>
    );
  }

  if (status === "loading") {
    return (
      <aside className="team-details" aria-labelledby="team-details-title" data-reveal-item>
        <h2 className="team-details-title" id="team-details-title">
          {details.title}
        </h2>
        <div className="team-details-empty" role="status" aria-live="polite">
          <span className="team-state-spinner" aria-hidden="true" />
          <p className="team-details-empty-text">{details.loading}</p>
        </div>
      </aside>
    );
  }

  if (status === "error") {
    return (
      <aside className="team-details" aria-labelledby="team-details-title" data-reveal-item>
        <h2 className="team-details-title" id="team-details-title">
          {details.title}
        </h2>
        <div className="team-details-empty" role="alert">
          <p className="team-details-empty-title">{details.errorTitle}</p>
          <p className="team-details-empty-text">{error}</p>
        </div>
      </aside>
    );
  }

  const name = team?.name?.trim() || judgeDashboard.table.fallbackName;
  const initials = name.slice(0, 1).toUpperCase();

  const projectTitle = textValue(team?.project?.title);
  const projectDescription = textValue(team?.project?.description);
  const repositoryUrl = safeExternalUrl(team?.project?.repositoryLink);
  const demoUrl = safeExternalUrl(team?.project?.demoLink);
  const hasProject =
    Boolean(projectTitle || projectDescription || repositoryUrl || demoUrl);

  return (
    <aside className="team-details" aria-labelledby="team-details-title" data-reveal-item>
      <h2 className="visually-hidden" id="team-details-title">
        {details.title}
      </h2>

      {/* ---------- Identity ---------- */}
      <div className="team-details-header">
        <span className="team-details-avatar" aria-hidden="true">
          {initials}
        </span>
        <div className="team-details-identity">
          <h3 className="team-details-name">{name}</h3>
          <p className="team-details-sub">
            <span className="team-details-id">
              {details.teamIdLabel} #{team?.teamId ?? "—"}
            </span>
            {team?.status ? (
              <span className="team-table-status">{team.status}</span>
            ) : null}
          </p>
        </div>
      </div>

      {/* ---------- Key/value facts (only real fields) ---------- */}
      <dl className="team-details-facts">
        <div className="team-details-fact">
          <dt>{details.usernameLabel}</dt>
          <dd>{team?.username?.trim() || judgeDashboard.table.fallbackUsername}</dd>
        </div>

        <div className="team-details-fact">
          <dt>{details.challengeLabel}</dt>
          <dd>
            {challengeStatus === "ready" && challenge ? (
              <span className="team-details-challenge">
                <span className="team-details-challenge-title">
                  {challenge.title || `#${challenge.challengeId}`}
                </span>
                {challenge.source || challenge.season ? (
                  <span className="team-details-challenge-source">
                    {[challenge.source, challenge.season]
                      .filter((value) => typeof value === "string" && value.trim())
                      .join(" · ")}
                  </span>
                ) : null}
                {challenge.description ? (
                  <span className="team-details-challenge-description">
                    {challenge.description}
                  </span>
                ) : null}
              </span>
            ) : challengeStatus === "loading" ? (
              <span className="team-details-muted">{details.challengeLoading}</span>
            ) : (
              <span className="team-details-muted">{details.challengeUnavailable}</span>
            )}
          </dd>
        </div>
      </dl>

      {/* ---------- Project ---------- */}
      {hasProject && (
        <section
          className="team-details-project"
          aria-labelledby="team-details-project-title"
        >
          <h4
            className="team-details-project-title"
            id="team-details-project-title"
          >
            {details.projectTitle}
          </h4>

          {projectTitle ? (
            <p className="team-details-project-name">{projectTitle}</p>
          ) : null}

          {projectDescription ? (
            <p className="team-details-project-description">{projectDescription}</p>
          ) : null}

          {(repositoryUrl || demoUrl) && (
            <div className="team-details-project-links">
              {repositoryUrl ? (
                <a
                  className="team-details-project-link"
                  href={repositoryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {details.projectRepository}
                  <ExternalLinkIcon size={14} />
                  <span className="visually-hidden">
                    {" "}
                    ({details.projectLinkHint})
                  </span>
                </a>
              ) : null}

              {demoUrl ? (
                <a
                  className="team-details-project-link"
                  href={demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {details.projectDemo}
                  <ExternalLinkIcon size={14} />
                  <span className="visually-hidden">
                    {" "}
                    ({details.projectLinkHint})
                  </span>
                </a>
              ) : null}
            </div>
          )}
        </section>
      )}

      {/* ---------- Members ---------- */}
      <div className="team-details-members">
        <div className="team-details-members-head">
          <h4 className="team-details-members-title">{details.membersTitle}</h4>
          {memberCount !== null && (
            <span className="team-details-members-count">
              {details.membersCount(memberCount)}
            </span>
          )}
        </div>

        {membersStatus === "loading" && (
          <p className="team-details-muted" role="status" aria-live="polite">
            {details.membersLoading}
          </p>
        )}

        {membersStatus === "error" && (
          <p className="team-details-muted team-details-muted--error" role="alert">
            {details.membersError}
          </p>
        )}

        {membersStatus === "ready" && members.length === 0 && (
          <p className="team-details-muted">{details.membersEmpty}</p>
        )}

        {membersStatus === "ready" && members.length > 0 && (
          <ul className="team-details-member-list">
            {members.map((member, index) => {
              const memberName = member?.name?.trim() || details.memberFallback;
              return (
                <li className="team-details-member" key={member?.studentId ?? index}>
                  <span className="team-details-member-avatar" aria-hidden="true">
                    {memberName.slice(0, 1).toUpperCase()}
                  </span>
                  <span className="team-details-member-body">
                    <span className="team-details-member-name">{memberName}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* ---------- Judging action ---------- */}
      <div className="team-details-actions">
        <Link
          className="btn team-details-cta"
          to={`/judge/teams/${team?.teamId}/evaluate`}
        >
          <ScaleIcon size={17} />
          {details.startJudging}
          <ArrowRightIcon size={16} />
        </Link>
        <p className="team-details-cta-hint">{details.startJudgingHint}</p>
      </div>
    </aside>
  );
}
