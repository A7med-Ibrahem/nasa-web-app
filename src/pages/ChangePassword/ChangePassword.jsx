import { useEffect, useRef } from "react";
import "./ChangePassword.css";

import ChangePasswordForm from "../../components/account/ChangePasswordForm/ChangePasswordForm";
import { accountData } from "../../data/accountData";
import { site } from "../../data/site";
import { useRevealGroup } from "../../hooks/useReveal";

/**
 * Authenticated account page (`/account/password`).
 *
 * Available to every signed-in role through RequireAuth, without a role gate:
 * Admin, CoreTeam, Judge and Participant accounts all use the same endpoint.
 */
export default function ChangePassword() {
  const pageRef = useRef(null);
  const t = accountData.changePassword;

  useRevealGroup(pageRef, { stagger: 80 });

  useEffect(() => {
    document.title = `${t.title} — ${site.name}`;
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [t.title]);

  return (
    <div className="change-password-page" ref={pageRef}>
      <header className="change-password-header">
        <div className="container change-password-header-inner">
          <div data-reveal-item>
            <p className="eyebrow">{t.eyebrow}</p>
            <h1 className="change-password-title">{t.title}</h1>
            <p className="change-password-description">{t.description}</p>
          </div>
        </div>
      </header>

      <div className="change-password-main">
        <div className="container change-password-layout">
          <ChangePasswordForm />
        </div>
      </div>
    </div>
  );
}
