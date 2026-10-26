import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "./TeamDetails.css";

import { fetchTeamPublic, getTeamChallengeId, parseTeamId } from "../../api/teams";
import DataState from "../../components/common/DataState/DataState";
import {
  ArrowLeftIcon,
  ExternalLinkIcon,
  PlanetIcon,
} from "../../components/common/Icons/Icons";
import { teamDetailsPage } from "../../data/publicPagesData";
import { site } from "../../data/site";
import useApiResource from "../../hooks/useApiResource";
import { isHttpUrl, splitParagraphs } from "../../utils/apiContent";
import { toImageSrc } from "../../utils/image";
import { getInitials } from "../../utils/initials";

function TeamNotFound() {
  const { title, description, action } = teamDetailsPage.notFound;

  return (
    <div className="team-details-page">
      <div className="team-details-notfound">
        <div className="container team-details-notfound-inner">
          <h1 className="team-details-notfound-title">{title}</h1>

          <p className="team-details-notfound-description">{description}</p>

          <Link className="btn btn--primary" to={action.href}>
            <ArrowLeftIcon size={16} />
            {action.label}
          </Link>
        </div>
      </div>
    </div>
  );
}

function TeamHeader({ team }) {
  const { name, logo, status } = team;
  const [imageFailed, setImageFailed] = useState(false);

  const imageSrc = toImageSrc(logo);
  const statusText = typeof status === "string" ? status.trim() : "";
  const showStatus = statusText !== "" && statusText.toLowerCase() !== "active";

  return (
    <header className="team-details-header">
      <span className="team-details-logo-frame">
        {imageSrc && !imageFailed ? (
          <img
            className="team-details-logo"
            src={imageSrc}
            alt=""
            loading="lazy"
            decoding="async"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <span className="team-details-initials" aria-hidden="true">
            {getInitials(name)}
          </span>
        )}
      </span>

      <div className="team-details-heading-group">
        <p className="eyebrow team-details-eyebrow">
          {teamDetailsPage.eyebrow}
        </p>

        <h1 className="team-details-title">{name}</h1>

        {showStatus ? (
          <span className="team-details-status">{statusText}</span>
        ) : null}
      </div>
    </header>
  );
}

