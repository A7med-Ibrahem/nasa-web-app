import "./CoreTeam.css";

function CoreTeam() {
  const team = [
    {
      name: "Team Member",
      role: "Event Lead",
    },
    {
      name: "Team Member",
      role: "Event Coordinator",
    },
    {
      name: "Team Member",
      role: "Community Lead",
    },
    {
      name: "Team Member",
      role: "Technical Lead",
    },
  ];

  return (
    <section className="core-team">
      <div className="core-team-container">

        <div className="core-team-header">
          <p className="core-team-label">OUR CORE TEAM</p>

          <h2>The people behind the mission</h2>

          <p className="core-team-description">
            A passionate team of organizers, mentors and volunteers working to make NASA Space Apps Hurghada a success.
          </p>
        </div>

        <div className="team-grid">
          {team.map((member, index) => (
            <div className="team-card" key={index}>

              <div className="team-image">
                <div className="team-image-placeholder">
                  {member.name.charAt(0)}
                </div>
              </div>

              <div className="team-info">
                <h3>{member.name}</h3>
                <p>{member.role}</p>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

export default CoreTeam;