import { useRef } from "react";
import { Link } from "react-router-dom";
import "./Sponsors.css";

import { sponsors } from "../../../data/homepageData";
import DataState from "../../common/DataState/DataState";
import { ArrowRightIcon } from "../../common/Icons/Icons";
import SponsorTiers from "../../sponsors/SponsorTiers/SponsorTiers";
import { useRevealGroup } from "../../../hooks/useReveal";

/**
 * Sponsors section (GET /sponsors?includeInactive=false).
 *
 * The page orders and groups the records, so this section only paints: one
 * group per tier through the shared SponsorTiers component. A ready-but-empty
 * response hides the whole section, including its "View all" link.
 */
export default function Sponsors({ status, tiers, error, onRetry }) {
  const sectionRef = useRef(null);

  useRevealGroup(sectionRef, { stagger: 70 });

  if (status === "ready" && tiers.length === 0) {
    return null;
  }

  return (
    <section
      className="section section--light sponsors"
      ref={sectionRef}
      aria-labelledby="sponsors-title"
    >
      <div className="container sponsors-inner">
        <div className="sponsors-text" data-reveal-item data-reveal-variant="left">
          <p className="eyebrow">{sponsors.eyebrow}</p>

          <h2 id="sponsors-title" className="section-title">
            {sponsors.title}
          </h2>

          <p className="section-desc sponsors-description">{sponsors.description}</p>

          {status === "ready" && tiers.length > 0 ? (
            <Link
              to={sponsors.action.href}
              className="arrow-link arrow-link--on-light sponsors-action"
            >
              {sponsors.action.label}
              <ArrowRightIcon size={16} />
            </Link>
          ) : null}
        </div>

        <div className="sponsors-content">
          {status === "loading" ? (
            <DataState
              status="loading"
              title={sponsors.states.loading}
              tone="light"
              compact
            />
          ) : null}

          {status === "error" ? (
            <DataState
              status="error"
              title={sponsors.states.errorTitle}
              message={error?.message}
              retryLabel={sponsors.states.retry}
              onRetry={onRetry}
              tone="light"
              compact
            />
          ) : null}

          {status === "ready" && tiers.length > 0 ? (
            <SponsorTiers
              tiers={tiers}
              newTabHint={sponsors.newTabHint}
            />
          ) : null}
        </div>
      </div>
    </section>
  );
}
