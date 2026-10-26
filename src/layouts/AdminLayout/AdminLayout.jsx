import { NavLink, Outlet } from "react-router-dom";
import "./AdminLayout.css";

import { adminData } from "../../data/adminData";

/**
 * Shell for the guarded /admin routes. Tabs come from a config array, so a
 * later task adds a page by adding one entry and one route — no markup change.
 */
export default function AdminLayout() {
  const { layout } = adminData;

  const tabClass = ({ isActive }) =>
    isActive ? "admin-tab is-active" : "admin-tab";

  return (
    <div className="admin-layout">
      <div className="admin-layout-header">
        <div className="container admin-layout-header-inner">
          <div>
            <p className="eyebrow">{layout.eyebrow}</p>
            <h1 className="admin-layout-title">{layout.title}</h1>
          </div>
          <nav className="admin-tabs" aria-label="Admin sections">
            {layout.tabs.map((tab) => (
              <NavLink key={tab.id} to={tab.to} end className={tabClass}>
                {tab.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      <div className="admin-layout-main">
        <div className="container">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
