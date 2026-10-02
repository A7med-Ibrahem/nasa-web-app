import { useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import "./Navbar.css";

import { navigationLinks, site } from "../../../data/site";
import useEscapeKey from "../../../hooks/useEscapeKey";
import { useRevealGroup } from "../../../hooks/useReveal";
import { CloseIcon, MenuIcon } from "../../common/Icons/Icons";

/*
 * In-page anchors (About -> #about) are not routes, so they stay plain anchors
 * and let the browser's own scroll behaviour handle them. Everything else goes
 * through NavLink, which sets `aria-current="page"` on the matching item — the
 * single source of truth the existing `.navbar-link[aria-current="page"]` and
 * `.navbar-mobile-link[aria-current="page"]` styles already key off.
 */
function NavItem({ link, className, onNavigate }) {
  if (link.href.startsWith("#")) {
    return (
      <a href={link.href} className={className} onClick={onNavigate}>
        {link.label}
      </a>
    );
  }

  return (
    <NavLink to={link.href} className={className} onClick={onNavigate}>
      {link.label}
    </NavLink>
  );
}

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuButtonRef = useRef(null);
  const innerRef = useRef(null);

  function closeMenu() {
    setIsMenuOpen(false);
    menuButtonRef.current?.focus();
  }

  useEscapeKey(isMenuOpen, closeMenu);
  useRevealGroup(innerRef, { stagger: 90, rootMargin: "0px" });

  return (
    <header className="navbar">
      <nav className="navbar-inner" ref={innerRef} aria-label="Main navigation">
        <Link to="/" className="navbar-brand" data-reveal-item>
          <span className="logo-frame navbar-logo-frame">
            <img src={site.logo} alt={site.logoAlt} className="navbar-logo" />
          </span>
        </Link>

        <ul className="navbar-links" data-reveal-item>
          {navigationLinks.map((link) => (
            <li key={link.id}>
              <NavItem link={link} className="navbar-link" />
            </li>
          ))}
        </ul>

        <div className="navbar-actions" data-reveal-item>
          <Link to="/live-standings" className="navbar-pill">
            <span className="navbar-pill-dot" aria-hidden="true" />
            Live Standings
          </Link>

          <button
            ref={menuButtonRef}
            type="button"
            className="navbar-toggle"
            aria-expanded={isMenuOpen}
            aria-controls="navbar-mobile-menu"
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            <span className="visually-hidden">
              {isMenuOpen ? "Close menu" : "Open menu"}
            </span>
            {isMenuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </nav>

      <div
        id="navbar-mobile-menu"
        className="navbar-mobile"
        data-open={isMenuOpen ? "true" : "false"}
        hidden={!isMenuOpen}
      >
        <ul className="navbar-mobile-links">
          {navigationLinks.map((link) => (
            <li key={link.id}>
              <NavItem
                link={link}
                className="navbar-mobile-link"
                onNavigate={() => setIsMenuOpen(false)}
              />
            </li>
          ))}
          <li>
            <Link
              to="/live-standings"
              className="navbar-mobile-link navbar-mobile-link--pill"
              onClick={() => setIsMenuOpen(false)}
            >
              <span className="navbar-pill-dot" aria-hidden="true" />
              Live Standings
            </Link>
          </li>
        </ul>
      </div>
    </header>
  );
}