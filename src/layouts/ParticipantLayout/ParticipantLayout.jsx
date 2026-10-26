import { NavLink, Outlet } from "react-router-dom";
import "./ParticipantLayout.css";

import { participantData } from "../../data/participantData";

export default function ParticipantLayout() {
  return (
    <div className="participant-layout">
      <div className="participant-layout-header">
        <div className="container participant-layout-header-inner">
          <div>
            <p className="eyebrow">Participant</p>
            <h1 className="participant-layout-title">Team Portal</h1>
          </div>
          <nav className="participant-tabs" aria-label="Participant sections">
            <NavLink
              to="/participant/dashboard"
              className={({ isActive }) =>
                isActive ? "participant-tab is-active" : "participant-tab"
              }
            >
              {participantData.layout.tabs.dashboard}
            </NavLink>
            <NavLink
              to="/participant/game"
              className={({ isActive }) =>
                isActive ? "participant-tab is-active" : "participant-tab"
              }
            >
              {participantData.layout.tabs.game}
            </NavLink>
            <NavLink
              to="/participant/requests"
              className={({ isActive }) =>
                isActive ? "participant-tab is-active" : "participant-tab"
              }
            >
              {participantData.layout.tabs.requests}
            </NavLink>
          </nav>
        </div>
      </div>
      <main className="participant-layout-main">
        <div className="container">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
