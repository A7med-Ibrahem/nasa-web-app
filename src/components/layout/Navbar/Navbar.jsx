import { useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import "./Navbar.css";

import { useAuth } from "../../../auth/useAuth";
import { staffData } from "../../../data/staffData";
import { navigationLinks, site } from "../../../data/site";
import useEscapeKey from "../../../hooks/useEscapeKey";
import { useRevealGroup } from "../../../hooks/useReveal";
import { CloseIcon, MenuIcon } from "../../common/Icons/Icons";

/*
 * A hash href ("#section") is an in-page anchor rather than a route, so it
 * stays a plain anchor and lets the browser's own scroll behaviour handle it.
 * Every other item goes through NavLink, which sets `aria-current="page"` on
 * the matching item — the single source of truth the existing
 * `.navbar-link[aria-current="page"]` and
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

  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  /* Signed-out visitors get exactly the navigation that has always been here.
     A signed-in session swaps the Login entry for the area that account can
     actually use — the Judge Dashboard for the Judge role, nothing extra for
     other staff roles — plus a sign-out action. The role itself comes from
     the backend session, never from anything typed into this app. */
  const baseLinks = isAuthenticated
    ? navigationLinks.filter((link) => link.id !== "login")
    : navigationLinks;

  const visibleLinks = (() => {
    if (!isAuthenticated || !user?.role) {
      return baseLinks;
    }
    if (user.role === "Judge") {
      return [
        ...baseLinks,
        { id: "judge", label: "Judge Dashboard", href: "/judge" },
        {
          id: "staff",
          label: staffData.roles.staff,
          href: "/staff",
        },
      ];
    }
    if (user.role === "Participant") {
      return [...baseLinks, { id: "participant", label: "My Team", href: "/participant/dashboard" }];
    }
    if (user.role === "Admin") {
      return [
        ...baseLinks,
        { id: "admin", label: "Admin", href: "/admin" },
        { id: "staff", label: staffData.roles.staff, href: "/staff" },
      ];
    }
    if (user.role === "CoreTeam") {
      return [
        ...baseLinks,
        { id: "staff", label: staffData.roles.staff, href: "/staff" },
      ];
    }
    return baseLinks;
  })();

  function closeMenu() {
    setIsMenuOpen(false);
    menuButtonRef.current?.focus();
  }

  function handleSignOut() {
    logout();
    setIsMenuOpen(false);
    navigate("/login", { replace: true });
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
          {visibleLinks.map((link) => (
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

          {isAuthenticated && (
            <button type="button" className="navbar-signout" onClick={handleSignOut}>
              Sign out
            </button>
          )}

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
          {visibleLinks.map((link) => (
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
          {isAuthenticated && (
            <li>
              <button
                type="button"
                className="navbar-mobile-link navbar-mobile-signout"
                onClick={handleSignOut}
              >
                Sign out
              </button>
            </li>
          )}
        </ul>
      </div>
    </header>
  );
}