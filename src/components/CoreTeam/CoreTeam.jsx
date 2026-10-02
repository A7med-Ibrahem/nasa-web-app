import "./CoreTeam.css";

import { coreTeam } from "../../data/homepageData";

function initialsOf(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function TeamMember({ member }) {
  const { name, role, image } = member;

  return (
    <li className="team-member">
      <span className="team-avatar">
        {image ? (
          <img className="team-avatar-image" src={image} alt={`${name}, ${role}`} loading="lazy" decoding="async" />
        ) : (
          /* Neutral stand-in until real portraits are supplied. */
          <span className="team-avatar-placeholder" aria-hidden="true">
            {initialsOf(name)}
          </span>
        )}
      </span>

      <h3 className="team-name">{name}</h3>
      <p className="team-role">{role}</p>
    </li>
  );
}

export default function CoreTeam() {
  return (
    <section className="section section--dark core-team" aria-labelledby="core-team-title">
      <div className="container">
        <header className="core-team-header">
          <div className="core-team-header-text">
            <p className="eyebrow">{coreTeam.eyebrow}</p>

            <h2 id="core-team-title" className="section-title">
              {coreTeam.title}
            </h2>
          </div>

          <p className="section-desc core-team-description">{coreTeam.description}</p>
        </header>

        <ul className="team-grid">
          {coreTeam.members.map((member) => (
            <TeamMember key={member.id} member={member} />
          ))}
        </ul>
      </div>
    </section>
  );
}