function TeamChallenge({ challenge }) {
  const { title, description, source, season, image } = challenge;
  const [imageFailed, setImageFailed] = useState(false);

  const imageSrc = toImageSrc(image);
  const paragraphs = splitParagraphs(description);
  const hasMeta = Boolean(source) || Boolean(season);

  if (!title && paragraphs.length === 0 && !hasMeta && !imageSrc) {
    return null;
  }

  return (
    <section
      className="team-details-block team-challenge"
      aria-labelledby="team-challenge-title"
    >
      <h2 id="team-challenge-title" className="team-details-block-title">
        {teamDetailsPage.sections.challenge}
      </h2>

      <div className="team-challenge-inner">
        <div className="team-challenge-media">
          {imageSrc && !imageFailed ? (
            <img
              className="team-challenge-image"
              src={imageSrc}
              alt=""
              loading="lazy"
              decoding="async"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <div className="team-challenge-placeholder" aria-hidden="true">
              <PlanetIcon size={34} />
            </div>
          )}
        </div>

        <div className="team-challenge-body">
          {title ? <h3 className="team-challenge-title">{title}</h3> : null}

          {paragraphs.length > 0 ? (
            <div className="team-details-prose">
              {paragraphs.map((paragraph, index) => (
                <p key={`team-challenge-paragraph-${index}`}>{paragraph}</p>
              ))}
            </div>
          ) : null}

          {hasMeta ? (
            <dl className="team-details-meta">
              {source ? (
                <div className="team-details-meta-item">
                  <dt>{teamDetailsPage.labels.source}</dt>
                  <dd>{source}</dd>
                </div>
              ) : null}

              {season ? (
                <div className="team-details-meta-item">
                  <dt>{teamDetailsPage.labels.season}</dt>
                  <dd>{season}</dd>
                </div>
              ) : null}
            </dl>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function TeamProject({ project }) {
  const { title, description, repositoryLink, demoLink } = project;

  const paragraphs = splitParagraphs(description);
  const repositoryUrl = isHttpUrl(repositoryLink)
    ? repositoryLink.trim()
    : null;
  const demoUrl = isHttpUrl(demoLink) ? demoLink.trim() : null;

  if (
    !title &&
    paragraphs.length === 0 &&
    !repositoryUrl &&
    !demoUrl
  ) {
    return null;
  }

  return (
    <section
      className="team-details-block team-project"
      aria-labelledby="team-project-title"
    >
      <h2 id="team-project-title" className="team-details-block-title">
        {teamDetailsPage.sections.project}
      </h2>

      {title ? <h3 className="team-project-title">{title}</h3> : null}

      {paragraphs.length > 0 ? (
        <div className="team-details-prose">
          {paragraphs.map((paragraph, index) => (
            <p key={`team-project-paragraph-${index}`}>{paragraph}</p>
          ))}
        </div>
      ) : null}

      {repositoryUrl || demoUrl ? (
        <div className="team-project-links">
          {repositoryUrl ? (
            <a
              className="btn btn--ghost-dark"
              href={repositoryUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {teamDetailsPage.labels.repository}
              <ExternalLinkIcon size={16} />
              <span className="visually-hidden">
                {teamDetailsPage.newTabHint}
              </span>
            </a>
          ) : null}

          {demoUrl ? (
            <a
              className="btn btn--ghost-dark"
              href={demoUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {teamDetailsPage.labels.demo}
              <ExternalLinkIcon size={16} />
              <span className="visually-hidden">
                {teamDetailsPage.newTabHint}
              </span>
            </a>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

function TeamMembers({ members }) {
  if (members.length === 0) {
    return null;
  }

  return (
    <section
      className="team-details-block team-members"
      aria-labelledby="team-members-title"
    >
      <h2 id="team-members-title" className="team-details-block-title">
        {teamDetailsPage.sections.members}
      </h2>

      <ul className="team-members-list">
        {members.map((member, index) => {
          const statusText =
            typeof member.status === "string" ? member.status.trim() : "";
          const showStatus =
            statusText !== "" && statusText.toLowerCase() !== "active";

          return (
            <li className="team-member" key={member.studentId ?? `member-${index}`}>
              <span className="team-member-avatar" aria-hidden="true">
                {getInitials(member.name)}
              </span>

              <span className="team-member-body">
                <span className="team-member-name">{member.name}</span>
                {showStatus ? (
                  <span className="team-member-status">{statusText}</span>
                ) : null}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/** A renderable team needs a name; every other block is optional. */
function isTeamRecord(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    typeof value.name === "string" &&
    value.name.trim() !== ""
  );
}

/**
 * Public team profile (`/teams/:teamId`).
 *
 * GET /teams/{teamId} is the only data source. The route id is validated
 * locally before any request, and an invalid id or a real 404 shows the same
 * in-page "Team not found" state. The challenge block is only rendered when the
 * team has a usable challenge link; every other empty block is omitted.
 */
export default function TeamDetails() {
  const { teamId } = useParams();
  const parsedId = parseTeamId(teamId);

  const loadTeam = useCallback(
    (options = {}) => fetchTeamPublic(parsedId, options),
    [parsedId],
  );

  const { status, data, error, retry } = useApiResource(loadTeam, {
    enabled: parsedId !== null,
  });

  const record = status === "ready" && isTeamRecord(data) ? data : null;
  const recordId = record ? parseTeamId(record.teamId) : null;
  const team = recordId !== null && recordId === parsedId ? record : null;

  const notFound =
    parsedId === null ||
    (status === "error" && error?.status === 404) ||
    (status === "ready" && (record === null || recordId === null));

  let documentName = "";
  if (team) {
    documentName = team.name;
  } else if (notFound) {
    documentName = teamDetailsPage.notFound.title;
  } else if (status === "error") {
    documentName = teamDetailsPage.states.errorTitle;
  }

  useEffect(() => {
    document.title = documentName ? `${documentName} — ${site.name}` : site.name;
  }, [documentName]);

  if (notFound) {
    return <TeamNotFound />;
  }

  if (status === "error") {
    return (
      <div className="team-details-page">
        <div className="container team-details-state">
          <DataState
            status="error"
            title={teamDetailsPage.states.errorTitle}
            message={error?.message}
            retryLabel={teamDetailsPage.states.retry}
            onRetry={retry}
          />
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="team-details-page">
        <div className="container team-details-state">
          <DataState
            status="loading"
            title={teamDetailsPage.states.loading}
          />
        </div>
      </div>
    );
  }

  const challengeId = getTeamChallengeId(team);
  const challenge =
    challengeId !== null &&
    team.challenge &&
    typeof team.challenge === "object"
      ? team.challenge
      : null;

  const project =
    team.project && typeof team.project === "object" ? team.project : null;

  const members = Array.isArray(team.students)
    ? team.students.filter(
        (member) =>
          member &&
          typeof member === "object" &&
          typeof member.name === "string" &&
          member.name.trim() !== "",
      )
    : [];

  const hasMembers = members.length > 0;

  return (
    <div className="team-details-page" key={team.teamId}>
      <div className="container team-details-shell">
        <TeamHeader team={team} />

        <div
          className={`team-details-layout${
            hasMembers ? "" : " team-details-layout--single"
          }`}
        >
          <div className="team-details-main">
            {challenge ? (
              <TeamChallenge challenge={challenge} />
            ) : null}

            {project ? <TeamProject project={project} /> : null}
          </div>

          {hasMembers ? (
            <aside
              className="team-details-aside"
              aria-labelledby="team-members-title"
            >
              <TeamMembers members={members} />
            </aside>
          ) : null}
        </div>
      </div>
    </div>
  );
}
