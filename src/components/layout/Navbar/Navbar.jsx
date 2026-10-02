import { useRef, useState } from "react";
import "./Navbar.css";

import { navigationLinks, site } from "../../../data/site";
import useEscapeKey from "../../../hooks/useEscapeKey";
import { useRevealGroup } from "../../../hooks/useReveal";
import { CloseIcon, MenuIcon } from "../../common/Icons/Icons";

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
        <a href="/" className="navbar-brand" data-reveal-item>
          <span className="logo-frame navbar-logo-frame">
            <img src={site.logo} alt={site.logoAlt} className="navbar-logo" />
          </span>
        </a>

        <ul className="navbar-links" data-reveal-item>
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

        <div className="navbar-actions" data-reveal-item>
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