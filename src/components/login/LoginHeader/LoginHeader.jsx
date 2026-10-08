import { Link } from "react-router-dom";
import "./LoginHeader.css";

import { ArrowLeftIcon, MapPinIcon } from "../../common/Icons/Icons";
import { loginPage } from "../../../data/loginData";

/**
 * Compact header for the login screen.
 *
 * The login page renders outside MainLayout, so it owns this small header
 * instead of the main Navbar: brand lockup + local event marker on the left,
 * "Back to Event" on the right. Both navigate through React Router — never
 * `window.location`.
 */
export default function LoginHeader() {
  const { brand, location, locationLabel, back } = loginPage.header;

  return (
    <header className="login-header">
      <div className="container login-header-inner">
        <p className="login-header-brand">
          <span className="login-header-brand-name">{brand}</span>
          <span className="login-header-rule" aria-hidden="true" />
          <span className="login-header-location">
            <span className="login-header-city">
              <MapPinIcon size={15} />
              {location}
            </span>
            <span className="login-header-local">{locationLabel}</span>
          </span>
        </p>

        <Link to={back.href} className="login-header-back">
          <ArrowLeftIcon size={16} />
          <span>{back.label}</span>
        </Link>
      </div>
    </header>
  );
}
