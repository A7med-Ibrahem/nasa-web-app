import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import "./MainLayout.css";

import Footer from "../../components/layout/Footer/Footer";
import Navbar from "../../components/layout/Navbar/Navbar";

/**
 * Application shell shared by every page.
 *
 * Owns the landmarks (skip link, header, main, footer) and the persistent
 * chrome. Pages supply only their own content, so a page such as Live
 * Standings automatically inherits the same Navbar and Footer without
 * duplicating anything. As a router layout route it renders <Outlet />, which
 * keeps the Navbar and Footer mounted across navigations instead of remounting
 * them on every page change.
 */
export default function MainLayout() {
  const { pathname, hash } = useLocation();

  /*
   * A new page should start at its own top, exactly as a full page load would.
   * Hash links are excluded: those are in-page anchors (About -> #about) and
   * must keep the browser's native scroll-to-anchor behaviour.
   *
   * `instant` overrides the global `scroll-behavior: smooth`, which otherwise
   * animates the jump.
   */
  useEffect(() => {
    if (hash) {
      return;
    }
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname, hash]);

  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      <Navbar />

      <main id="main-content" className="layout-main">
        <Outlet />
      </main>

      <Footer />
    </>
  );
}