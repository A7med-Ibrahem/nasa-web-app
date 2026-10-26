import { NavLink, Outlet } from "react-router-dom";
import "./StaffLayout.css";

import { useAuth } from "../../auth/useAuth";
import { staffData } from "../../data/staffData";

/**
 * Shell for the guarded staff routes. Same tabbed composition as the
 * participant layout; the Check-in tab is only rendered for CoreTeam because
 * the endpoint behind it is CoreTeamOnly.
 */
export default function StaffLayout() {
  const { user } = useAuth();
  const { layout } = staffData;
  const isCoreTeam = user?.role === "CoreTeam";

  const tabClass = ({ isActive }) =>
    isActive ? "staff-tab is-active" : "staff-tab";

  return (
    <div className="staff-layout">
      <div className="staff-layout-header">
        <div className="container staff-layout-header-inner">
          <div>
            <p className="eyebrow">{layout.eyebrow}</p>
            <h1 className="staff-layout-title">{layout.title}</h1>
          </div>
          <nav className="staff-tabs" aria-label="Staff sections">
            <NavLink to="/staff/requests" className={tabClass}>
              {layout.tabs.requests}
            </NavLink>
            <NavLink to="/staff/attendance" end className={tabClass}>
              {layout.tabs.attendance}
            </NavLink>
            {isCoreTeam ? (
              <NavLink to="/staff/attendance/check-in" end className={tabClass}>
                {layout.tabs.checkIn}
              </NavLink>
            ) : null}
            <NavLink to="/staff/teams" className={tabClass}>
              {layout.tabs.teams}
            </NavLink>
          </nav>
        </div>
      </div>
      <div className="staff-layout-main">
        <div className="container">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
