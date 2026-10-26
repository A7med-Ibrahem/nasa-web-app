import { useEffect, useRef, useState } from "react";
import "./ParticipantDashboard.css";

import { ApiError } from "../../api/client";
import { fetchTeamPublic } from "../../api/teams";
import { useAuth } from "../../auth/useAuth";
import { participantData } from "../../data/participantData";
import { toImageSrc } from "../../utils/image";
import { useRevealGroup } from "../../hooks/useReveal";

import { ArrowRightIcon } from "../../components/common/Icons/Icons";
import { Link } from "react-router-dom";

function isHttpUrl(value) {
  return typeof value === "string" && /^https?:\/\//.test(value);
}

export default function ParticipantDashboard() {
  const { user } = useAuth();
  const pageRef = useRef(null);
  useRevealGroup(pageRef, { stagger: 80, rootMargin: "0px 0px -6% 0px" });

  const [team, setTeam] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  const teamId = user?.teamId ?? user?.team?.teamId ?? null;

  useEffect(() => {
    document.title = "My Team — NASA Space Apps Hurghada";
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    async function load() {
      if (!teamId) {
        setStatus("error");
        setError("No team associated with this account.");
        return;
      }
      setStatus("loading");
      setError("");
      try {
        const result = await fetchTeamPublic(teamId, { signal: controller.signal });
        if (!active || controller.signal.aborted) {
          return;
        }
        setTeam(result && typeof result === "object" ? result : null);
        setStatus("ready");
      } catch (err) {
        if (!active || controller.signal.aborted) {
          return;
        }
        setStatus("error");
        if (err instanceof ApiError) {
          setError(err.message || participantData.dashboard.errorTitle);
        } else {
          setError(participantData.dashboard.errorTitle);
        }
      }
    }

    load();
    return () => {
      active = false;
      controller.abort();
    };
  }, [teamId]);

  const headerName = team?.name || user?.team?.name || user?.name || "My Team";
  const logoSrc = toImageSrc(team?.logo);
  const challenge = team?.challenge && typeof team.challenge === "object" ? team.challenge : null;
  const project = team?.project && typeof team.project === "object" ? team.project : null;
  const students = Array.isArray(team?.students) ? team.students : [];

  return (
    <div className="participant-dashboard" ref={pageRef}>
      <header className="participant-dashboard-header" data-reveal-item>
        <div className="participant-dashboard-team">
          <div className="participant-dashboard-logo">
            {logoSrc ? (
              <img
                src={logoSrc}
                alt={`${headerName} logo`}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <span className="participant-dashboard-logo-placeholder" aria-hidden="true" />
            )}
          </div>
          <div>
            <p className="eyebrow">{participantData.dashboard.title}</p>
            <h2 className="participant-dashboard-name">{headerName}</h2>
            {team?.status ? (
              <span className="participant-dashboard-status">{team.status}</span>
            ) : null}
          </div>
        </div>
      </header>

      {status === "loading" && (
        <div className="participant-state" role="status">
          <span className="team-state-spinner" aria-hidden="true" />
          <p>{participantData.dashboard.loadingTeam}</p>
        </div>
      )}

      {status === "error" && (
        <div className="participant-state participant-state--error" role="alert">
          <p className="participant-state-title">{participantData.dashboard.errorTitle}</p>
          <p className="participant-state-text">{error}</p>
        </div>
      )}

      {status === "ready" && (
        <>
          <section className="participant-card" data-reveal-item>
            <header className="participant-card-header">
              <h3 className="participant-card-title">{participantData.dashboard.sections.challenge}</h3>
            </header>
            {challenge && challenge.challengeId && challenge.challengeId !== 0 ? (
              <div className="participant-challenge">
                {challenge.image ? (
                  <div className="participant-challenge-image">
                    <img
                      src={toImageSrc(challenge.image) || ""}
                      alt={challenge.title || "Challenge"}
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                ) : null}
                <div>
                  <h4 className="participant-challenge-title">{challenge.title}</h4>
                  {challenge.source || challenge.season ? (
                    <p className="participant-challenge-meta">
                      {[challenge.source, challenge.season].filter(Boolean).join(" • ")}
                    </p>
                  ) : null}
                  {challenge.description ? (
                    <p className="participant-challenge-desc">{challenge.description}</p>
                  ) : null}
                </div>
              </div>
            ) : (
              <p className="participant-muted">{participantData.dashboard.noChallenge}</p>
            )}
          </section>

          <section className="participant-card" data-reveal-item>
            <header className="participant-card-header">
              <h3 className="participant-card-title">{participantData.dashboard.sections.project}</h3>
            </header>
            {project && (project.title || project.description || project.repositoryLink || project.demoLink) ? (
              <div>
                {project.title ? <h4 className="participant-project-title">{project.title}</h4> : null}
                {project.description ? <p className="participant-project-desc">{project.description}</p> : null}
                <div className="participant-project-links">
                  {isHttpUrl(project.repositoryLink) ? (
                    <a
                      href={project.repositoryLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn participant-link"
                    >
                      {participantData.dashboard.project.repository}
                      <ArrowRightIcon size={16} />
                    </a>
                  ) : null}
                  {isHttpUrl(project.demoLink) ? (
                    <a
                      href={project.demoLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn participant-link"
                    >
                      {participantData.dashboard.project.demo}
                      <ArrowRightIcon size={16} />
                    </a>
                  ) : null}
                </div>
              </div>
            ) : (
              <p className="participant-muted">{participantData.dashboard.noProject}</p>
            )}
          </section>

          <section className="participant-card" data-reveal-item>
            <header className="participant-card-header">
              <h3 className="participant-card-title">{participantData.dashboard.sections.members}</h3>
            </header>
            {students.length > 0 ? (
              <ul className="participant-members">
                {students.map((student, index) => (
                  <li className="participant-member" key={student.studentId || index}>
                    <span className="participant-member-dot" aria-hidden="true" />
                    <div>
                      <p className="participant-member-name">{student.name || "—"}</p>
                      {student.status ? <p className="participant-member-status">{student.status}</p> : null}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="participant-muted">{participantData.dashboard.noMembers}</p>
            )}
          </section>

          <section className="participant-card" data-reveal-item>
            <header className="participant-card-header">
              <h3 className="participant-card-title">{participantData.dashboard.sections.quickLinks}</h3>
            </header>
            <div className="participant-quick">
              <Link to="/participant/game" className="btn participant-quick-btn">
                {participantData.dashboard.links.game}
                <ArrowRightIcon size={16} />
              </Link>
              <Link to="/participant/requests" className="btn participant-quick-btn">
                {participantData.dashboard.links.requests}
                <ArrowRightIcon size={16} />
              </Link>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
