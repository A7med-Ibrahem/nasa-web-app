import { useEffect, useRef, useState } from "react";
import "./Navbar.css";

import nasaLogo from "../../assets/images/nasa-logo.png";
import { navigationLinks, site } from "../../data/homepageData";
import { CloseIcon, MenuIcon } from "../Icons/Icons";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuButtonRef = useRef(null);

  useEffect(() => {
    if (!isMenuOpen) return undefined;

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isMenuOpen]);

  return (
    <header className="navbar">
      <nav className="navbar-inner" aria-label="Main navigation">
        <a href="/" className="navbar-brand">
          <span className="logo-frame navbar-logo-frame">
            <img src={nasaLogo} alt={site.name} className="navbar-logo" />
          </span>
        </a>

        <ul className="navbar-links">
          {navigationLinks.map((link) => (
            <li key={link.id}>
              {/*
                `aria-current` is the single source of truth for the active
                link, so wiring a router later only requires replacing
                `currentPageId` — no markup change.
              */}
              <a
                href={link.href}
                className="navbar-link"
                aria-current={link.id === "home" ? "page" : undefined}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="navbar-actions">
          <a href="/standings" className="navbar-pill">
            <span className="navbar-pill-dot" aria-hidden="true" />
            Live Standings
          </a>

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
              <a
                href={link.href}
                className="navbar-mobile-link"
                aria-current={link.id === "home" ? "page" : undefined}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </a>
            </li>
          ))}
          <li>
            <a
              href="/standings"
              className="navbar-mobile-link navbar-mobile-link--pill"
              onClick={() => setIsMenuOpen(false)}
            >
              <span className="navbar-pill-dot" aria-hidden="true" />
              Live Standings
            </a>
          </li>
        </ul>
      </div>
    </header>
  );
}