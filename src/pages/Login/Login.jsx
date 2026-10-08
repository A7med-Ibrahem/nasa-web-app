import { useEffect, useRef } from "react";
import "./Login.css";

import LoginHeader from "../../components/login/LoginHeader/LoginHeader";
import LoginHero from "../../components/login/LoginHero/LoginHero";
import LoginForm from "../../components/login/LoginForm/LoginForm";
import { loginPage } from "../../data/loginData";
import { site } from "../../data/site";
import { useRevealGroup } from "../../hooks/useReveal";

/**
 * Organizer & Judge login page (`/login`).
 *
 * Rendered as a sibling of the MainLayout route rather than inside it: the
 * reference is a full-screen login experience with its own compact header,
 * so the main Navbar and Footer do not appear here. Both "Back to Event"
 * actions return to the event homepage through React Router.
 *
 * The sign-in flow stops at client-side validation — the page prepares the
 * `{ identifier, password, rememberMe }` payload for a future auth endpoint
 * and explicitly does not authenticate, persist credentials or navigate to a
 * dashboard (none exists yet).
 *
 * One reveal cascade spans the intro and the card, so the staggered entrance
 * reads as a single composed page load.
 */
export default function Login() {
  const layoutRef = useRef(null);

  useRevealGroup(layoutRef, { stagger: 100 });

  /* Entering the page behaves like a fresh load: start at the top and hand
     the document a title, exactly as every other page does. */
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    document.title = `${loginPage.card.title} — ${site.name}`;
  }, []);

  return (
    <div className="login-page">
      {/* The shared .skip-link styles live in MainLayout.css; every
          stylesheet is bundled into one document, so the class resolves here
          too. */}
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      <LoginHeader />

      <main id="main-content" className="login-main">
        <div className="container login-layout" ref={layoutRef}>
          <LoginHero />
          <LoginForm />
        </div>
      </main>
    </div>
  );
}
