import { useRef, useState } from "react";
import "./CoreTeam.css";

import { coreTeam } from "../../../data/homepageData";
import { getInitials } from "../../../utils/initials";
import { toImageSrc } from "../../../utils/image";
import { useRevealGroup } from "../../../hooks/useReveal";
import DataState from "../../common/DataState/DataState";

/**
 * Core Team section (GET /core-team).
 *
 * The page normalises the public response, so this section only paints real
 * members. A ready-but-empty response gets an explicit empty state rather than
 * placeholder people; a missing or broken photo falls back to initials.
 */
function TeamMember({ member }) {
  const [imageFailed, setImageFailed] = useState(false);
  const imageSrc = toImageSrc(member.photo);
  const showImage = Boolean(imageSrc) && !imageFailed;
  const alt = member.memberType
    ? `${member.name}, ${member.memberType}`
    : member.name;

  return (
    <li className="team-member" data-reveal-item>
      <span className="team-avatar">
        {showImage ? (
          <img
            className="team-avatar-image"
            src={imageSrc}
            alt={alt}
            loading="lazy"
            decoding="async"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <span className="team-avatar-placeholder" aria-hidden="true">
            {getInitials(member.name)}
          </span>
        )}
      </span>

      <h3 className="team-name">{member.name}</h3>
      {member.memberType ? (
        <p className="team-role">{member.memberType}</p>
      ) : null}
    </li>
  );
}

export default function CoreTeam({
  status,
  members = [],
  error,
  onRetry,
}) {
  const sectionRef = useRef(null);

  useRevealGroup(sectionRef, { stagger: 80 });

  return (
    <section
      className="section section--dark core-team"
      ref={sectionRef}
      aria-labelledby="core-team-title"
    >
      <div className="container">
        <header className="core-team-header" data-reveal-item>
          <div className="core-team-header-text">
            <p className="eyebrow">{coreTeam.eyebrow}</p>

            <h2 id="core-team-title" className="section-title">
              {coreTeam.title}
            </h2>
          </div>

          <p className="section-desc core-team-description">
            {coreTeam.description}
          </p>
        </header>

        <div className="core-team-content">
          {status === "loading" ? (
            <DataState
              status="loading"
              title={coreTeam.states.loading}
              tone="dark"
              compact
            />
          ) : null}

          {status === "error" ? (
            <DataState
              status="error"
              title={coreTeam.states.errorTitle}
              message={error?.message}
              retryLabel={coreTeam.states.retry}
              onRetry={onRetry}
              tone="dark"
              compact
            />
          ) : null}

          {status === "ready" && members.length === 0 ? (
            <DataState
              status="empty"
              title={coreTeam.states.emptyTitle}
              message={coreTeam.states.emptyMessage}
              tone="dark"
              compact
            />
          ) : null}

          {status === "ready" && members.length > 0 ? (
            <ul className="team-grid">
              {members.map((member) => (
                <TeamMember key={member.key} member={member} />
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </section>
  );
}
